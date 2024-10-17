import { Component } from '@angular/core';
import { AttendanceService } from 'src/app/_services/attendance.service';
import { ExportService } from 'src/app/_services/export.service';

@Component({
  selector: 'app-employee-attendance-history',
  templateUrl: './employee-attendance-history.component.html',
  styleUrl: './employee-attendance-history.component.css'
})
export class EmployeeAttendanceHistoryComponent {
  searchText: string = '';
  attendanceHistory: any;
  p: number = 1;
  attendanceRecord: any;

  constructor(private exportService: ExportService,
    private attendanceService: AttendanceService
  ) { }

  ngOnInit() {
    this.attendanceService.selectedAttendanceRecord.subscribe(res => {
      this.attendanceRecord = res;
      console.log(this.attendanceRecord)
    })
  }

  exportToCsv() {
    const dataToExport = this.attendanceHistory.map((data) => ({
      // user: this.getUser(data.user),
      // template: this.getShiftTemplateName(data.template),
      // startDate: data.startDate
    }));
    this.exportService.exportToCSV('Shift-Assignment', 'Shift-Assignment', dataToExport);

  }
}
