import { Component, TrackByFunction, OnInit, ViewChild, TemplateRef, ElementRef } from '@angular/core';
import * as moment from 'moment';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { CommonService } from 'src/app/_services/common.Service';
import { EmployeeAttendanceHistoryComponent } from './employee-attendance-history/employee-attendance-history.component';
import { UploadRecordsComponent } from './upload-records/upload-records.component';
import { AttendanceService } from 'src/app/_services/attendance.service';
import { LeaveService } from 'src/app/_services/leave.service';
import { CompanyService } from 'src/app/_services/company.service';
import { forkJoin, map, Observable } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import * as XLSX from 'xlsx';
import { TranslateService } from '@ngx-translate/core';
import { PayrollService } from 'src/app/_services/payroll.service';
import { UserService } from 'src/app/_services/users.service';

@Component({
  selector: 'app-attendance-records',
  templateUrl: './attendance-records.component.html',
  styleUrl: './attendance-records.component.css'
})
export class AttendanceRecordsComponent implements OnInit {
  searchText: string = '';
  closeResult: string = '';
  attendanceRecords: any[] = [];
  users: any[] = [];
  selectedAttendanceRecord: any;
  groupedAttendanceRecords: any[] = [];
  selectedMonth: number = new Date().getMonth() + 1;
  currentMonthDates: Date[] = [];
  public sortOrder: string = '';
  attendanceTemplateAssignment: any;
  fullDayDuration: number = 0;
  halfDayDuration: number = 0;
  years: number[] = [];
  selectedYear: number;
  leave: any[] = [];
  holidays: any[] = [];
  selectedUser: any;
  attendanceData: any[] = [];
  shifts: any[];
  userEmployments: any[] = [];

  @ViewChild('uploadPopup') uploadPopup!: TemplateRef<any>;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  //showUploadPopup = false;
  uploadedRecords: any[] = [];
  processing = false;
  displayedColumns: string[] = ['select', 'EmpCode', 'Date', 'StartTime', 'EndTime', 'Status'];
  selectAll = true;
  dialogRef: MatDialogRef<any> | null = null;

  months = [
    { name: 'January', value: 1 }, { name: 'February', value: 2 }, { name: 'March', value: 3 },
    { name: 'April', value: 4 }, { name: 'May', value: 5 }, { name: 'June', value: 6 },
    { name: 'July', value: 7 }, { name: 'August', value: 8 }, { name: 'September', value: 9 },
    { name: 'October', value: 10 }, { name: 'November', value: 11 }, { name: 'December', value: 12 }
  ];

  constructor(private modalService: NgbModal,
    private payrollService: PayrollService,
    private dialog: MatDialog,
    private commonService: CommonService,
    private attendanceService: AttendanceService,
    private leaveService: LeaveService,
    private companyService: CompanyService,
    private translate: TranslateService,
    private toast: ToastrService,
    private userService: UserService
  ) { }

  ngOnInit() {
    this.generateYearList();
    this.loadDatesForSelectedMonth();
    forkJoin({
      users: this.commonService.populateUsers(),
      attendance: this.getAttendanceByMonth(),
      leaves: this.getLeaveDetails(),
      holidays: this.getHolidays(),
      shiftData: this.getShiftDetails(),
      attendanceTemplate: this.getAttendanceTemplateAssignment(),
      userEmployments: this.userService.getUserEmploymentByCompany()
    }).subscribe({
      next: (results: { users: any; attendance: any; leaves: any; holidays: any; shiftData: any, attendanceTemplate: any, userEmployments: any }) => {
        this.users = results.users.data.data;
        this.groupedAttendanceRecords = this.groupAttendanceByUser(results.attendance);
        this.leave = results.leaves.data.filter((l: any) => l.status === 'Approved');
        this.holidays = results.holidays.data;
        this.attendanceTemplateAssignment = results.attendanceTemplate.data;
        this.shifts = results.shiftData.data;
        this.userEmployments = results.userEmployments.data;
      },
      error: (error) => {
        this.toast.error(this.translate.instant('common.initial_data_load_error'));
      }
    });
  }


