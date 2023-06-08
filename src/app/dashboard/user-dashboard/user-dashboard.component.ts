import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AuthenticationService } from 'src/app/_services/authentication.service';
import { DashboardService } from 'src/app/_services/dashboard.Service';
import { ManageTeamService } from 'src/app/_services/manage-team.service';
import { TimeLogService } from 'src/app/_services/timeLogService';
import { CommonService } from 'src/app/common/common.service';
import { HoursWorked, MonthlySummary, WeeklySummary, ProjectTask } from 'src/app/models/dashboard/userdashboardModel';

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
  role = localStorage.getItem('roleName');
  hoursWorked: HoursWorked
  weeklySummary: WeeklySummary
  monthlySummary: MonthlySummary
  projectTasks: ProjectTask[]

  constructor(
    private timelog: TimeLogService,
    private manageTeamService: ManageTeamService,
    public commonService: CommonService,
    private auth: AuthenticationService,
    private dashboardService: DashboardService,
    private toastr: ToastrService
  ) {

  }

  ngOnInit(): void {
    let currentUser = JSON.parse(localStorage.getItem('currentUser'))
    const currentDate = new Date();
    this.dashboardService.HoursWorked(this.currentUser.id, currentDate).subscribe(response => {
      this.hoursWorked = response.data;
      this.hoursWorked.increased = this.hoursWorked.today > this.hoursWorked.previousDay;
      if (this.hoursWorked.increased) {
        const change = this.hoursWorked.today - this.hoursWorked.previousDay;
        this.hoursWorked.change = change * 100 / this.hoursWorked.previousDay;
        this.hoursWorked.changeDisplay = `+${this.hoursWorked.change.toFixed(2)}`;
        this.hoursWorked.changeColor = '#08ad08';
      } else {
        const change = this.hoursWorked.previousDay - this.hoursWorked.today;
        this.hoursWorked.change = change * 100 / this.hoursWorked.previousDay;
        this.hoursWorked.changeDisplay = `-${this.hoursWorked.change.toFixed(2)}`;
      }
    },
      err => {
        this.toastr.error('Can not be Updated', 'ERROR!')
      });

    this.dashboardService.weeklySummary(this.currentUser.id, currentDate).subscribe(response => {
      this.weeklySummary = response.data;
      this.weeklySummary.increased = this.weeklySummary.currentWeek > this.weeklySummary.previousWeek;
      if (this.weeklySummary.increased) {
        const change = this.weeklySummary.currentWeek - this.weeklySummary.previousWeek;
        this.weeklySummary.change = change * 100 / this.weeklySummary.previousWeek;
        this.weeklySummary.changeDisplay = `+${this.weeklySummary.change.toFixed(2)}`;
        this.weeklySummary.changeColor = '#08ad08';
      }
      else {
        const change = this.weeklySummary.previousWeek - this.weeklySummary.currentWeek;
        this.weeklySummary.change = change * 100 / this.weeklySummary.previousWeek;
        this.weeklySummary.changeDisplay = `-${this.weeklySummary.change.toFixed(2)}`;

      }

    },
      err => {
        this.toastr.error(err, 'ERROR!')
      });

    this.dashboardService.monthlySummary(this.currentUser.id, currentDate).subscribe(response => {
      this.monthlySummary = response.data;
      this.monthlySummary.increased = this.monthlySummary.currentMonth > this.monthlySummary.previousMonth;
      if (this.monthlySummary.increased) {
        const change = this.monthlySummary.currentMonth - this.monthlySummary.previousMonth;
        this.monthlySummary.change = change * 100 / this.monthlySummary.previousMonth;
        this.monthlySummary.changeDisplay = `+${this.monthlySummary.change.toFixed(2)}`;
        this.monthlySummary.changeColor = '#08ad08';
      }
      else {
        const change = this.monthlySummary.previousMonth - this.monthlySummary.currentMonth;
        this.monthlySummary.change = change * 100 / this.monthlySummary.previousMonth;
        this.monthlySummary.changeDisplay = `-${this.monthlySummary.change.toFixed(2)}`;
      }
    },
      err => {
        this.toastr.error(err, 'ERROR!')
      });

    this.dashboardService.taskwiseHours(this.currentUser.id).subscribe(response => {
      this.projectTasks = response.data;
    },
      err => {
        this.toastr.error(err, 'ERROR!')
      });

    this.dashboardService.taskwiseStatus(this.currentUser.id).subscribe(response => {
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
  

}