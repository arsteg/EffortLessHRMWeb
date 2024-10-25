import { Component, TrackByFunction } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { ExportService } from 'src/app/_services/export.service';
import { CommonService } from 'src/app/_services/common.Service';
import { EmployeeAttendanceHistoryComponent } from './employee-attendance-history/employee-attendance-history.component';
import { UploadRecordsComponent } from './upload-records/upload-records.component';
import { AttendanceService } from 'src/app/_services/attendance.service';
import { LeaveService } from 'src/app/_services/leave.service';
import { CompanyService } from 'src/app/_services/company.service';

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
  dates: any;
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
  shiftDurationCache: any;
  processedUsers: Set<string> = new Set();
  leave: any;
  holidays: any;
  selectedUser: any;

  constructor(private modalService: NgbModal,
    private dialog: MatDialog,
    private commonService: CommonService,
    private attendanceService: AttendanceService,
    private leaveService: LeaveService,
    private companyService: CompanyService
  ) { }

  ngOnInit() {
    this.commonService.populateUsers().subscribe((res: any) => {
      this.users = res.data.data;
    });

    this.loadDatesForSelectedMonth();
    this.generateYearList();
    setTimeout(() => {
      this.getAttendanceByMonth();
    }, 1000);
    this.getDetails();
    this.getHolidays();
  }

  trackByDate: TrackByFunction<string> = (index: number, date: string): string => {
    return date;
  };

  getAttendanceForDate(user: any, date: Date): any {
    return user.attendance.find((att: any) => new Date(att.date).toDateString() === date.toDateString());
  }


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

  // viewHistory(user: any) {
  //   const attendanceRecords = this.currentMonthDates.map(date => {
  //     return {
  //       status: this.getAttendanceStatus(user, date)
  //     };
  //   });
  //   this.selectedAttendanceRecord = {
  //     user: user.name,
  //     month: this.selectedMonth,
  //     year: this.selectedYear,
  //     records: attendanceRecords,
  //     name: this.getUser(user.name),
  //     shift: this.getShift(user.name)
  //   };
  //   console.log(this.selectedAttendanceRecord);

  //   this.dialog.open(EmployeeAttendanceHistoryComponent, {
  //     data: this.selectedAttendanceRecord
  //   });
  // }

  // getShift(user) {
  //   this.attendanceService.getShiftByUser(user).subscribe((res: any) => {
  //     const fullHours = parseInt(res.data.minHoursPerDayToGetCreditForFullDay.split(":")[0], 10);
  //     const halfHours = parseInt(res.data.minHoursPerDayToGetCreditforHalfDay.split(":")[0], 10);
  //     this.fullDayDuration = fullHours * 60;
  //     this.halfDayDuration = halfHours * 60;
  //     return this.fullDayDuration;
  //   });
  // }
  viewHistory(user: any) {
    // Fetch attendance records for the current month
    const attendanceRecords = this.currentMonthDates.map(date => {
      return {
        status: this.getAttendanceStatus(user, date)
      };
    });

    // Get shift details for the user
    this.attendanceService.getShiftByUser(user.name).subscribe((res: any) => {
      const fullHours = parseInt(res.data.minHoursPerDayToGetCreditForFullDay.split(":")[0], 10);
      const halfHours = parseInt(res.data.minHoursPerDayToGetCreditforHalfDay.split(":")[0], 10);
      this.fullDayDuration = fullHours * 60;
      this.halfDayDuration = halfHours * 60;

      // Format the full day time based on your desired format
      const fullDayTime = this.formatFullDayTime(fullHours, 0);  // Example format: 08:00:00
      const halfDayTime = this.formatFullDayTime(halfHours, 0);
      const daysInMonth = new Date(this.selectedYear, this.selectedMonth, 0).getDate();
      console.log(daysInMonth);
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

      console.log(this.selectedAttendanceRecord);

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
      console.log('The dialog was closed');
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
    this.attendanceService.getAttendanceRecordsByMonth(payload).subscribe((res: any) => {
      const rawRecords = res.data;
      this.groupedAttendanceRecords = this.groupAttendanceByUser(rawRecords);
    });
  }

  onMonthChange(event: Event) {
    this.loadDatesForSelectedMonth();
    this.getAttendanceByMonth();
  }

  loadDatesForSelectedMonth() {
    const year = new Date().getFullYear();
    const daysInMonth = new Date(year, this.selectedMonth, 0).getDate();

    this.currentMonthDates = [];
    for (let day = 1; day <= daysInMonth; day++) {
      this.currentMonthDates.push(new Date(year, this.selectedMonth - 1, day));
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
    this.selectedYear = event.target.value;
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
    this.leaveService.getLeaveApplication({ skip: '', next: '' }).subscribe((res: any) => {
      const leave = res.data;
      this.leave = leave.filter(leave => leave.status == 'Approved');
    })
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
    let payload = { skip: '', next: '', year: this.selectedYear }
    this.companyService.getHolidays(payload).subscribe((res: any) => {
      this.holidays = res.data;
    })
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