  parseHoursToMinutes(timeString: string): number {
    if (!timeString) return 0;
    const parts = timeString.split(':');
    if (parts.length < 2) return 0;
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    return (hours * 60) + minutes;
  }

  getAttendanceByMonth(): Observable<any[]> {
    const payload = { skip: '', next: '', month: this.selectedMonth, year: this.selectedYear };
    return this.attendanceService.getAttendanceRecordsByMonth(payload).pipe(
      map((res: any) => res.data)
    );
  }

  getLeaveDetails(): Observable<any> {
    return this.leaveService.getLeaveApplication({ skip: '', next: '100000' });
  }

  getHolidays(): Observable<any> {
    let payload = { skip: '', next: '100000', year: this.selectedYear };
    return this.companyService.getHolidays(payload);
  }

  getShiftDetails(): Observable<any> {
    let payload = { skip: '', next: '' };
    return this.attendanceService.getShiftAssignment(payload.skip, payload.next);
  }

  getAttendanceTemplateAssignment(): Observable<any> {
    let payload = { skip: '', next: '' };
    return this.attendanceService.getAttendanceAssignment(payload.skip, payload.next);
  }

  onMonthChange(event: any) {
    this.selectedMonth = event.value;
    this.loadDatesForSelectedMonth();
    this.fetchAndUpdateData();
  }

  onYearChange(event: any) {
    this.selectedYear = event.value;
    this.loadDatesForSelectedMonth();
    this.fetchAndUpdateData();
  }

