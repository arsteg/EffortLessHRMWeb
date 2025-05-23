import { Component, TrackByFunction } from '@angular/core';
import * as moment from 'moment';
import { MatDialog } from '@angular/material/dialog';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { CommonService } from 'src/app/_services/common.Service';
import { EmployeeAttendanceHistoryComponent } from './employee-attendance-history/employee-attendance-history.component';
import { UploadRecordsComponent } from './upload-records/upload-records.component';
import { AttendanceService } from 'src/app/_services/attendance.service';
import { LeaveService } from 'src/app/_services/leave.service';
import { CompanyService } from 'src/app/_services/company.service';
import { forkJoin, map } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import * as XLSX from 'xlsx';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-attendance-records',
  templateUrl: './attendance-records.component.html',
  styleUrl: './attendance-records.component.css'
})

export class AttendanceRecordsComponent {
  isEdit: boolean;
  searchText: string = '';
  closeResult: string = '';
  changeMode: 'Add' | 'Update' = 'Add';
  attendanceRecords: any[] = [];
  users: any[] = [];
  selectedAttendanceRecord: any;
  filteredAttendanceRecords = [];
  groupedAttendanceRecords: any;
  selectedMonth: number = new Date().getMonth() + 1;
  currentMonthDates: Date[] = [];
  public sortOrder: string = '';

  months = [
    { name: 'January', value: 1 },
    { name: 'February', value: 2 },
    { name: 'March', value: 3 },
    { name: 'April', value: 4 },
    { name: 'May', value: 5 },
    { name: 'June', value: 6 },
    { name: 'July', value: 7 },
    { name: 'August', value: 8 },
    { name: 'September', value: 9 },
    { name: 'October', value: 10 },
    { name: 'November', value: 11 },
    { name: 'December', value: 12 }
  ];

  fullDayDuration: number | null = null;
  halfDayDuration: number | null = null;

  years: number[] = [];
  selectedYear: number;
  leave: any;
  holidays: any;
  selectedUser: any;

  attendanceData = [];

  constructor(private modalService: NgbModal,
    private dialog: MatDialog,
    private commonService: CommonService,
    private attendanceService: AttendanceService,
    private leaveService: LeaveService,
    private companyService: CompanyService,
    private translate: TranslateService,
    private toast: ToastrService
  ) { }

