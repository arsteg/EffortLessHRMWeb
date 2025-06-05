import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { ToastrService } from 'ngx-toastr';
import { AuthenticationService } from 'src/app/_services/authentication.service';
import { DashboardService } from 'src/app/_services/dashboard.Service';
import { ManageTeamService } from 'src/app/_services/manage-team.service';
import { TimeLogService } from 'src/app/_services/timeLogService';
import { CommonService } from 'src/app/_services/common.Service';
import { HoursWorked, MonthlySummary, WeeklySummary, ProjectTask } from 'src/app/models/dashboard/userdashboardModel';
import { LegendPosition, Color, ScaleType } from '@swimlane/ngx-charts';


@Component({
  selector: 'app-user-dashboard',
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.scss']
})
export class UserDashboardComponent implements OnInit {
  @ViewChild('timeSpentCard', { static: false }) timeSpentCard: ElementRef;
  timeSpentCardHeight: number =  400;
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
  hoursWorked: HoursWorked;
  weeklySummary: WeeklySummary;
  monthlySummary: MonthlySummary;
  projectTasks: ProjectTask[];
  productivityData = [];
  taskSummary = [];
  dayWorkStatusByUser: any[];
  selectedDate: Date = new Date;
  view: [number, number] = [300, 200];
  legendPosition: LegendPosition = LegendPosition.Below;
  colorScheme: Color = {
    domain: [],
    group: ScaleType.Ordinal, // Required for correct type
    selectable: true,
    name: 'custom',
  };
  selectedTimeSpent = 'Daily';
  styles: any;

  constructor(
    private timelog: TimeLogService,
    private manageTeamService: ManageTeamService,
    public commonService: CommonService,
    private auth: AuthenticationService,
    private dashboardService: DashboardService,
    private toastr: ToastrService
  ) {}

  ngAfterViewInit(){
    const html = document.getElementsByTagName('html')[0];
    this.styles = getComputedStyle(html);
    this.colorScheme.domain = [
      this.styles.getPropertyValue('--orange-10'),
      this.styles.getPropertyValue('--orange-30'),
      this.styles.getPropertyValue('--orange-60'),
      this.styles.getPropertyValue('--green'),
      this.styles.getPropertyValue('--red')
    ];
    this.timeSpentCardHeight = this.timeSpentCard?.nativeElement?.offsetHeight - 86;
  }

