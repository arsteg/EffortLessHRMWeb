import { DatePipe } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AttendanceService } from 'src/app/_services/attendance.service';
import { ExportService } from 'src/app/_services/export.service';
import { TableColumn } from 'src/app/models/table-column';

@Component({
  selector: 'app-employee-attendance-history',
  templateUrl: './employee-attendance-history.component.html',
  styleUrl: './employee-attendance-history.component.css'
})
export class EmployeeAttendanceHistoryComponent implements OnInit {
  searchText: string = '';
  p: number = 1;
  attendanceRecords: any[] = [];
  status: any[] = [];

  totalRecords: number = 0;
  daysPresent: number = 0;
  daysAbsent: number = 0;
  leaveTaken: number = 0;
  weeklyOff: number = 0;
  holidays: number = 0;
  incompleteRecords: number = 0;
  totalDuration: number = 0;
  totalDeviationHours: number = 0;
  totalPayableDays: number = 0;

  hrmTableData: any[] = [];
  hrmTableColumns: TableColumn[] = [
    {
      key: 'name',
      name: 'Summary'
    },
    {
      key: 'daysPresent',
      name: 'Days Present'
    },
    {
      key: 'daysAbsent',
      name: 'Days Absent'
    },
    {
      key: 'leaveTaken',
      name: 'Leave Taken'
    },
    {
      key: 'weeklyOff',
      name: 'WeeklyOff'
    },
    {
      key: 'holidays',
      name: 'Holidays'
    },
    {
      key: 'incompleteRecords',
      name: 'Invalid Records'
    },
    {
      key: 'totalDuration',
      name: 'Total Hours'
    },
    {
      key: 'totalDeviationHours',
      name: 'Total Deviation'
    },
    {
      key: 'totalPayableDays',
      name: 'Total Payable Days'
    }
  ];
  attendanceTableColumns: TableColumn[] = [
    {
      key: 'date',
      name: 'Date'
    },
    {
      key: 'checkIn',
      name: 'Check In',
    },
    {
      key: 'checkOut',
      name: 'Check Out',
    },
    {
      key: 'durationFormatted',
      name: 'Duration'
    },
    {
      key: 'deviationFormatted',
      name: 'Deviation Hours'
    },
    {
      key: 'shiftTiming',
      name: 'Shift Timing'
    },
    {
      key: 'lateComingRemarks',
      name: 'Late Coming Remarks'
    }
  ]
  constructor(
    private exportService: ExportService,
    private attendanceService: AttendanceService,
    private datePipe: DatePipe,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit() {
    let payload = { month: this.data.month, year: this.data.year, user: this.data.user };

    this.attendanceService.getAttendanceRecordsByMonthByUser(payload).subscribe({
      next: (res: any) => {
        this.attendanceRecords = res.data.map((record: any) => {
          const durationMinutes = record.duration || 0;
          const deviationMinutes = record.deviationHour || 0;
          const hours = Math.floor(durationMinutes / 60);
          const minutes = Math.round(durationMinutes % 60);
          const deviationHours = Math.floor(deviationMinutes / 60);
          const deviationMins = Math.round(deviationMinutes % 60);
          return {
            ...record,
            date: this.datePipe.transform(record.date, 'MMM d, yyyy'),
            duration: (record.duration / 60).toFixed(2),
            deviationHour: record.deviationHour ? (record.deviationHour / 60) : '0',
            durationFormatted: `${hours}h ${minutes}m`,
            deviationFormatted: `${deviationHours}h ${deviationMins}m`
          };
        });

        this.totalDuration = this.attendanceRecords.reduce((sum, record) => {
          return sum + parseFloat(record.duration || 0);
        }, 0);

        this.totalDeviationHours = this.attendanceRecords.reduce((sum, record) => {
          const deviation = typeof record.deviationHour === 'number' && !isNaN(record.deviationHour)
            ? record.deviationHour
            : 0;
            console.log(sum + deviation)
          return sum + deviation;
        }, 0);

        console.log(this.totalDeviationHours);
        this.getStatus();
      },
      error: (err) => {
        console.error('Error fetching attendance records:', err);
      }
    });
  }

  getStatus() {
    if (this.data && this.data.records) {
      const statuses = this.data.records.map((record: any) => record.status);
      this.daysPresent = statuses.filter((status: string) => status === 'present').length;
      this.daysAbsent = statuses.filter((status: string) => status === 'noRecord').length;
      this.leaveTaken = statuses.filter((status: string) => status === 'leave').length;
      this.weeklyOff = statuses.filter((status: string) => status === 'weeklyOff').length;
      this.holidays = statuses.filter((status: string) => status === 'holiday').length;
      this.incompleteRecords = statuses.filter((status: string) => status.includes('incomplete')).length;
      this.totalRecords = statuses.length;

      this.totalPayableDays = this.daysPresent + this.leaveTaken + this.holidays;

      this.hrmTableData = [{
        name: this.data.name || 'Summary',
        daysPresent: this.daysPresent,
        daysAbsent: this.daysAbsent,
        leaveTaken: this.leaveTaken,
        weeklyOff: this.weeklyOff,
        holidays: this.holidays,
        incompleteRecords: this.incompleteRecords,
        totalDuration: parseFloat(this.totalDuration.toFixed(2)),
        totalDeviationHours: parseFloat(this.totalDeviationHours.toFixed(2)),
        totalPayableDays: this.totalPayableDays
      }];
    } else {
      this.hrmTableData = [];
    }
  }

  exportToCsv() {
    const dataToExport = this.attendanceRecords.map((record) => ({
      Date: record.date,
      Status: record.status,
      'Check In': record.checkIn,
      'Check Out': record.checkOut,
      'Duration': record.duration,
      'Deviation Hours': record.deviationHours || 0
    }));
    this.exportService.exportToCSV('EmployeeAttendance', 'EmployeeAttendance', dataToExport);
  }
}