  ngOnInit() {
    this.generateYearList();

    forkJoin({
      users: this.commonService.populateUsers(),
      attendance: this.getAttendanceByMonth(),
      details: this.getDetails(),
      holidays: this.getHolidays()
    }).subscribe({
      next: (results: { users: any; attendance: any; details: any; holidays: any }) => {
        this.users = results.users.data.data;
        this.groupedAttendanceRecords = this.groupAttendanceByUser(results.attendance);
        this.leave = results.details.data.filter(leave => leave.status == 'Approved');
        this.holidays = results.holidays.data;
      },
      error: (error) => {
        console.error('An error occurred:', error);
      }
    });
    this.loadDatesForSelectedMonth();
  }

 
  downloadAttendance() {
    this.translate.get([
      'attendance.default_headers',
      'attendance.sheet_names',
      'attendance.instructions_title',
      'attendance.note_use_sheet_name',
      'attendance.note_use_correct_format',
      'attendance.note_no_column_change',
      'attendance.note_fields_required',
      'attendance.note_fill_and_upload',
      'attendance.instructions_table'
    ]).subscribe((translations: any) => {
  
      // 1. Sheet names from translations
      const sheetNames = translations['attendance.sheet_names'];
      const attendanceSheetName = sheetNames['data'];
      const instructionSheetName = sheetNames['instructions'];
  
      // 2. Use headers from translations
      const defaultAttendanceHeaders = translations['attendance.default_headers'];
      const attendanceSheet = XLSX.utils.json_to_sheet(
        this.attendanceData.length ? this.attendanceData : defaultAttendanceHeaders
      );
    // 3. Set column widths only (not formatting here)
      attendanceSheet['!cols'] = [
        { wch: 10 }, // EmpCode
        { wch: 15 }, // Date
        { wch: 10 }, // StartTime
        { wch: 10 }, // EndTime
      ];

      // 4. Force all Date column values to be text formatted
      Object.keys(attendanceSheet).forEach(cell => {
        if (cell.startsWith('B') && cell !== 'B1') { // Column B is Date
          const cellObj = attendanceSheet[cell];

          // Only apply if value exists
          if (cellObj && typeof cellObj.v === 'string') {
            cellObj.t = 's';    // Set cell type to string
            cellObj.z = '@';    // Format as plain text
          }
        }
      });
      // 3. Prepare instructions sheet
      const instructionSheet: any = {};
      const notes = [
        translations['attendance.instructions_title'],
        translations['attendance.note_use_sheet_name'],
        translations['attendance.note_use_correct_format'],
        translations['attendance.note_no_column_change'],
        translations['attendance.note_fields_required'],
        translations['attendance.note_fill_and_upload']
      ];
  
      notes.forEach((note: string, index: number) => {
        const cellRef = `A${index + 1}`;
        instructionSheet[cellRef] = { t: 's', v: note };
      });
  
      // 4. Add instruction table (Field | Data Type | Sample Value)
      const instructionData = translations['attendance.instructions_table'];
      XLSX.utils.sheet_add_json(instructionSheet, instructionData, {
        origin: `A${notes.length + 2}`,
        skipHeader: false
      });
  
      // 5. Manually define sheet range
      const totalRows = notes.length + instructionData.length + 3;
      instructionSheet['!ref'] = `A1:C${totalRows}`;
  
      // 6. Create and export workbook
      const workbook: XLSX.WorkBook = {
        Sheets: {
          [attendanceSheetName]: attendanceSheet,
          [instructionSheetName]: instructionSheet
        },
        SheetNames: [attendanceSheetName, instructionSheetName]
      };
  
      const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
  
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'attendance_template.xlsx';
      link.click();
    });
  }
  
  uploadAttendance(event: any) {
    const file = event.target.files[0];
    if (!file) return;
  
    // ✅ 1. Validate file type by extension
    const allowedExtensions = ['xlsx', 'xls'];
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
  
    if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
      this.toast.error(this.translate.instant('attendance.invalid_file_type'));
      return;
    }
  
    const reader = new FileReader();
  
    reader.onload = (e: any) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
  
      const expectedSheetName = this.translate.instant('attendance.sheet_names.data');
      const defaultHeaders = this.translate.instant('attendance.default_headers');
      const expectedHeaders: string[] = Object.keys(defaultHeaders[0]);
  
      // ✅ 2. Check if 'Attendance Data' sheet exists
      if (!workbook.SheetNames.includes(expectedSheetName)) {
        this.toast.error(this.translate.instant('attendance.sheet_not_found'));
        return;
      }
  
