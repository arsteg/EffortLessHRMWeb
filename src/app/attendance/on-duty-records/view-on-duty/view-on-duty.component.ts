import { Component } from '@angular/core';
import { AttendanceService } from 'src/app/_services/attendance.service';
import { CommonService } from 'src/app/common/common.service';

@Component({
  selector: 'app-view-on-duty',
  templateUrl: './view-on-duty.component.html',
  styleUrl: './view-on-duty.component.css'
})
export class ViewOnDutyComponent {
  viewRequest: any;
  portalView = localStorage.getItem('adminView');
  allAssignee: any;

  constructor(private attendanceService: AttendanceService,
    private commonService: CommonService
  ) { }

  ngOnInit() {
    this.commonService.populateUsers().subscribe(result => {
      this.allAssignee = result && result.data && result.data.data;
    });
    this.viewRequest = this.attendanceService.status.getValue();
    console.log(this.viewRequest);
  }

  getUser(employeeId: string) {
    const matchingUser = this.allAssignee?.find(user => user._id === employeeId);
    return matchingUser ? `${matchingUser.firstName} ${matchingUser.lastName}` : 'N/A';
  }
}