  fetchAndUpdateData() {
    forkJoin({
      attendance: this.getAttendanceByMonth(),
      leaves: this.getLeaveDetails(),
      holidays: this.getHolidays(),
      shiftData: this.getShiftDetails(),
      attendanceTemplate: this.getAttendanceTemplateAssignment()
    }).subscribe({
      next: (results: { attendance: any; leaves: any; holidays: any; shiftData: any, attendanceTemplate: any }) => {
        this.groupedAttendanceRecords = this.groupAttendanceByUser(results.attendance);
        this.leave = results.leaves.data.filter((l: any) => l.status === 'Approved');
        this.holidays = results.holidays.data;
        this.attendanceTemplateAssignment = results.attendanceTemplate.data;
        this.shifts = results.shiftData.data;
        this.toast.success(this.translate.instant('attendance.data_updated_success'));
      },
      error: (error) => {
        this.toast.error(this.translate.instant('attendance.data_update_failed'));
      }
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

  groupAttendanceByUser(records: any[]): any[] {
    const groupedRecords: any = {};
    records.forEach(record => {
      const user = record.user;
      const userId = record.user?._id;
      const duration = record.duration;
      const userName = record?.user?.firstName + ' ' + record?.user?.lastName;

      if (!groupedRecords[userId]) {
        groupedRecords[userId] = {
          _id: user,
          userName: userName,
          attendance: []
        };
      }
      groupedRecords[userId].attendance.push({
        date: record.date,
        duration: duration
      });
    });
    return Object.values(groupedRecords);
  }

  getUser(employeeId: string): string {
    const matchingUser = this.users?.find(user => user._id === employeeId);
    return matchingUser ? `${matchingUser.firstName} ${matchingUser.lastName}` : 'N/A';
  }

  getAttendanceStatus(user: any, date: Date): string {
    const today = new Date();
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    let status = 'N/A';
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);

    // 1. Check for leaves first to see if they overlap with anything else
    const leaveForDate = this.getLeaveForDate(user._id.id, compareDate);
    const halfDayLeave = this.getHalfDayLeaveForDate(user._id.id, compareDate);

    const isHoliday = this.isHolidayForUser(user._id, compareDate);

    const assignment = this.attendanceTemplateAssignment?.find(
      (assignment: any) => assignment?.employee?._id === user?._id?.id
    );
    const assignedTemplate = assignment?.attendanceTemplate;
    const weeklyOfDays = assignedTemplate?.weeklyOfDays || [];
    const dayOfWeekName = dayNames[compareDate.getDay()];
    const isWeeklyOff = weeklyOfDays.includes(dayOfWeekName);

    // 2. Logic for overlapping status
    if (leaveForDate) {
      const isWeeklyOffPartOfLeave = leaveForDate.leaveCategory?.isWeeklyOffLeavePartOfNumberOfDaysTaken;
      const isHolidayPartOfLeave = leaveForDate.leaveCategory?.isAnnualHolidayLeavePartOfNumberOfDaysTaken;

      if (isHoliday && !isHolidayPartOfLeave) {
        return 'holiday';
      }
      if (isWeeklyOff && !isWeeklyOffPartOfLeave) {
        return 'weeklyOff';
      }
      return 'leave';
    }

    if (halfDayLeave) {
      // For half day leaves, usually we still show it as half day leave regardless of holiday/weekly off
      // as applying a half day leave on a non-working day is rare but possible.
      return 'halfDayLeave';
    }

    // 3. Independent status checks
    if (isHoliday) {
      return 'holiday';
    }

    if (isWeeklyOff) {
      return 'weeklyOff';
    }

    // 4. Check for future dates
    if (compareDate > today) {
      return 'notApplicable';
    }

    // 5. Check attendance record
    const attendance = user.attendance.find(
      (att: any) => new Date(att.date).toDateString() === compareDate.toDateString()
    );

    if (!attendance) {
      return 'noRecord';
    }
    const shiftAssignment = this.shifts.find(
      (shift: any) => shift?.user === user?._id?.id
    );

    if (shiftAssignment) {
      const fullDayDuration = shiftAssignment?.template?.minHoursPerDayToGetCreditForFullDay * 60;
      const halfDayDuration = shiftAssignment?.template?.minHoursPerDayToGetCreditforHalfDay * 60;
      const isHalfDayApplicable = !!shiftAssignment?.template?.isHalfDayApplicable;

      if (attendance.duration == 0) {
        return 'absent'
      }
      else if (attendance.duration >= fullDayDuration) {
        return 'present';
      }
      else if (isHalfDayApplicable) {
        if (attendance.duration >= halfDayDuration) {
          return 'halfDay';
        } else {
          return 'incomplete';
        }
      }
      else {
        return 'incomplete';
      }
    }
    return status;
  }

  getLeaveForDate(userId: string, date: Date): any {
    if (!this.leave || this.leave.length === 0) {
      return null;
    }
    const userLeaves = this.leave.filter(leave => leave.employee.id === userId);
    for (let leave of userLeaves) {
      const startDate = new Date(leave.startDate);
      const endDate = new Date(leave.endDate);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(0, 0, 0, 0);

      if (date >= startDate && date <= endDate) {
        return leave;
      }
    }
    return null;
  }

  getHalfDayLeaveForDate(userId: string, date: Date): any {
    if (!this.leave || this.leave.length === 0) {
      return null;
    }
    const userLeaves = this.leave.filter(leave => leave.employee.id === userId);
    for (let leave of userLeaves) {
      if (leave.halfDays && leave.halfDays.length > 0 && leave.isHalfDayOption == true) {
        const halfDayLeave = leave.halfDays.find((h: any) => {
          const leaveDate = new Date(h.date);
          leaveDate.setHours(0, 0, 0, 0);
          return leaveDate.getTime() === date.getTime();
        });
        if (halfDayLeave) return halfDayLeave;
      }
    }
    return null;
  }


  isHolidayForUser(user: any, date: Date): boolean {
    if (!this.holidays || this.holidays.length === 0) {
      return false;
    }
    //debugger;
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);

    // Find user location from userEmployments
    const userEmp = this.userEmployments.find(emp => emp.user === user._id || emp.user === user.id);
    const userLocation = userEmp ? userEmp.location : null;

    for (let holiday of this.holidays) {
      const holidayDate = new Date(holiday.date);
      holidayDate.setHours(0, 0, 0, 0);

      if (holidayDate.getTime() === compareDate.getTime()) {
        // 1. Check if it applies to All-Locations
        if (holiday.locationAppliesTo === 'All-Locations') {
          return true;
        }

        // 2. Check if it applies to Selected-Locations and matches user location
        if (holiday.locationAppliesTo === 'Selected-Locations' && userLocation) {
          const isApplicable = holiday.holidayapplicableOffice.some(hao =>
            hao.office && (hao.office.name === userLocation || hao.office._id === userLocation)
          );
          if (isApplicable) return true;
        }

        // Fallback for cases where locationAppliesTo might not be set (legacy data)
        if (!holiday.locationAppliesTo) {
          if (Array.isArray(holiday.holidayapplicableEmployee) && holiday.holidayapplicableEmployee.length > 0) {
            // If there's an employee-specific list, it's a holiday if the user is in it
            return holiday.holidayapplicableEmployee.some(emp => emp.user === user._id || emp.user === user.id);
          }
          // If no locationAppliesTo and no employee list, assume it's for everyone (old behavior)
          return true;
        }
      }
    }
    return false;
  }

  downloadAttendance() {
    this.translate.get([
      'attendance.default_headers', 'attendance.sheet_names', 'attendance.instructions_title',
      'attendance.note_use_sheet_name', 'attendance.note_use_correct_format',
      'attendance.note_no_column_change', 'attendance.note_fields_required',
      'attendance.note_fill_and_upload', 'attendance.instructions_table'
    ]).subscribe((translations: any) => {

      const sheetNames = translations['attendance.sheet_names'];
      const attendanceSheetName = sheetNames['data'];
      const instructionSheetName = sheetNames['instructions'];

      const defaultAttendanceHeaders = translations['attendance.default_headers'];
      const attendanceSheet = XLSX.utils.json_to_sheet(
        this.attendanceData.length ? this.attendanceData : defaultAttendanceHeaders
      );

      attendanceSheet['!cols'] = [
        { wch: 10 }, { wch: 15 }, { wch: 10 }, { wch: 10 },
      ];

      Object.keys(attendanceSheet).forEach(cell => {
        if (cell.startsWith('B') && cell !== 'B1') {
          const cellObj = attendanceSheet[cell];
          if (cellObj && typeof cellObj.v === 'string') {
            cellObj.t = 's';
            cellObj.z = '@';
          }
        }
      });

      const instructionSheet: any = {};
      const notes = [
        translations['attendance.instructions_title'], translations['attendance.note_use_sheet_name'],
        translations['attendance.note_use_correct_format'], translations['attendance.note_no_column_change'],
        translations['attendance.note_fields_required'], translations['attendance.note_fill_and_upload']
      ];

      notes.forEach((note: string, index: number) => {
        const cellRef = `A${index + 1}`;
        instructionSheet[cellRef] = { t: 's', v: note };
      });

      const instructionData = translations['attendance.instructions_table'];
      XLSX.utils.sheet_add_json(instructionSheet, instructionData, {
        origin: `A${notes.length + 2}`,
        skipHeader: false
      });

      const totalRows = notes.length + instructionData.length + 3;
      instructionSheet['!ref'] = `A1:C${totalRows}`;

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
  validateAttendanceUploadLock(): Promise<boolean> {
    const month = this.selectedMonth; // 1-based month index
    const year = this.selectedYear;

    return new Promise((resolve, reject) => {
      this.payrollService.validateAttendanceProcess({ month, year }).subscribe(
        (res: any) => {
          if (res.exists) {
            this.toast.error(
              res.message || 'Attendance is already processed for this month. Upload is not allowed.'
            );
            resolve(true); // ❗️true means "locked"
          } else {
            resolve(false); // Not locked, safe to proceed
          }
        },
        (err) => {
          this.processing = false;
          this.toast.error(
            err?.error?.message || 'Error validating attendance process.',
            this.translate.instant('attendance.upload_title') || 'Upload Attendance'
          );
          reject(false);
        }
      );
    });
  }


  async uploadAttendanceBackup(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const allowedExtensions = ['xlsx', 'xls'];
    const fileExtension = file.name.split('.').pop()?.toLowerCase();

    if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
      this.toast.error(this.translate.instant('attendance.invalid_file_type'));
      return;
    }
    const isAttendanceValid = await this.validateAttendanceUploadLock();
    if (isAttendanceValid === true) {
      return;
    }
    const reader = new FileReader();

    reader.onload = (e: any) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });

      const expectedSheetName = this.translate.instant('attendance.sheet_names.data');
      const defaultHeaders = this.translate.instant('attendance.default_headers');
      const expectedHeaders: string[] = Object.keys(defaultHeaders[0]);

      if (!workbook.SheetNames.includes(expectedSheetName)) {
        this.toast.error(this.translate.instant('attendance.sheet_not_found'));
        return;
      }

      const worksheet = workbook.Sheets[expectedSheetName];
      const parsedData: any[] = XLSX.utils.sheet_to_json(worksheet, {
        defval: '', raw: false
      });

      const cleanedData = parsedData.filter(row =>
        Object.values(row).some(cell => String(cell).trim() !== '')
      );

      if (cleanedData.length === 0) {
        this.toast.warning(this.translate.instant('attendance.excel_empty_or_invalid'));
        return;
      }

      const fileHeaders = Object.keys(cleanedData[0]);
      const allHeadersPresent = expectedHeaders.every(h => fileHeaders.includes(h));
      if (!allHeadersPresent) {
        this.toast.error(this.translate.instant('attendance.invalid_headers'));
        return;
      }

      this.attendanceService.uploadAttendanceRecords(cleanedData).subscribe(
        (res: any) => {
          this.toast.success(this.translate.instant('attendance.upload_success'));
          this.fetchAndUpdateData();
        },
        (error: any) => {
          const errorMessage = error?.error?.message || error?.message || error
            || this.translate.instant('attendance.upload_failed');
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
      const formattedDate = this.formatDate(values[1]);
      return {
        EmpCode: values[0] || '',
        Date: formattedDate,
        StartTime: values[2] || '',
        EndTime: values[3] || ''
      };
    });
  }

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

  trackByDate: TrackByFunction<Date> = (index: number, date: Date): string => {
    return date.toISOString();
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
    const fullHours = this.fullDayDuration / 60;
    const halfHours = this.halfDayDuration / 60;

    const attendanceRecords = this.currentMonthDates.map(date => {
      return {
        status: this.getAttendanceStatus(user, date)
      };
    });

    const daysInMonth = new Date(this.selectedYear, this.selectedMonth, 0).getDate();

    this.selectedAttendanceRecord = {
      user: user?._id,
      month: this.selectedMonth,
      year: this.selectedYear,
      records: attendanceRecords,
      name: user.userName,
      shiftFullDayTime: this.formatHoursToTime(fullHours),
      shiftHalfDayTime: this.formatHoursToTime(halfHours),
      monthDays: daysInMonth
    };
    this.dialog.open(EmployeeAttendanceHistoryComponent, {
      data: this.selectedAttendanceRecord,
      width: '80vw',
      height: '80vh',
      maxWidth: 'none'
    });
  }

  formatHoursToTime(hours: number): string {
    const totalMinutes = Math.round(hours * 60);
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`;
  }

  async uploadAttendanceRecord() {
    const isAttendanceValid = await this.validateAttendanceUploadLock();
    if (isAttendanceValid === true) {
      return;
    }
    const dialogRef = this.dialog.open(UploadRecordsComponent, {
      width: '80%',
      height: '80%'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.fetchAndUpdateData();
      }
    });
  }

  isAllSelected(): boolean {
    return this.uploadedRecords.every(r => r.selected);
  }

  isSomeSelected(): boolean {
    const selectedCount = this.uploadedRecords.filter(r => r.selected).length;
    return selectedCount > 0 && selectedCount < this.uploadedRecords.length;
  }

  toggleSelectAll(event: any) {
    this.uploadedRecords.forEach(record => (record.selected = event.checked));
  }

  hasSelectedRecords(): boolean {
    return this.uploadedRecords.some(r => r.selected);
  }

  async uploadAttendance(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const allowedExtensions = ['xlsx', 'xls'];
    const fileExtension = file.name.split('.').pop()?.toLowerCase();

    if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
      this.toast.error(this.translate.instant('attendance.invalid_file_type'));
      return;
    }

    const isAttendanceValid = await this.validateAttendanceUploadLock();
    if (isAttendanceValid) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (e: any) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });

      const expectedSheetName = this.translate.instant('attendance.sheet_names.data');
      const defaultHeaders = this.translate.instant('attendance.default_headers');
      const expectedHeaders: string[] = Object.keys(defaultHeaders[0]);

      if (!workbook.SheetNames.includes(expectedSheetName)) {
        this.toast.error(this.translate.instant('attendance.sheet_not_found'));
        return;
      }

      const worksheet = workbook.Sheets[expectedSheetName];
      const parsedData: any[] = XLSX.utils.sheet_to_json(worksheet, {
        defval: '', raw: false
      });

      const cleanedData = parsedData.filter(row =>
        Object.values(row).some(cell => String(cell).trim() !== '')
      );

      if (cleanedData.length === 0) {
        this.toast.warning(this.translate.instant('attendance.excel_empty_or_invalid'));
        return;
      }

      const fileHeaders = Object.keys(cleanedData[0]);
      const allHeadersPresent = expectedHeaders.every(h => fileHeaders.includes(h));
      if (!allHeadersPresent) {
        this.toast.error(this.translate.instant('attendance.invalid_headers'));
        return;
      }

      // Store records and add status field
      this.uploadedRecords = cleanedData.map(record => ({ ...record, status: '', selected: true }));

      // Open the dialog with the ng-template
      this.dialogRef = this.dialog.open(this.uploadPopup, {
        width: '80%',
        height: '80%',
        disableClose: true,
      });

      this.dialogRef.afterClosed().subscribe(result => {
        if (this.fileInput && this.fileInput.nativeElement) {
          console.log('Resetting file input'); // Debug log
          this.fileInput.nativeElement.value = '';
        }
        this.fetchAndUpdateData();
        this.uploadedRecords = []; // Clear records after closing
      });
    };

    reader.readAsArrayBuffer(file);
  }

  confirmBeforeClose(): void {
    if (this.processing) {
      this.toast.info('Please wait until the current processing is complete.');
      //const confirmClose = confirm('Uploading process will be stopped if you close. Are you sure you want to close?');
      // if (confirmClose) {
      //   this.dialog.closeAll();
      // }
    }
    else {
      this.dialog.closeAll();
    }
  }

  async processRecords() {
    this.processing = true;
    const selectedRecords = this.uploadedRecords.filter(r => r.selected);
    if (selectedRecords.length === 0) {
      this.toast.warning('Please select at least one record to process.');
      this.processing = false;
      return;
    }
    const uniqueMonthYearSet = new Set<string>();
    for (const rec of selectedRecords) {
      const date = new Date(rec.Date);
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      uniqueMonthYearSet.add(`${month}-${year}`);
    }

    const originalMonth = this.selectedMonth;
    const originalYear = this.selectedYear;
    for (const key of uniqueMonthYearSet) {
      const [month, year] = key.split('-').map(Number);
      this.selectedMonth = month;
      this.selectedYear = year;
      const isLocked = await this.validateAttendanceUploadLock();
      if (isLocked) {
        this.processing = false;
        this.selectedMonth = originalMonth;
        this.selectedYear = originalYear;
        return;
      }
    }
    this.selectedMonth = originalMonth;
    this.selectedYear = originalYear;

    for (let i = 0; i < selectedRecords.length; i++) {
      const record = selectedRecords[i];
      record.status = 'Processing...';

      try {
        const response: any = await this.attendanceService.uploadAttendanceRecords(record).toPromise();

        record.status = response?.status === 'Success'
          ? 'Success'
          : response?.message || 'Unknown error';
      } catch (error) {
        record.status = error?.error?.message || error || 'Failed';
      }

      // Force UI refresh
      this.uploadedRecords = [...this.uploadedRecords];
    }

    this.processing = false;
    // Close the upload dialog after processing completes
    try {
      if (this.dialogRef) {
        this.dialogRef.close(true);
      }
    } catch (err) {
      // fallback to closing all dialogs if specific ref fails
      try { this.dialog.closeAll(); } catch { }
    }
  }
}