      const worksheet = workbook.Sheets[expectedSheetName];
      const parsedData: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '',  raw: false   
          // Forces text parsing instead of native types 
        });
  
      // ✅ 3. Remove empty rows
      const cleanedData = parsedData.filter(row =>
        Object.values(row).some(cell => String(cell).trim() !== '')
      );
  
      if (cleanedData.length === 0) {
        this.toast.warning(this.translate.instant('attendance.excel_empty_or_invalid'));
        return;
      }
  
      // ✅ 4. Validate headers
      const fileHeaders = Object.keys(cleanedData[0]);
      const allHeadersPresent = expectedHeaders.every(h => fileHeaders.includes(h));
      if (!allHeadersPresent) {
        this.toast.error(this.translate.instant('attendance.invalid_headers'));
        return;
      }
      // ✅ 5. Proceed with API call
      this.attendanceService.uploadAttendanceRecords(cleanedData).subscribe(
        (res: any) => {
          this.toast.success(this.translate.instant('attendance.upload_success'));
        },
        (error: any) => {
          const errorMessage = error?.error?.message || error?.message || error 
          ||this.translate.instant('attendance.upload_failed');
          this.toast.error(errorMessage, 'Error!');
        }
      );
    };
  
    reader.readAsArrayBuffer(file);
  } 
  

  parseCSV(csvData: string): any[] {
    const rows = csvData.split('\n').map(row => row.trim()).filter(row => row);
    if (rows.length < 2) return [];
  
    const header = rows[0].split(',').map(col => col.trim());
    return rows.slice(1).map(row => {
      const values = row.split(',').map(val => val.trim());
  
      // Convert date format to YYYY-MM-DD
      const formattedDate = this.formatDate(values[1]);
      return {
        EmpCode: values[0] || '',
        Date: formattedDate, // Ensure the correct date format
        StartTime: values[2] || '',
        EndTime: values[3] || ''
      };
    });
  }
  
  // Utility function to format date
  formatDate(dateString: string): string {
    const date = moment(dateString, [
      "YYYY-MM-DD", "DD/MM/YYYY", "MM/DD/YYYY", "DD-MM-YYYY", "MM-DD-YYYY"
    ], true);
  
    return date.isValid() ? date.format("YYYY-MM-DD") : '';
  }
  
  validateCSV(data: any[]): boolean {
    const requiredKeys = ['EmpCode', 'Date', 'StartTime', 'EndTime'];
    return data.every(row => requiredKeys.every(key => row.hasOwnProperty(key) && row[key] !== ''));
  }

  trackByDate: TrackByFunction<string> = (index: number, date: string): string => {
    return date;
  };

  closeModal() {
    this.modalService.dismissAll();
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }

  open(content: any) {
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', backdrop: 'static' }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  viewHistory(user: any) {
    const attendanceRecords = this.currentMonthDates.map(date => {
      return {
        status: this.getAttendanceStatus(user, date)
      };
    });

    // this.attendanceService.getShiftByUser(user.name).subscribe((res: any) => {
    //   const fullHours = parseInt(res.data.minHoursPerDayToGetCreditForFullDay.split(":")[0], 10);
    //   const halfHours = parseInt(res.data.minHoursPerDayToGetCreditforHalfDay.split(":")[0], 10);
    //   this.fullDayDuration = fullHours * 60;
    //   this.halfDayDuration = halfHours * 60;

    //   // Format the full day time based on your desired format
    //   const fullDayTime = this.formatFullDayTime(fullHours, 0);  // Example format: 08:00:00
    //   const halfDayTime = this.formatFullDayTime(halfHours, 0);
    //   const daysInMonth = new Date(this.selectedYear, this.selectedMonth, 0).getDate();
    //   // Create the selectedAttendanceRecord object
    //   this.selectedAttendanceRecord = {
    //     user: user.name,
    //     month: this.selectedMonth,
    //     year: this.selectedYear,
    //     records: attendanceRecords,
    //     name: this.getUser(user.name),
    //     shiftFullDayTime: fullDayTime,
    //     shiftHalfDayTime: halfDayTime,
    //     monthDays: daysInMonth
    //   };

    //   this.dialog.open(EmployeeAttendanceHistoryComponent, {
    //     data: this.selectedAttendanceRecord
    //   });
    // });
  }

  // Helper function to format full day time (optional, customize as needed)
  formatFullDayTime(hours: number, minutes: number): string {
    const formattedHours = hours.toString().padStart(2, '0');
    const formattedMinutes = minutes.toString().padStart(2, '0');
    return `${formattedHours}:${formattedMinutes}:00`;

  }
  uploadAttendanceRecord() {
    const dialogRef = this.dialog.open(UploadRecordsComponent, {
      width: '80%',
      height: '80%'
    });

    dialogRef.afterClosed().subscribe(result => {
    });
  }

  getUser(employeeId: string) {
    const matchingUser = this.users?.find(user => user._id === employeeId);
    return matchingUser ? `${matchingUser.firstName} ${matchingUser.lastName}` : 'N/A';
  }

  groupAttendanceByUser(records: any[]): any[] {
    const groupedRecords: any = {};

    records.forEach(record => {
      const user = record.user;
      const duration = record.duration;
      const userName = this.getUser(record.user);

      if (!groupedRecords[user]) {
        groupedRecords[user] = {
          name: user,
          userName: userName,
          attendance: []
        };
      }
      groupedRecords[user].attendance.push({
        date: record.date,
        duration: duration
      });
    });
    return Object.values(groupedRecords);
  }

  getAttendanceByMonth() {
    const payload = { skip: '', next: '1000000', month: this.selectedMonth, year: this.selectedYear };
    return this.attendanceService.getAttendanceRecordsByMonth(payload).pipe(
      map((res: any) => res.data)
    );
  }

  onMonthChange(event: any) {
    this.selectedMonth = event.value;
    this.loadDatesForSelectedMonth();
    this.getAttendanceByMonth().subscribe((attendance) => {
      this.groupedAttendanceRecords = this.groupAttendanceByUser(attendance);
    });
  }

  loadDatesForSelectedMonth() {
    const daysInMonth = new Date(this.selectedYear, this.selectedMonth, 0).getDate();

    this.currentMonthDates = [];
    for (let day = 1; day <= daysInMonth; day++) {
      this.currentMonthDates.push(new Date(this.selectedYear, this.selectedMonth - 1, day));
    }
  }

  generateYearList() {
    const currentYear = new Date().getFullYear();
    this.years = [currentYear - 1, currentYear, currentYear + 1];
    this.selectedYear = currentYear;
  }
  onYearChange(event: any) {
    this.selectedYear = event.value;
    this.loadDatesForSelectedMonth();
    this.getAttendanceByMonth().subscribe((attendance) => {
      this.groupedAttendanceRecords = this.groupAttendanceByUser(attendance);
    });
  }

  getAttendanceStatus(user: any, date: Date): string {
    const attendance = user.attendance.find((att: any) => new Date(att.date).toDateString() === date.toDateString());
    // this.getShiftByUser(user);
    const today = new Date();
    if (date > today) {
      // return 'notApplicable';
    }

    if (this.isDateOnLeave(user.name, date)) {
      return 'leave';
    }
    else if (this.isHolidayForUser(user, date)) {
      return 'holiday';
    }
    else if (!attendance) {
      return 'noRecord';
    }
    else if (attendance.duration > this.halfDayDuration && attendance.duration < this.fullDayDuration) {
      return 'incomplete';
    }
    else if (attendance.duration >= this.fullDayDuration) {
      return 'present';
    }
    else if (attendance.duration >= this.halfDayDuration) {
      return 'halfday';
    }
    else if (attendance.duration < this.halfDayDuration) {
      return 'incomplete halfday';
    }

    return 'N/A';
  }

  getDetails() {
    return this.leaveService.getLeaveApplication({ skip: '', next: '100000' });
  }

  isDateOnLeave(user: any, date: Date): boolean {
    if (!this.leave || this.leave.length === 0) {
      return false;
    }

    const userLeaves = this.leave.filter(leave => leave.employee === user);

    for (let leave of userLeaves) {
      const startDate = new Date(leave.startDate);
      const endDate = new Date(leave.endDate);

      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(0, 0, 0, 0);
      const compareDate = new Date(date);
      compareDate.setHours(0, 0, 0, 0);

      if (compareDate >= startDate && compareDate <= endDate) {
        return true;
      }
    }

    return false;
  }

  getHolidays() {
    let payload = { skip: '', next: '100000', year: this.selectedYear };
    return this.companyService.getHolidays(payload);
  }

  isHolidayForUser(user: any, date: Date): boolean {
    if (!this.holidays || this.holidays.length === 0) {
      return false;
    }

    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);

    for (let holiday of this.holidays) {
      const holidayDate = new Date(holiday.date);
      holidayDate.setHours(0, 0, 0, 0);

      if (holidayDate.getTime() === compareDate.getTime()) {
        if (Array.isArray(holiday.holidayapplicableEmployee)) {
          if (holiday.holidayapplicableEmployee.some((emp: any) => emp.user === user.name)) {
            return true;
          }
        }
      }
    }

    return false;
  }
}