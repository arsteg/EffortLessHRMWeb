import { TitleCasePipe } from '@angular/common';
import { Component } from '@angular/core';
import { AuthenticationService } from 'src/app/_services/authentication.service';
import { ExpensesService } from 'src/app/_services/expenses.service';
import { LeaveService } from 'src/app/_services/leave.service';
import { CommonService } from 'src/app/common/common.service';

@Component({
  selector: 'app-supervisors',
  templateUrl: './supervisors.component.html',
  styleUrl: './supervisors.component.css'
})
export class SupervisorsComponent {
  currentUser = JSON.parse(localStorage.getItem('currentUser'));
  supervisors: any;
  allAssignee: any;

  constructor(private auth: AuthenticationService,
    private leaveService: LeaveService,
    private commonService: CommonService
  ) { }

  ngOnInit() {
    this.commonService.populateUsers().subscribe(result => {
      this.allAssignee = result && result.data && result.data.data;
    });
    this.getSupervisors();
  }

  getSupervisors() {
    this.leaveService.getLeaveTemplateAssignmentByUser(this.currentUser.id).subscribe((res: any) => {
      this.supervisors = res.data;
    })
  }

  getUser(employeeId: string) {
    const matchingUser = this.allAssignee?.find(user => user._id === employeeId);
    return matchingUser ? `${matchingUser.firstName} ${matchingUser.lastName}` : '';
  }
}
