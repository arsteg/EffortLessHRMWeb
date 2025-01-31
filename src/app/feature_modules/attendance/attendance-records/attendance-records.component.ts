import { Component, TrackByFunction } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { CommonService } from 'src/app/_services/common.Service';
import { EmployeeAttendanceHistoryComponent } from './employee-attendance-history/employee-attendance-history.component';
import { UploadRecordsComponent } from './upload-records/upload-records.component';
import { AttendanceService } from 'src/app/_services/attendance.service';
import { LeaveService } from 'src/app/_services/leave.service';
import { CompanyService } from 'src/app/_services/company.service';
import { forkJoin, map } from 'rxjs';

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
  attendanceRecords: any[];
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
  processedUsers: Set<string> = new Set();
  leave: any;
  holidays: any;
  selectedUser: any;

  attendanceData = [];

  constructor(private modalService: NgbModal,
    private dialog: MatDialog,
    private commonService: CommonService,
    private attendanceService: AttendanceService,
    private leaveService: LeaveService,
    private companyService: CompanyService
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
    const csvContent = this.convertToCSV(this.attendanceData);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'attendance.csv';
    link.click();
  }

  convertToCSV(data: any[]): string {
    const header = ['Employee Code', 'Date', 'Start Time', 'End Time'].join(',');
    const rows = data.map(item =>
      `"${item.employeeCode}","${item.date}","${item.startTime}","${item.endTime}"`
    ).join('\n');
    return `${header}\n${rows}`;
  }

  uploadAttendance(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const csvData = e.target.result;
        const parsedData = this.parseCSV(csvData);
        if (parsedData.length === 0) {
          alert('CSV file is empty or invalid.');
          return;
        }
        if (this.validateCSV(parsedData)) {
          alert('CSV file is valid and uploaded successfully!');
        } else {
          alert('Invalid CSV file. Please check the columns and data.');
        }
      };
      reader.readAsText(file, 'UTF-8');  // Ensuring UTF-8 encoding
    }
  }

  parseCSV(csvData: string): any[] {
    const rows = csvData.split('\n').map(row => row.trim()).filter(row => row);
    if (rows.length < 2) return [];  // Ensure at least header + one row

    const header = rows[0].split(',').map(col => col.trim());
    return rows.slice(1).map(row => {
      const values = row.split(',').map(val => val.trim());
      return {
        employeeCode: values[0] || '',
        date: values[1] || '',
        startTime: values[2] || '',
        endTime: values[3] || ''
      };
    });
  }

  validateCSV(data: any[]): boolean {
    const requiredKeys = ['employeeCode', 'date', 'startTime', 'endTime'];
    return data.every(row => requiredKeys.every(key => row.hasOwnProperty(key) && row[key] !== ''));
  }
  // ---------------------------

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

  exportToCsv() {
    // const dataToExport = this.shiftAssigments.map((data) => ({
    //   user: this.getUser(data.user),
    //   template: this.getShiftTemplateName(data.template),
    //   startDate: data.startDate
    // }));
    // this.exportService.exportToCSV('Shift-Assignment', 'Shift-Assignment', dataToExport);
  }

  viewHistory(user: any) {
    const attendanceRecords = this.currentMonthDates.map(date => {
      return {
        status: this.getAttendanceStatus(user, date)
      };
    });

    this.attendanceService.getShiftByUser(user.name).subscribe((res: any) => {
      const fullHours = parseInt(res.data.minHoursPerDayToGetCreditForFullDay.split(":")[0], 10);
      const halfHours = parseInt(res.data.minHoursPerDayToGetCreditforHalfDay.split(":")[0], 10);
      this.fullDayDuration = fullHours * 60;
      this.halfDayDuration = halfHours * 60;

      // Format the full day time based on your desired format
      const fullDayTime = this.formatFullDayTime(fullHours, 0);  // Example format: 08:00:00
      const halfDayTime = this.formatFullDayTime(halfHours, 0);
      const daysInMonth = new Date(this.selectedYear, this.selectedMonth, 0).getDate();
      // Create the selectedAttendanceRecord object
      this.selectedAttendanceRecord = {
        user: user.name,
        month: this.selectedMonth,
        year: this.selectedYear,
        records: attendanceRecords,
        name: this.getUser(user.name),
        shiftFullDayTime: fullDayTime,
        shiftHalfDayTime: halfDayTime,
        monthDays: daysInMonth
      };

      this.dialog.open(EmployeeAttendanceHistoryComponent, {
        data: this.selectedAttendanceRecord
      });
    });
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
      const date = this.formatDate(new Date(record.date));
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
        date: date,
        duration: duration
      });
    });
    return Object.values(groupedRecords);
  }

  getAttendanceByMonth() {
    const payload = { skip: '', next: '', month: this.selectedMonth, year: this.selectedYear };
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

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
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

  getShiftByUser(user: any): any {

    if (this.processedUsers.has(user.name)) {
      return;
    }
    this.processedUsers.add(user.name);
    this.attendanceService.getShiftByUser(user.name).subscribe((res: any) => {
      const fullHours = parseInt(res.data.minHoursPerDayToGetCreditForFullDay.split(":")[0], 10);
      const halfHours = parseInt(res.data.minHoursPerDayToGetCreditforHalfDay.split(":")[0], 10);

      this.fullDayDuration = fullHours * 60;
      this.halfDayDuration = halfHours * 60;
    });
  }

  getAttendanceStatus(user: any, date: Date): string {
    const attendance = user.attendance.find((att: any) => new Date(att.date).toDateString() === date.toDateString());
    this.getShiftByUser(user);
    const today = new Date();
    if (date > today) {
      return 'notApplicable';
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
    return this.leaveService.getLeaveApplication({ skip: '', next: '' });
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
    let payload = { skip: '', next: '', year: this.selectedYear };
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