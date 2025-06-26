import { DatePipe } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core'; // Import OnInit
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Table } from 'exceljs';
import { AttendanceService } from 'src/app/_services/attendance.service';
import { ExportService } from 'src/app/_services/export.service';
import { TableColumn } from 'src/app/models/table-column'; // Assuming TableColumn interface is correctly defined

@Component({
  selector: 'app-employee-attendance-history',
  templateUrl: './employee-attendance-history.component.html',
  styleUrl: './employee-attendance-history.component.css'
})
export class EmployeeAttendanceHistoryComponent implements OnInit { // Implement OnInit
  searchText: string = '';
  p: number = 1;
  attendanceRecords: any[] = []; // Initialize as array
  status: any[] = []; // Initialize as array

  // Summary properties - type them explicitly
  totalRecords: number = 0;
  daysPresent: number = 0;
  daysAbsent: number = 0;
  leaveTaken: number = 0;
  weeklyOff: number = 0;
  holidays: number = 0;
  incompleteRecords: number = 0;
  totalDuration: number = 0; // Renamed from totalHours for clarity as it's sum of durations
  totalDeviationHours: number = 0;
  totalPayableDays: number = 0;

  // Data for the hrm-table component
  hrmTableData: any[] = []; // This will hold the single summary row
  hrmTableColumns: TableColumn[] = [
    {
      key: 'name', // Changed key to 'name' to match the data object property
      name: 'Summary'
    },
    {
      key: 'daysPresent', // Changed key to match the data object property
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
      key: 'totalDuration', // Matches the property in hrmTableData
      name: 'Total Hours'
    },
    {
      key: 'totalDeviationHours', // Matches the property in hrmTableData
      name: 'Total Deviation'
    },
    {
      key: 'totalPayableDays', // Matches the property in hrmTableData
      name: 'Total Payable Days'
    }
  ];
  attendanceTableColumns: TableColumn[] = [
    {
      key: 'date', // Changed key to 'name' to match the data object property
      name: 'Date'
    },
    {
      key: 'checkIn', // Changed key to match the data object property
      name: 'Check In'
    },
    {
      key: 'checkOut',
      name: 'Check Out'
    },
    {
      key: 'duration',
      name: 'Duration'
    },
    {
      key: 'ODHours',
      name: 'OD Hours'
    },
    {
      key: 'SSLHours',
      name: 'SSL Hours'
    },
    {
      key: 'beforeProcessing',
      name: 'Before Processing'
    },
    {
      key: 'afterProcessing', // Matches the property in hrmTableData
      name: 'After Processing'
    },
    {
      key: 'earlyLateStatus', // Matches the property in hrmTableData
      name: 'Early Late Status'
    },
    {
      key: 'deviationHour', // Matches the property in hrmTableData
      name: 'Deviation Hours'
    },
    {
      key: 'shiftTiming', // Matches the property in hrmTableData
      name: 'Shift Timing'
    },
    {
      key: 'lateComingRemarks', // Matches the property in hrmTableData
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
    console.log("Input data for attendance history:", this.data);
    let payload = { month: this.data.month, year: this.data.year, user: this.data.user };

    this.attendanceService.getAttendanceRecordsByMonthByUser(payload).subscribe({
      next: (res: any) => {
        this.attendanceRecords = res.data.map((record: any) => { // Type 'record'
          return {
            ...record,
            date: this.datePipe.transform(record.date, 'MMM d, yyyy'),
            duration: (record.duration / 60).toFixed(2) // Convert minutes to hours and fix to 2 decimal places
          };
        });

        // Calculate totalDuration and totalDeviationHours AFTER attendanceRecords are mapped
        this.totalDuration = this.attendanceRecords.reduce((sum, record) => {
          // Ensure duration is treated as a number before summing
          return sum + parseFloat(record.duration || 0); // Use 0 if duration is missing
        }, 0);

        this.totalDeviationHours = this.attendanceRecords.reduce((sum, record) => {
          if (record.deviationHours) { // Check if deviationHours exists
            return sum + parseFloat(record.deviationHours);
          } else {
            return sum;
          }
        }, 0);

        // Now, call getStatus to calculate all summary counts and populate hrmTableData
        this.getStatus();

      },
      error: (err) => {
        console.error('Error fetching attendance records:', err);
        // Handle error, e.g., show a toast message
      }
    });
  }

  getStatus() {
    // Ensure this.data.records is used for status calculations, not attendanceRecords
    // assuming data.records contains the raw status for summary counts.
    // If attendanceRecords (after mapping) should be used, adjust accordingly.
    // Based on the original table, it seems 'data.records' was the source for status counts.
    if (this.data && this.data.records) {
      const statuses = this.data.records.map((record: any) => record.status);

      this.daysPresent = statuses.filter((status: string) => status === 'present').length;
      this.daysAbsent = statuses.filter((status: string) => status === 'noRecord').length;
      this.leaveTaken = statuses.filter((status: string) => status === 'leave').length;
      this.weeklyOff = statuses.filter((status: string) => status === 'weeklyOff').length;
      this.holidays = statuses.filter((status: string) => status === 'holiday').length;
      this.incompleteRecords = statuses.filter((status: string) => status.includes('incomplete')).length;
      this.totalRecords = statuses.length; // Total count of records processed

      // Calculate total payable days based on your logic (example provided)
      // This logic might need adjustment based on your business rules for what counts as a payable day
      this.totalPayableDays = this.daysPresent + this.leaveTaken + this.holidays; // Example formula

      // Construct the data for hrm-table
      this.hrmTableData = [{
        name: this.data.name || 'Summary', // Use data.name for the summary row, provide fallback
        daysPresent: this.daysPresent,
        daysAbsent: this.daysAbsent,
        leaveTaken: this.leaveTaken,
        weeklyOff: this.weeklyOff,
        holidays: this.holidays,
        incompleteRecords: this.incompleteRecords,
        totalDuration: parseFloat(this.totalDuration.toFixed(2)), // Format to 2 decimal places
        totalDeviationHours: parseFloat(this.totalDeviationHours.toFixed(2)), // Format to 2 decimal places
        totalPayableDays: this.totalPayableDays
      }];
    } else {
      console.warn("data or data.records is undefined, cannot calculate status summary.");
      this.hrmTableData = []; // Ensure hrmTableData is empty if no records
    }
  }

  exportToCsv() {
    // You need to define what 'this.data' is when exporting for shift assignment.
    // The previous commented out code suggests this 'exportToCsv' is for a different context.
    // For this specific component, you'd likely want to export the attendance records or the summary.
    const dataToExport = this.attendanceRecords.map((record) => ({
      Date: record.date,
      Status: record.status,
      'Check In': record.checkIn,
      'Check Out': record.checkOut,
      'Duration': record.duration,
      'Deviation Hours': record.deviationHours || 0 // Provide default for missing
    }));
    this.exportService.exportToCSV('EmployeeAttendance', 'EmployeeAttendance', dataToExport);
  }
}