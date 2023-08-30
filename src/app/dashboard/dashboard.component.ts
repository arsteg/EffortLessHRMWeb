import { Component, OnInit } from '@angular/core';
import { CommonService } from '../common/common.service';
import { ManageTeamService } from '../_services/manage-team.service';
import { TimeLogService } from '../_services/timeLogService';
import { FormControl } from '@angular/forms';
import { AuthenticationService } from '../_services/authentication.service';
import { HoursWorked, MonthlySummary, ProjectTask, WeeklySummary } from '../models/dashboard/userdashboardModel';
import { DashboardService } from '../_services/dashboard.Service';
import { ToastrService } from 'ngx-toastr';
import { teamMember } from '../models/teamMember';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
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
  projectTasks: ProjectTask[];
  productivityData = [];
  taskSummary = [];
  members: teamMember[];
  member: teamMember;
  selectedDate:Date= new Date;
  dayWorkStatusByUser:any[];
  
  constructor(
    private timelog: TimeLogService,
    private manageTeamService: ManageTeamService,
    public commonService: CommonService,
    private auth: AuthenticationService,
    private dashboardService:DashboardService,
    private toastr:ToastrService
  ) {

  }
  // selectedUser: any;
  ngOnInit(): void {
    this.populateTeamOfUsers();
    this.firstLetter = this.commonService.firstletter;

    let currentUser = JSON.parse(localStorage.getItem('currentUser'))
    this.auth.GetMe(currentUser.id).subscribe((response: any) => {
      this.currentProfile = response && response.data.users;
      return this.currentProfile;
    });
    this.populateMembers();
    const currentDate = this.selectedDate;

  this.dashboardService.HoursWorked(this.currentUser.id,currentDate).subscribe(response=>{
      this.hoursWorked = response.data;
      this.hoursWorked.increased = this.hoursWorked.today> this.hoursWorked.previousDay;
      if(this.hoursWorked.increased){
        const change = this.hoursWorked.today-this.hoursWorked.previousDay;
        this.hoursWorked.change = change*100/ this.hoursWorked.previousDay;
        this.hoursWorked.changeDisplay = `+${this.hoursWorked.change.toFixed(2)}`;
        this.hoursWorked.changeColor = '#08ad08';
      }
      else{
        const change = this.hoursWorked.previousDay - this.hoursWorked.today;
        this.hoursWorked.change = change * 100/ this.hoursWorked.previousDay;
        this.hoursWorked.changeDisplay = `-${this.hoursWorked.change.toFixed(2)}`;
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
        this.weeklySummary.changeDisplay = `+${this.weeklySummary.change.toFixed(2)}`;
        this.weeklySummary.changeColor = '#08ad08';
      }
      else{
        const change = this.weeklySummary.previousWeek - this.weeklySummary.currentWeek;
        this.weeklySummary.change = change * 100/ this.weeklySummary.previousWeek;
        this.weeklySummary.changeDisplay = `-${this.weeklySummary.change.toFixed(2)}`;
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
        this.monthlySummary.changeDisplay = `+${this.monthlySummary.change.toFixed(2)}`;
        this.monthlySummary.changeColor = '#08ad08';
      }
      else{
        const change = this.monthlySummary.previousMonth - this.monthlySummary.currentMonth;
        this.monthlySummary.change = change * 100/ this.monthlySummary.previousMonth;
        this.monthlySummary.changeDisplay = `-${this.monthlySummary.change.toFixed(2)}`;
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
  },
  err => {
    this.toastr.error(err, 'ERROR!')
  });

  this.populateTaskwiseHours(this.currentUser.id);

  this.getDayWorkStatusByUser(this.currentUser.id);
  this.getTaskStatusCounts(this.currentUser.id);
 
    this.dashboardService.getApplicationTimeSummary(this.currentUser.id,this.selectedDate).subscribe(response => {
      this.productivityData= response.data;
    },
      err => {
        this.toastr.error(err, 'ERROR!')
      });
  // }

  }
filterDate(){
  this.ngOnInit();
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

  convertMinutesToHoursAndMinutes(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    const formattedMinutes = remainingMinutes.toFixed(0).padStart(2, '0'); // Limit to 2 digits and pad with leading zero if necessary
    return `${hours}h ${formattedMinutes}m`;
  }
  formatMillisecondsToTime(milliseconds: number): string {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);

    return `${hours}h ${minutes}m`;
  }
  formatHoursAndMinutes(hours: number): string {
    const roundedHours = Math.floor(hours);
    const minutes = Math.round((hours - roundedHours) * 60);

    return `${roundedHours}h ${minutes}m`;
  }

  populateTaskwiseHours(selectedUser){
    this.dashboardService.taskwiseHours(selectedUser).subscribe(response => {
      this.projectTasks = response.data;
    },
      err => {
        this.toastr.error(err, 'ERROR!')
      });
  }

  onTaskTimeMemberSelectionChange(member: any){
    this.member = JSON.parse(member.value);
    this.populateTaskwiseHours(this.member.id);
  }
  onProductivityMemberSelectionChange(member: any) {
    this.member = JSON.parse(member.value);
    this.getApplicationTimeSummary(this.member.id);
  }

  onTaskSummaryMemberSelectionChange(member: any) {
    this.member = JSON.parse(member.value);
    this.getTaskStatusCounts(this.member.id);
  }
  onDailyUpdateMemberSelectionChange(member: any){
    this.member = JSON.parse(member.value);
    this.getDayWorkStatusByUser(this.member.id);
  }


  populateMembers() {
    this.members = [];
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.members.push({ id: currentUser.id, name: "Me", email: currentUser.email });
    this.member = currentUser;
    this.timelog.getTeamMembers(this.member.id).subscribe({
      next: response => {
        this.timelog.getusers(response.data).subscribe({
          next: result => {
            result.data.forEach(user => {
              if (user.id != currentUser.id) {
                this.members.push({ id: user.id, name: `${user.firstName} ${user.lastName}`, email: user.email });
              }
            })
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
  onDateChange(event: MatDatepickerInputEvent<Date>) {
    this.selectedDate = event.value;
    this.ngOnInit();
   
  }

  getApplicationTimeSummary(selectedtUser){
    this.dashboardService.getApplicationTimeSummary(selectedtUser,this.selectedDate).subscribe(response => {
      this.productivityData= response.data;
    },
      err => {
        this.toastr.error(err, 'ERROR!')
      });
  }

  getTaskStatusCounts(selectedtUser:string){
    this.dashboardService.getTaskStatusCounts(selectedtUser).subscribe(response => {
      this.taskSummary= response.data;
    },
      err => {
        this.toastr.error(err, 'ERROR!')
      });
  }
  getDayWorkStatusByUser(selectedtUser:string){
    this.dashboardService.getDayWorkStatusByUser(selectedtUser, this.selectedDate ).subscribe(response => {
      this.dayWorkStatusByUser= response.data;
      console.log('project Resolve')
    },
      err => {
        this.toastr.error(err, 'ERROR!')
      });
  }
}
