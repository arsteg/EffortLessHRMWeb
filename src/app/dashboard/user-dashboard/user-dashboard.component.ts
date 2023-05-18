import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AuthenticationService } from 'src/app/_services/authentication.service';
import { DashboardService } from 'src/app/_services/dashboard.Service';
import { ManageTeamService } from 'src/app/_services/manage-team.service';
import { TimeLogService } from 'src/app/_services/timeLogService';
import { CommonService } from 'src/app/common/common.service';
import { HoursWorked } from 'src/app/models/dashboard/userdashboardModel';

@Component({
  selector: 'app-user-dashboard',
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.css']
})
export class UserDashboardComponent implements OnInit {

  selectedManager: any;
  selectedUsers: any;
  selectedUser: any;
  teamOfUsers: any[];
  firstLetter: string;
  color: string;
  currentUser = JSON.parse(localStorage.getItem('currentUser'));
  date = new FormControl(new Date());
  serializedDate = new FormControl(new Date().toISOString());
  currentProfile: any;
  role=  localStorage.getItem('roleName');
  hoursWorked:HoursWorked

  constructor(
    private timelog: TimeLogService,
    private manageTeamService: ManageTeamService,
    public commonService: CommonService,
    private auth: AuthenticationService,
    private dashboardService:DashboardService,
    private toastr:ToastrService
  ) {

  }

  ngOnInit(): void {
  let currentUser = JSON.parse(localStorage.getItem('currentUser'))
  const currentDate = "2023-05-05";
  this.dashboardService.HoursWorked(this.currentUser.id,currentDate).subscribe(response=>{
      this.hoursWorked = response.data;
  },
  err => {
    this.toastr.error('Can not be Updated', 'ERROR!')
  });

  this.dashboardService.weeklySummary(this.currentUser.id ,currentDate).subscribe(response=>{
    console.log(response);
  },
  err => {
    this.toastr.error(err, 'ERROR!')
  });

  this.dashboardService.monthlySummary(this.currentUser.id ,currentDate).subscribe(response=>{
    console.log(response);
  },
  err => {
    this.toastr.error(err, 'ERROR!')
  });

  this.dashboardService.taskwiseHours(this.currentUser.id).subscribe(response=>{
    console.log(response);
  },
  err => {
    this.toastr.error(err, 'ERROR!')
  });

  this.dashboardService.taskwiseStatus(this.currentUser.id).subscribe(response=>{
    console.log(response);
  },
  err => {
    this.toastr.error(err, 'ERROR!')
  });
}

  populateTeamOfUsers() {
    this.manageTeamService.getAllUsers().subscribe({
      next: result => {
        this.teamOfUsers = result.data.data;
        let currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.teamOfUsers.forEach((user: any, index: number) => {
          if (user.id == currentUser.id) {
            this.selectedManager = user;
            this.teamLead(user);
          }
        });
      },
      error: error => { }
    })
  }

  teamLead(user: any) {
    this.selectedManager = user;
    this.timelog.getTeamMembers(user.id).subscribe({
      next: response => {
        this.timelog.getusers(response.data).subscribe({
          next: result => {
            this.selectedUsers = result.data;
            this.teamOfUsers.forEach((user: any, index: number) => {
              user['isChecked'] = this.selectedUsers.some((selectedUser: any) => selectedUser.id == user.id);

            });
          },
          error: error => {
            console.log('There was an error!', error);
          }
        });
      },
      error: error => {
        console.log('There was an error!', error);
      }
    });
  }

}
