import { Component } from '@angular/core';
import { AttendanceService } from 'src/app/_services/attendance.service';
import { CommonService } from 'src/app/_services/common.Service';

@Component({
  selector: 'app-view-record',
  templateUrl: './view-record.component.html',
  styleUrl: './view-record.component.css'
})
export class ViewRecordComponent {
  viewRequest: any;
  portalView = localStorage.getItem('adminView');
  allAssignee: any;

  constructor(private attendanceService: AttendanceService,
    private commonService: CommonService
  ) { }

  ngOnInit() {
    // this.commonService.populateUsers().subscribe(result => {
    //   this.allAssignee = result && result.data && result.data.data;
    // });
    this.viewRequest = this.attendanceService.status.getValue();
    console.log(this.viewRequest)
  }



}
