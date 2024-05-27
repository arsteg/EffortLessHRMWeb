import { Component } from '@angular/core';
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

  constructor(private exportService: ExportService) { }

  exportToCsv() {
    const dataToExport = this.attendanceHistory.map((data) => ({
      // user: this.getUser(data.user),
      // template: this.getShiftTemplateName(data.template),
      // startDate: data.startDate
    }));
    this.exportService.exportToCSV('Shift-Assignment', 'Shift-Assignment', dataToExport);

  }
}
