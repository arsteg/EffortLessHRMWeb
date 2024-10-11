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
  selectedMonth: string;
  months: any[];
  p: number = 1;
  attendanceRecords: any;

  constructor(private attendanceService: AttendanceService,
    private dialog: MatDialog,
  ) {
    this.months = this.getPreviousMonths();
    this.selectedMonth = this.months[0].value;
  }

  getPreviousMonths() {
    const currentMonth = moment().month();
    const months = [];

    for (let i = currentMonth; i >= 0; i--) {
      const month = moment().month(i).format('MMMM YYYY');
      months.push({ value: month, label: month });
    }

    for (let i = 11; i >= currentMonth; i--) {
      const month = moment().year(moment().year() - 1).month(i).format('MMMM YYYY');
      months.push({ value: month, label: month });
    }

    return months;
  }

  requestRefreshed() {
    // this.attendanceService.getAllOnDutyRequests().subscribe(
    //   (res) => {
    //     this.onDutyRequest = res.data.filter(data => data.status === this.status);
    //     console.log(this.onDutyRequest)
    //   },
    //   (error) => {
    //     console.error('Error refreshing  table:', error);
    //   }
    // );

  }

  
}
