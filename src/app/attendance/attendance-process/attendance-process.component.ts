import { Component } from '@angular/core';
import { AttendanceService } from 'src/app/_services/attendance.service';

@Component({
  selector: 'app-attendance-process',
  templateUrl: './attendance-process.component.html',
  styleUrl: './attendance-process.component.css'
})
export class AttendanceProcessComponent {
  activeTab: string = 'attendanceProcess';
  searchText: string = '';
  constructor(private attendanceService: AttendanceService) { }

  ngOnInit() {

  }

  selectTab(tabId: string) {
    this.activeTab = tabId;
    console.log(this.activeTab);
    // this.loadRecords();
  }

}
