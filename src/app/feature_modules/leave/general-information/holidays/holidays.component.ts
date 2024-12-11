import { Component } from '@angular/core';
import { ExportService } from 'src/app/_services/export.service';
import { HolidaysService } from 'src/app/_services/holidays.service';

@Component({
  selector: 'app-holidays',
  templateUrl: './holidays.component.html',
  styleUrl: './holidays.component.css'
})
export class HolidaysComponent {
  currentYear: number;
  holidays: any[] = [];
  p: number = 1;

  constructor(private holidayService: HolidaysService,
    private exportService: ExportService
  ) {
    this.currentYear = new Date().getFullYear();
  }

  ngOnInit() {
    this.getHolidays(this.currentYear.toString());
  }

  getYearOptions(): number[] {
    const currentYear = new Date().getFullYear();
    return [currentYear - 1, currentYear, currentYear + 1]; 
  }

  getHolidays(year: string) {
    const holidayYears = [];
    holidayYears.push(year);
    const requestBody = {"skip": 0, "next": 500, "years": holidayYears };
    this.holidayService.getHolidaysOfYear(requestBody).subscribe((res: any) => {
      this.holidays = res.data;
    });
  }

  onYearChange(event: any) {
    const selectedYear = event.target.value;
    this.getHolidays(selectedYear);
  }

  exportToCsv() {
    const dataToExport = this.holidays;
    this.exportService.exportToCSV('Holidays', 'Holidays', dataToExport);
  }

}