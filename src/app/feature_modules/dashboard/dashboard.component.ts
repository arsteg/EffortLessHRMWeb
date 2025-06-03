import { Component, OnInit, inject, ViewEncapsulation, ViewChild, ElementRef } from '@angular/core';
import { CommonService } from 'src/app/_services/common.Service';
import { ManageTeamService } from 'src/app/_services/manage-team.service';
import { TimeLogService } from 'src/app/_services/timeLogService';
import { FormControl } from '@angular/forms';
import { AuthenticationService } from 'src/app/_services/authentication.service';
import { HoursWorked, MonthlySummary, ProjectTask, WeeklySummary } from 'src/app/models/dashboard/userdashboardModel';
import { DashboardService } from 'src/app/_services/dashboard.Service';
import { ToastrService } from 'ngx-toastr';
import { teamMember } from 'src/app/models/teamMember';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { Observable, Subscription } from 'rxjs';
import { User } from 'src/app/models/user';
import { StatefulComponent } from 'src/app/common/statefulComponent/statefulComponent';
import { ActivatedRoute, Router } from '@angular/router';
import { PaymentsComponent } from '../subscription/subscriptions-list/payments/payments.component';
import { MatDialog } from '@angular/material/dialog';
import { UpcomingPaymentModel } from 'src/app/models/dashboard/upcomingPaymentModel';
import { LastInvoiceModel } from 'src/app/models/dashboard/lastInvoiceModel';
import { SubscriptionService } from 'src/app/_services/subscription.service';
import { LegendPosition, Color, ScaleType } from '@swimlane/ngx-charts';
import { PreferenceService } from 'src/app/_services/user-preference.service';
import { PreferenceKeys } from 'src/app/constants/preference-keys.constant';
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DashboardComponent extends StatefulComponent implements OnInit {
  @ViewChild('timeSpentCard', { static: false }) timeSpentCard: ElementRef;
  timeSpentCardHeight: number = 400;

  //region Event notification related code
  users$: Observable<User[]>;
  private usersOnlineSubscription: Subscription;
  userId: string;
  projectwiseTimeSelectedMemberofAllTasks: string;
  productivitySelectedMember: any;
  taskSummarySelectedMember: any;
  dailySelectedMember: any;
  projectwiseTimeSelectedMember: string;
  view: [number, number] = [300, 200];

  //end region

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
  members: teamMember[];
  member: teamMember;
  selectedDate: Date = new Date;
  dayWorkStatusByUser: any[];
  subscription: any;
  readonly dialog = inject(MatDialog);
  upcomingPayment: UpcomingPaymentModel;
  lastInvoice: LastInvoiceModel;
  legendPosition: LegendPosition = LegendPosition.Right;
  colorScheme: Color = {
    domain: [],
    group: ScaleType.Ordinal, // Required for correct type
    selectable: true,
    name: 'custom',
  };
  selectedTabIndex: number = 0;
  selectedTimeSpent = 'Daily';
  styles: any;

  constructor(
    private timelog: TimeLogService,
    private manageTeamService: ManageTeamService,
    private auth: AuthenticationService,
    private dashboardService: DashboardService,
    private toastr: ToastrService,
    protected override commonService: CommonService,
    activatedRoute: ActivatedRoute,
    private subscriptionService: SubscriptionService,
    router: Router,
    private preferenceService: PreferenceService
  ) {
    super(commonService, activatedRoute, router);
  }

  onTabChange(index: number): void {
    this.selectedTabIndex = index;

    this.preferenceService.createOrUpdatePreference(
      this.currentUser.id,
      PreferenceKeys.DashboardTimeSpent,
      this.selectedTabIndex.toString()
    ).subscribe();

  }

  openPaymentsDialog() {
    const dialogRef = this.dialog.open(PaymentsComponent, {
      width: '500px',
      data: { subscriptionId: this.subscription.razorpaySubscription.id }
    });
  }

  ngAfterViewInit() {
    const html = document.getElementsByTagName('html')[0];
    this.styles = getComputedStyle(html);
    this.colorScheme.domain = [
      this.styles.getPropertyValue('--orange-10'),
      this.styles.getPropertyValue('--orange-30'),
      this.styles.getPropertyValue('--orange-60'),
      this.styles.getPropertyValue('--green'),
      this.styles.getPropertyValue('--red')
    ]
    this.timeSpentCardHeight = this.timeSpentCard?.nativeElement?.offsetHeight - 108;
  }

  // selectedUser: any;
  override ngOnInit(): void {
    //region event notifications
    // Register the user when the component initializes
    this.userId = JSON.parse(localStorage.getItem('currentUser')).id
    //this.socketService.registerUser(this.userId);

    // Emit user details to the server
    //this.socketService.emitUser(this.currentUser.id);

    //Subscribe to get the list of users online
    // this.socketService.getUsersOnline().subscribe((response) => {
    //   if(response.status=='success'){
    //     console.log(`This is the message from web socket as a notification: ${response.data}`);
    //   }
    //   else{
    //   }
    // });

    //end region

    this.populateTeamOfUsers();
    this.firstLetter = this.commonService.firstletter;

    let currentUser = JSON.parse(localStorage.getItem('currentUser'))
    this.auth.GetMe(currentUser.id).subscribe((response: any) => {
      this.currentProfile = response && response.data.users;
      this.subscription = response.data.companySubscription;
      return this.currentProfile;
    });
    this.populateMembers();
    const currentDate = this.selectedDate;

    this.dashboardService.HoursWorked(this.currentUser.id, currentDate).subscribe(response => {
      this.hoursWorked = response.data;
      this.hoursWorked.increased = this.hoursWorked.today > this.hoursWorked.previousDay;
      this.hoursWorked.chartData = [{ name: 'Today', value: this.hoursWorked.today }, { name: 'Yesterday', value: this.hoursWorked.previousDay }];
      this.hoursWorked.chartColors = [{ name: 'Today', value: this.styles.getPropertyValue('--orange-60') }, { name: 'Yesterday', value: this.styles.getPropertyValue('--orange-30') }];
      this.hoursWorked.changeColor = this.styles.getPropertyValue('--orange-60');
      if (this.hoursWorked.increased) {
        const change = this.hoursWorked.today - this.hoursWorked.previousDay;
        if (this.hoursWorked.previousDay == 0) {
          this.hoursWorked.change = 100;
        }
        else {
          this.hoursWorked.change = change * 100 / this.hoursWorked.previousDay;
        }
        this.hoursWorked.changeDisplay = isNaN(this.hoursWorked.change) ? '' : `+${this.hoursWorked.change.toFixed(2)}`;
        this.hoursWorked.changeColor = this.styles.getPropertyValue('--green');
      }
      else {
        const change = this.hoursWorked.previousDay - this.hoursWorked.today;
        this.hoursWorked.change = change * 100 / this.hoursWorked.previousDay;
        this.hoursWorked.changeDisplay = isNaN(this.hoursWorked.change) ? '' : `-${this.hoursWorked.change.toFixed(2)}`;
      }
    },
      err => {
        this.toastr.error('Can not be Updated', 'ERROR!')
      });

    this.dashboardService.weeklySummary(this.currentUser.id, currentDate).subscribe(response => {
      this.weeklySummary = response.data;
      this.weeklySummary.increased = this.weeklySummary.currentWeek > this.weeklySummary.previousWeek;
      this.weeklySummary.chartData = [{ name: 'This week', value: this.weeklySummary.currentWeek }, { name: 'Last week', value: this.weeklySummary.previousWeek }];
      this.weeklySummary.chartColors = [{ name: 'This week', value: this.styles.getPropertyValue('--orange-60') }, { name: 'Last week', value: this.styles.getPropertyValue('--orange-30') }];
      this.weeklySummary.changeColor = this.styles.getPropertyValue('--orange-60');
      if (this.weeklySummary.increased) {
        const change = this.weeklySummary.currentWeek - this.weeklySummary.previousWeek;
        this.weeklySummary.change = change * 100 / this.weeklySummary.previousWeek;
        this.weeklySummary.changeDisplay = isNaN(this.weeklySummary.change) ? '' : `+${this.weeklySummary.change.toFixed(2)}`;
        this.weeklySummary.changeColor = this.styles.getPropertyValue('--green');
      }
      else {
        const change = this.weeklySummary.previousWeek - this.weeklySummary.currentWeek;
        this.weeklySummary.change = change * 100 / this.weeklySummary.previousWeek;
        this.weeklySummary.changeDisplay = isNaN(this.monthlySummary.change) ? '' : `-${this.weeklySummary.change.toFixed(2)}`;
      }

    },
      err => {
        this.toastr.error(err, 'ERROR!')
      });

    this.dashboardService.monthlySummary(this.currentUser.id, currentDate).subscribe(response => {
      this.monthlySummary = response.data;
      this.monthlySummary.increased = this.monthlySummary.currentMonth > this.monthlySummary.previousMonth;
      this.monthlySummary.chartData = [{ name: 'This month', value: this.monthlySummary.currentMonth }, { name: 'Last month', value: this.monthlySummary.previousMonth }];
      this.monthlySummary.chartColors = [{ name: 'This month', value: this.styles.getPropertyValue('--orange-60') }, { name: 'Last month', value: this.styles.getPropertyValue('--orange-30') }];
      this.monthlySummary.changeColor = this.styles.getPropertyValue('--orange-60');
      if (this.monthlySummary.increased) {
        const change = this.monthlySummary.currentMonth - this.monthlySummary.previousMonth;
        this.monthlySummary.change = change * 100 / this.monthlySummary.previousMonth;
        this.monthlySummary.changeDisplay = isNaN(this.monthlySummary.change) ? '' : `+${this.monthlySummary.change.toFixed(2)}`;
        this.monthlySummary.changeColor = this.styles.getPropertyValue('--green');
      }
      else {
        const change = this.monthlySummary.previousMonth - this.monthlySummary.currentMonth;
        this.monthlySummary.change = change * 100 / this.monthlySummary.previousMonth;
        this.monthlySummary.changeDisplay = isNaN(this.monthlySummary.change) ? '' : `-${this.monthlySummary.change.toFixed(2)}`;
      }
    },
      err => {
        this.toastr.error(err, 'ERROR!')
      });

    this.dashboardService.taskwiseHours(this.currentUser.id).subscribe(response => {
      //this.projectTasks = response.data;
    },
      err => {
        this.toastr.error(err, 'ERROR!')
      });

    this.dashboardService.taskwiseStatus(this.currentUser.id).subscribe(response => {
    },
      err => {
        this.toastr.error(err, 'ERROR!')
      });

    this.populateTaskwiseHours(this.currentUser.id);

    this.getDayWorkStatusByUser(this.currentUser.id);
    this.getTaskStatusCounts(this.currentUser.id);

    this.dashboardService.getApplicationTimeSummary(this.currentUser.id, this.selectedDate).subscribe(response => {
      this.productivityData = response.data;
    },
      err => {
        this.toastr.error(err, 'ERROR!')
      });
    // }
    this.populateUpcomingPayment();
    this.populateLastInvoice();
    this.getPreferences();
    super.ngOnInit();
  }
  filterDate() {
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

  populateTaskwiseHours(selectedUser) {
    this.dashboardService.taskwiseHours(selectedUser).subscribe(response => {
      this.projectTasks = response.data;
    },
      err => {
        this.toastr.error(err, 'ERROR!')
      });
  }

  onTaskTimeMemberSelectionChange(member: any) {
    this.member = member;
    this.populateTaskwiseHours(this.member.id);

    this.preferenceService.createOrUpdatePreference(
      this.currentUser.id,
      PreferenceKeys.DashboardProjectwiseMember,
      this.member ? JSON.stringify(this.member) : ''
    ).subscribe();

  }
  onProductivityMemberSelectionChange(member: any) {
    this.member = member;
    this.getApplicationTimeSummary(this.member.id);
  }

  onTaskSummaryMemberSelectionChange(member: any) {
    this.member = member;
    this.getTaskStatusCounts(this.member.id);
  }
  onDailyUpdateMemberSelectionChange(member: any) {
    this.member = member;
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
    if (event.value) {
      this.selectedDate = event.value;
      this.ngOnInit();
    } else {
      this.toastr.error('Select a valid date', 'Error')
    }

  }

  getApplicationTimeSummary(selectedtUser) {
    this.dashboardService.getApplicationTimeSummary(selectedtUser, this.selectedDate).subscribe(response => {
      this.productivityData = response.data;
    },
      err => {
        this.toastr.error(err, 'ERROR!')
      });
  }

  getTaskStatusCounts(selectedtUser: string) {
    this.dashboardService.getTaskStatusCounts(selectedtUser).subscribe(response => {
      this.taskSummary = response.data;
    },
      err => {
        this.toastr.error(err, 'ERROR!')
      });
  }
  getDayWorkStatusByUser(selectedtUser: string) {
    this.dashboardService.getDayWorkStatusByUser(selectedtUser, this.selectedDate).subscribe(response => {
      this.dayWorkStatusByUser = response.data;
      console.log('project Resolve')
    },
      err => {
        this.toastr.error(err, 'ERROR!')
      });
  }
  captureState(): any {
    return {
      projectwiseTimeSelectedMember: this.projectwiseTimeSelectedMember,
      projectwiseTimeSelectedMemberofAllTasks: this.projectwiseTimeSelectedMemberofAllTasks,
      projectTasks: this.projectTasks,
      dayWorkStatusByUser: this.dayWorkStatusByUser
    };
  }

  restoreState(state: any): void {
    if (state) {
      if (state.projectwiseTimeSelectedMember) {
        this.projectwiseTimeSelectedMember = state.projectwiseTimeSelectedMember;
      }
      if (state.projectwiseTimeSelectedMemberofAllTasks) {
        this.projectwiseTimeSelectedMemberofAllTasks = state.projectwiseTimeSelectedMemberofAllTasks;
        const member = JSON.parse(state.projectwiseTimeSelectedMemberofAllTasks);
        this.populateTaskwiseHours(member.id);
      }
      if (state.projectwiseTimeSelectedMember) {
        this.projectwiseTimeSelectedMember = state.projectwiseTimeSelectedMember;
        const member = JSON.parse(state.projectwiseTimeSelectedMember);
        this.getDayWorkStatusByUser(member.id);
      }
      if (state.projectTasks) {
        this.projectTasks = state.projectTasks;
      }
      if (state.dayWorkStatusByUser) {
        this.dayWorkStatusByUser = state.dayWorkStatusByUser;
      }
    }
  }

  getAddonsAmount() {
    return this.subscription?.addOns.reduce((acc, addon) => acc + addon.item.amount, 0) / 100;
  }
  populateUpcomingPayment() {
    this.subscriptionService.getUpcomingPayment().subscribe(response => {
      this.upcomingPayment = response.data;
    },
      err => {
        console.log(err);
      });
  }
  populateLastInvoice() {
    this.subscriptionService.getLastInvoice().subscribe(response => {
      this.lastInvoice = response.data;
    },
      err => {
        console.log(err);
      });
  }

  getPreferences() {
    this.preferenceService.getPreferenceByKey(PreferenceKeys.DashboardTimeSpent, this.currentUser?.id)
      .subscribe({
        next: (response: any) => {
          const preferences = response?.data?.preferences || [];
          const match = preferences.find((pref: any) =>
            pref?.preferenceOptionId?.preferenceKey === PreferenceKeys.DashboardTimeSpent
          );
          this.selectedTabIndex = +match?.preferenceOptionId?.preferenceValue || 0;
        },
        error: (err) => {
          console.error('Failed to load language preference', err);
          this.selectedTabIndex = + 0;
        }
      });
  }
}
