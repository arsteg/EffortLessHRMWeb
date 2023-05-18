import { Component, OnInit } from '@angular/core';
import { CommonService } from '../common/common.service';
import { ManageTeamService } from '../_services/manage-team.service';
import { TimeLogService } from '../_services/timeLogService';
import { FormControl } from '@angular/forms';
import { AuthenticationService } from '../_services/authentication.service';
import { HoursWorked, MonthlySummary, WeeklySummary } from '../models/dashboard/userdashboardModel';
import { DashboardService } from '../_services/dashboard.Service';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
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
  hoursWorked:HoursWorked;
  weeklySummary:WeeklySummary;
  monthlySummary:MonthlySummary;

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
    this.populateTeamOfUsers();
    this.firstLetter = this.commonService.firstletter;

    let currentUser = JSON.parse(localStorage.getItem('currentUser'))
    this.auth.GetMe(currentUser.id).subscribe((response: any) => {
      this.currentProfile = response && response.data.users;
      return this.currentProfile;
    });
    console.log(this.role)

  const currentDate = "2023-05-12";
  this.dashboardService.HoursWorked(this.currentUser.id,currentDate).subscribe(response=>{
      this.hoursWorked = response.data;
      this.hoursWorked.increased = this.hoursWorked.today> this.hoursWorked.previousDay;
      if(this.hoursWorked.increased){
        const change = this.hoursWorked.today-this.hoursWorked.previousDay;
        this.hoursWorked.change = change*100/ this.hoursWorked.previousDay;
      }
      else{
        const change = this.hoursWorked.previousDay - this.hoursWorked.today;
        this.hoursWorked.change = change * 100/ this.hoursWorked.previousDay;
      }
  },
  err => {
    this.toastr.error('Can not be Updated', 'ERROR!')
  });

  this.dashboardService.weeklySummary(this.currentUser.id ,currentDate).subscribe(response=>{
    this.weeklySummary =  response.data;
      this.weeklySummary.increased = this.weeklySummary.currentWeek> this.weeklySummary.previousWeek;
      if(this.weeklySummary.increased){
        const change = this.weeklySummary.currentWeek-this.weeklySummary.previousWeek;
        this.weeklySummary.change = change*100/ this.weeklySummary.previousWeek;
      }
      else{
        const change = this.weeklySummary.previousWeek - this.weeklySummary.currentWeek;
        this.weeklySummary.change = change * 100/ this.weeklySummary.previousWeek;
      }

  },
  err => {
    this.toastr.error(err, 'ERROR!')
  });

  this.dashboardService.monthlySummary(this.currentUser.id ,currentDate).subscribe(response=>{
    this.monthlySummary = response.data;
    this.monthlySummary.increased = this.monthlySummary.currentMonth> this.monthlySummary.previousMonth;
      if(this.monthlySummary.increased){
        const change = this.monthlySummary.currentMonth-this.monthlySummary.previousMonth;
        this.monthlySummary.change = change*100/ this.monthlySummary.previousMonth;
      }
      else{
        const change = this.monthlySummary.previousMonth - this.monthlySummary.currentMonth;
        this.monthlySummary.change = change * 100/ this.monthlySummary.previousMonth;
      }
  },
  err => {
    this.toastr.error(err, 'ERROR!')
  });

  this.dashboardService.taskwiseHours(this.currentUser.id).subscribe(response=>{
    //this.projectTasks = response.data;
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