  ngOnInit(): void {
    this.currentProfile = JSON.parse(localStorage.getItem('currentUser'));
    this.populateDashboard(this.selectedDate);
    this.getDayWorkStatusByUser(this.currentUser.id);
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

  onDateChange(event: MatDatepickerInputEvent<Date>) {
    this.selectedDate = event.value;
    console.log(this.selectedDate)
    this.ngOnInit();
  }

  populateDashboard(selectedDate: Date) {

    let currentUser = JSON.parse(localStorage.getItem('currentUser'))

    this.dashboardService.HoursWorked(this.currentUser.id, selectedDate).subscribe(response => {
      this.hoursWorked = response.data;
      this.hoursWorked.increased = this.hoursWorked.today > this.hoursWorked.previousDay;
      this.hoursWorked.chartData = [{ name: 'Today', value: this.hoursWorked.today }, { name: 'Yesterday', value: this.hoursWorked.previousDay }];
      this.hoursWorked.chartColors = [{ name: 'Today', value: this.styles.getPropertyValue('--orange-60') }, { name: 'Yesterday', value: this.styles.getPropertyValue('--orange-30') }];
      this.hoursWorked.changeColor = this.styles.getPropertyValue('--orange-60');
      const change = this.hoursWorked.today - this.hoursWorked.previousDay;
      if (change != 0) {
        if (this.hoursWorked.increased) {
          if (this.hoursWorked.previousDay == 0) {
            this.hoursWorked.change = 100;
          }
          else {
            this.hoursWorked.change = change * 100 / this.hoursWorked.previousDay;
          }

          this.hoursWorked.changeDisplay = `+${this.hoursWorked.change.toFixed(2)}`;
          this.hoursWorked.changeColor = this.styles.getPropertyValue('--green');

        } else {
          const change = this.hoursWorked.previousDay - this.hoursWorked.today;
          this.hoursWorked.change = change * 100 / this.hoursWorked.previousDay;
          this.hoursWorked.change = this.hoursWorked.change === 100 ? -this.hoursWorked.change : this.hoursWorked.change;
          this.hoursWorked.changeDisplay = `${this.hoursWorked.change.toFixed(2)}`;
        }
      }
    },
      err => {
        this.toastr.error('Can not be Updated', 'ERROR!')
      });

    this.dashboardService.weeklySummary(this.currentUser.id, selectedDate).subscribe(response => {
      this.weeklySummary = response.data;
      this.weeklySummary.increased = this.weeklySummary.currentWeek > this.weeklySummary.previousWeek;
      this.weeklySummary.chartData = [{ name: 'This week', value: this.weeklySummary.currentWeek }, { name: 'Last week', value: this.weeklySummary.previousWeek }];
      this.weeklySummary.chartColors = [{ name: 'This week', value: this.styles.getPropertyValue('--orange-60') }, { name: 'Last week', value: this.styles.getPropertyValue('--orange-30') }];
      this.weeklySummary.changeColor = this.styles.getPropertyValue('--orange-60');
      const change = this.weeklySummary.currentWeek - this.weeklySummary.previousWeek;
      if (change != 0) {
        if (this.weeklySummary.increased) {
          this.weeklySummary.change = change * 100 / (this.weeklySummary.previousWeek === 0 ? change : this.weeklySummary.previousWeek);
          this.weeklySummary.changeDisplay = `+${this.weeklySummary.change.toFixed(2)}`;
          this.weeklySummary.changeColor = this.styles.getPropertyValue('--green');
        }
        else {
          this.weeklySummary.change = change * 100 / (this.weeklySummary.previousWeek === 0 ? change : this.weeklySummary.previousWeek);
          this.weeklySummary.changeDisplay = `${this.weeklySummary.change.toFixed(2)}`;
        }
      }
    },
      err => {
        this.toastr.error(err, 'ERROR!')
      });

    this.dashboardService.monthlySummary(this.currentUser.id, selectedDate).subscribe(response => {
      this.monthlySummary = response.data;
      this.monthlySummary.increased = this.monthlySummary.currentMonth > this.monthlySummary.previousMonth;
      this.monthlySummary.chartData = [{ name: 'This month', value: this.monthlySummary.currentMonth }, { name: 'Last month', value: this.monthlySummary.previousMonth }];
      this.monthlySummary.chartColors = [{ name: 'This month', value: this.styles.getPropertyValue('--orange-60') }, { name: 'Last month', value: this.styles.getPropertyValue('--orange-30') }];
      this.monthlySummary.changeColor = this.styles.getPropertyValue('--orange-60');
      const change = this.monthlySummary.currentMonth - this.monthlySummary.previousMonth;
      if (change != 0) {
        if (this.monthlySummary.increased) {
          this.monthlySummary.change = change * 100 / (this.monthlySummary.previousMonth == 0 ? change : this.monthlySummary.previousMonth);
          this.monthlySummary.changeDisplay = `+${this.monthlySummary.change.toFixed(2)}`;
          this.monthlySummary.changeColor = this.styles.getPropertyValue('--green');
        }
        else {
          this.monthlySummary.change = change * 100 / (this.monthlySummary.previousMonth == 0 ? change : this.monthlySummary.previousMonth);
          this.monthlySummary.changeDisplay = `${this.monthlySummary.change.toFixed(2)}`;
        }
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
    this.dashboardService.getApplicationTimeSummary(this.currentUser.id, selectedDate).subscribe(
      response => {
        this.productivityData = response.data.map(item => ({ name: item.name, value: item.value }));
      },
      err => {
        this.toastr.error(err, 'ERROR!')
      });

    this.dashboardService.getTaskStatusCounts(this.currentUser.id).subscribe(response => {
      this.taskSummary = response.data;
    },
      err => {
        this.toastr.error(err, 'ERROR!')
      });

  }
  labelFormatter(label: any): string {
    return label.value.toString();
  }

  getDayWorkStatusByUser(selectedtUser: string) {
    this.dashboardService.getDayWorkStatusByUser(selectedtUser, this.selectedDate).subscribe(response => {
      this.dayWorkStatusByUser = response.data;
    },
      err => {
        this.toastr.error(err, 'ERROR!')
      });
  }
}
