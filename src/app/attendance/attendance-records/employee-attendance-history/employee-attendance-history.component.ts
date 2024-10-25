import { DatePipe } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AttendanceService } from 'src/app/_services/attendance.service';
import { ExportService } from 'src/app/_services/export.service';

@Component({
  selector: 'app-employee-attendance-history',
  templateUrl: './employee-attendance-history.component.html',
  styleUrl: './employee-attendance-history.component.css'
})
export class EmployeeAttendanceHistoryComponent {
  searchText: string = '';
  p: number = 1;
  attendanceRecords: any;
  status: any[];
  totalRecords: any;
  daysPresent: any;
  daysAbsent: any;
  leaveTaken: any;
  weeklyOff: any;
  holidays: any;
  incompleteRecords: any;
  totalHours: any;
  totalDuration: any;
  totalDeviationHours: any;
  totalPayableDays: any;

  constructor(private exportService: ExportService,
    private attendanceService: AttendanceService,
    private datePipe: DatePipe,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit() {
    console.log(this.data);
    let payload = { month: this.data.month, year: this.data.year, user: this.data.user };
    this.attendanceService.getAttendanceRecordsByMonthByUser(payload).subscribe((res: any) => {
      this.attendanceRecords = res.data.map((data) => {
        return {
          ...data,
          date: this.datePipe.transform(data.date, 'MMM d, yyyy'),
          duration: (data.duration / 60).toFixed(2)
        }
      })
      this.totalDuration = this.attendanceRecords.reduce((sum, record) => {
        return sum + parseFloat(record.duration);
      }, 0);

      this.totalDeviationHours = this.attendanceRecords.reduce((sum, record) => {
        if (record.deviationHours) { // Check if deviationHours exists
          return sum + parseFloat(record.deviationHours);
        } else {
          return sum;
        }
      }, 0);
      // const shiftFullDurationParts = this.data.shiftFullDayTime.split(":");
      // const shiftHours = parseInt(shiftFullDurationParts[0], 10);
      // const shiftMinutes = parseInt(shiftFullDurationParts[1], 10);
      // const shiftHalfDurationParts = this.data.shiftHalfDayTime.split(":");
      // const shiftHalfHours = parseInt(shiftHalfDurationParts[0], 10);
      // const shiftHalfMinutes = parseInt(shiftHalfDurationParts[1], 10);
      // const totalShiftHours = ((shiftHours + shiftHalfHours) + ((shiftMinutes + shiftHalfMinutes) / 60)) * this.daysPresent;
      // console.log(totalShiftHours);
      // this.totalPayableDays = this.totalDuration / ((shiftHours + shiftHalfHours) * this.data.monthDays);
      // console.log(this.totalPayableDays);
      // this.totalDeviation = (totalShiftHours - this.totalDuration).toFixed(2);
      // console.log(this.totalDeviation);
    });
    this.getStatus();
  }
  
  getStatus() {
    const statuses = this.data.records.map(record => record.status);
    this.daysPresent = statuses.filter(status => status === 'present').length;
    this.daysAbsent = statuses.filter(status => status === 'noRecord').length;
    this.leaveTaken = statuses.filter(status => status === 'leave').length;
    this.weeklyOff = statuses.filter(status => status === 'weeklyOff').length;
    this.holidays = statuses.filter(status => status === 'holiday').length;
    this.incompleteRecords = statuses.filter(status => status.includes('incomplete')).length;
    this.totalRecords = statuses.length;
  }

  exportToCsv() {
    const dataToExport = this.data.map((data) => ({
      // user: this.getUser(data.user),
      // template: this.getShiftTemplateName(data.template),
      // startDate: data.startDate
    }));
    this.exportService.exportToCSV('Shift-Assignment', 'Shift-Assignment', dataToExport);
  }
}