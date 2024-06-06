import { Component } from '@angular/core';
import { ExcelService } from 'src/app/_services/excel.service';
import { AttendanceService } from 'src/app/_services/attendance.service';

@Component({
  selector: 'app-upload-records',
  templateUrl: './upload-records.component.html',
  styleUrl: './upload-records.component.css'
})
export class UploadRecordsComponent {
  data: { SlNo: string }[] = [];
  dropdownOptions:any;// = ['"General Shift,Flaxi shift"'];
  dropdownColumnName:string = 'Employee Shift';
  shift:any;

  constructor(private excelService: ExcelService,
    private attendanceService: AttendanceService
  ) { }

  DownloadAttendanceFormat(): void {
    this.generateRecords(5000);
    this.getShift();
  }

  generateRecords(count: number): void {
    this.data = [];
    for (let i = 1; i <= count; i++) {
      this.data.push({ SlNo: '' });
    }
  }

  getShift() {
    this.attendanceService.getShift().subscribe((res: any) => {
      this.shift = res.data;
      if(this.shift.length>0){
        let response = this.shift.map((shift: any) => shift.name);
        let tempstr:string = '';
        tempstr = response.join(',');
        this.excelService.generateAttendanceFormat(this.data, 'attendance_sheet', [`"${tempstr}"`], this.dropdownColumnName, 'Attendance Records');
      }
    })
  }
}
