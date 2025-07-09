import { Component, TrackByFunction } from '@angular/core';
import { AttendanceService } from 'src/app/_services/attendance.service';
import { CommonService } from 'src/app/_services/common.Service';

@Component({
  selector: 'app-overtime-records',
  templateUrl: './overtime-records.component.html',
  styleUrl: './overtime-records.component.css'
})
export class OvertimeRecordsComponent {
  weekDates: { day: string, date: string }[] = [];
  selectedMonth: number = new Date().getMonth() + 1;
  currentMonthDates: Date[] = [];
  public sortOrder: string = '';
  users: any[] = [];
  years: number[] = [];
  selectedYear: number;
  view = localStorage.getItem('adminView');
  currentUser = JSON.parse(localStorage.getItem('currentUser'));

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

  overtimeRecords: any;
  overtimeByDay: any;

  constructor(private commonService: CommonService,
    private attendanceService: AttendanceService
  ) { }

  ngOnInit() {
    this.loadDatesForSelectedMonth();
    this.generateYearList();
    this.commonService.populateUsers().subscribe((res: any) => {
      this.users = res.data.data;
      this.getOvertimeByMonth();
    });


  }

  trackByDate: TrackByFunction<string> = (index: number, date: string): string => {
    return date;
  };

  onMonthChange(event: any) {
    this.loadDatesForSelectedMonth();
    this.getOvertimeByMonth();
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
    this.getOvertimeByMonth();
  }

  getUser(employeeId: string) {
    const matchingUser = this.users?.find(user => user._id === employeeId);
    return matchingUser ? `${matchingUser.firstName} ${matchingUser.lastName}` : 'N/A';
  }

  getOvertimeForDate(date: Date, overtimeRecords: any[]): any | null {
    return overtimeRecords.find(record => {
      const recordDate = new Date(record.date);
      recordDate.setHours(0, 0, 0, 0);
      return recordDate.getTime() === date.getTime();
    }) || null;
  }
  getOvertimeByMonth() {
    let payloadForMonth = {
      month: this.selectedMonth,
      year: this.selectedYear
    };
    let payloadForUser = {
      month: this.selectedMonth,
      year: this.selectedYear,
      user: this.currentUser.id
    }
    if (this.view == 'user') {
      this.attendanceService.getAttendanceOvertimeByUser(payloadForUser).subscribe((res: any) => {
        const userOvertimeMap = new Map();

        for (const data of res.data) {
          const user = this.getUser(data.User);

          if (!userOvertimeMap.has(data.User)) {
            userOvertimeMap.set(data.User, {
              User: user,
              overtimeRecords: [],
              TotalOvertime: 0
            });
          }

          const userOvertime = userOvertimeMap.get(data.User);

          userOvertime.overtimeRecords.push({
            date: data.CheckInDate,
            overtimeValue: data.OverTime
          });
        }
        this.overtimeRecords = Array.from(userOvertimeMap.values());
      });
    }

    if (this.view == 'admin') {
      this.attendanceService.getAttendanceOvertimeByMonth(payloadForMonth).subscribe((res: any) => {
        const userOvertimeMap = new Map();

        for (const data of res.data) {
          const user = this.getUser(data.User);

          if (!userOvertimeMap.has(data.User)) {
            userOvertimeMap.set(data.User, {
              User: user,
              overtimeRecords: [],
              TotalOvertime: 0
            });
          }

          const userOvertime = userOvertimeMap.get(data.User);

          userOvertime.overtimeRecords.push({
            date: data.CheckInDate,
            overtimeValue: data.OverTime
          });
        }
        this.overtimeRecords = Array.from(userOvertimeMap.values());
      });
    }
  }

  convertMinutesToHours(minutes) {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return minutes > 0 ? (minutes > 59 ? `${hrs}h ${mins}m` : `${minutes}m`) : '';
  }

}
