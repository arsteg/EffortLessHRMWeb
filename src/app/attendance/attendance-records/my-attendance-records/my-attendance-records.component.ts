import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import * as moment from 'moment';
import { AttendanceService } from 'src/app/_services/attendance.service';

@Component({
  selector: 'app-my-attendance-records',
  templateUrl: './my-attendance-records.component.html',
  styleUrl: './my-attendance-records.component.css'
})
export class MyAttendanceRecordsComponent {
  searchText: string = '';
  selectedMonth: number = new Date().getMonth() + 1;

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

  attendanceRecords: any;
  user = JSON.parse(localStorage.getItem('currentUser'));
  years: number[] = [];
  selectedYear: number;

  constructor(private attendanceService: AttendanceService,
   private datePipe: DatePipe
  ) {  }

  ngOnInit() {
    this.generateYearList();
    this.getAttendanceRecords();
  }

  onMonthChange(event: Event) {
    this.getAttendanceRecords();
  }

  generateYearList() {
    const currentYear = new Date().getFullYear();
    this.years = [currentYear - 1, currentYear, currentYear + 1];
    console.log(currentYear);
    this.selectedYear = currentYear;
  }

  onYearChange(event: any) {
    this.selectedYear = event.target.value;
    this.getAttendanceRecords();
  }

  getAttendanceRecords() {
    let payload = { month: this.selectedMonth, year: this.selectedYear, user: this.user.id }
    this.attendanceService.getAttendanceRecordsByMonthByUser(payload).subscribe((res: any) => {
     
      this.attendanceRecords = res.data.map((data)=>{
        return {
          ...data,
          date: this.datePipe.transform(data.date, 'MMM d, yyyy'),
          duration: (data.duration / 60).toFixed(2)
        }
      })
    })
  }
}