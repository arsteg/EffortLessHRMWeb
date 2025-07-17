import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { AttendanceService } from 'src/app/_services/attendance.service';
import { TableColumn } from 'src/app/models/table-column';

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

  attendanceRecordsColumns: TableColumn[] = [
    {
      key: 'date',
      name: 'Date',
      valueFn: (row) => row?.date ? this.datePipe.transform(row?.date, 'mediumDate') : ''
    },
    {
      key: 'checkIn',
      name: 'CheckIn',
      valueFn: (row) => row?.checkIn ? this.datePipe.transform(row?.checkIn, 'mediumTime') : ''
    },
    {
      key: 'checkOut',
      name: 'CheckOut',
      valueFn: (row) => row?.checkOut ? this.datePipe.transform(row?.checkOut, 'mediumTime') : ''
    },
    {
      key: 'duration',
      name: 'Working Hours'
    },
    {
      key: 'ODHours',
      name: 'OD Hours'
    },
    {
      key: 'SSLHours',
      name: 'SL Hours'
    },
    {
      key: 'afterProcessing',
      name: 'After Processing'
    },
    {
      key: 'earlyLateStatus',
      name: 'Early/Late Status'
    },
    {
      key: 'deviationHour',
      name: 'Deviation Hours'
    },
    {
      key: 'shiftTiming',
      name: 'Shift Timings'
    },
    {
      key: 'lateComingRemarks',
      name: 'Late Coming Remarks'
    }
  ]

  constructor(private attendanceService: AttendanceService,
   private datePipe: DatePipe
  ) {  }

  ngOnInit() {
    this.generateYearList();
    this.getAttendanceRecords();
  }

  onMonthChange(event: any) {
    this.getAttendanceRecords();
  }

  generateYearList() {
    const currentYear = new Date().getFullYear();
    this.years = [currentYear - 1, currentYear, currentYear + 1];
    console.log(currentYear);
    this.selectedYear = currentYear;
  }

  onYearChange(event: any) {
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