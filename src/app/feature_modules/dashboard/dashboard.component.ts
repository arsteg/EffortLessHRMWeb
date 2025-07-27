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

  // Event notification related code
  users$: Observable<User[]>;
  private usersOnlineSubscription: Subscription;
  userId: string;
  projectwiseTimeSelectedMemberofAllTasks: teamMember;
  view: [number, number] = [300, 200];

  selectedManager: any;
  selectedUsers: any;
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
    group: ScaleType.Ordinal,
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

  onTimeSpentChange(value: string): void {
    this.selectedTimeSpent = value;
    this.updateTimeSpentData();
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
    ];
    this.timeSpentCardHeight = this.timeSpentCard?.nativeElement?.offsetHeight - 108;
  }

  override ngOnInit(): void {
    this.userId = this.currentUser.id;
    this.populateTeamOfUsers();
    this.firstLetter = this.commonService.firstletter;

    this.auth.GetMe(this.currentUser.id).subscribe((response: any) => {
      this.currentProfile = response?.data.users;
      this.subscription = response.data.companySubscription;
    });

    this.populateMembers();
    this.updateDashboardData();
    this.populateUpcomingPayment();
    this.populateLastInvoice();
    this.getPreferences();
    super.ngOnInit();
  }

  filterDate() {
    this.updateDashboardData();
  }

  populateTeamOfUsers() {
    this.manageTeamService.getAllUsers().subscribe({
      next: result => {
        this.teamOfUsers = result.data.data;
        this.teamOfUsers.forEach((user: any) => {
          if (user.id === this.currentUser.id) {
            this.selectedManager = user;
            this.teamLead(user);
          }
        });
      },
      error: error => {}
    });
  }

  teamLead(user: any) {
    this.selectedManager = user;
    this.timelog.getTeamMembers(user.id).subscribe({
      next: response => {
        this.timelog.getusers(response.data).subscribe({
          next: result => {
            this.selectedUsers = result.data;
            this.teamOfUsers.forEach((user: any) => {
              user['isChecked'] = this.selectedUsers.some((selectedUser: any) => selectedUser.id === user.id);
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
    const formattedMinutes = remainingMinutes.toFixed(0).padStart(2, '0');
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

  populateTaskwiseHours(selectedUser: string) {
    this.dashboardService.taskwiseHours(selectedUser).subscribe({
      next: response => {
        this.projectTasks = response.data;
      },
      error: err => {
        this.toastr.error(err, 'ERROR!');
      }
    });
  }

  onMemberSelectionChange(member: teamMember) {
    this.member = member;
    this.updateDashboardData();
    this.preferenceService.createOrUpdatePreference(
      this.currentUser.id,
      PreferenceKeys.DashboardProjectwiseMember,
      JSON.stringify(member)
    ).subscribe();
  }

  populateMembers() {
    this.members = [];
    this.members.push({ id: this.currentUser.id, name: "Me", email: this.currentUser.email });
    this.projectwiseTimeSelectedMemberofAllTasks = this.members[0];
    this.member = this.members[0];
    this.timelog.getTeamMembers(this.currentUser.id).subscribe({
      next: response => {
        this.timelog.getusers(response.data).subscribe({
          next: result => {
            result.data.forEach(user => {
              if (user.id !== this.currentUser.id) {
                this.members.push({ id: user.id, name: `${user.firstName} ${user.lastName}`, email: user.email });
              }
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

  onDateChange(event: MatDatepickerInputEvent<Date>) {
    if (event.value) {
      this.selectedDate = event.value;
      this.updateDashboardData();
    } else {
      this.toastr.error('Select a valid date', 'Error');
    }
  }

  getApplicationTimeSummary(selectedUser: string) {
    this.dashboardService.getApplicationTimeSummary(selectedUser, this.selectedDate).subscribe({
      next: response => {
        this.productivityData = response.data;
      },
      error: err => {
        this.toastr.error(err, 'ERROR!');
      }
    });
  }

  getTaskStatusCounts(selectedUser: string) {
    this.dashboardService.getTaskStatusCounts(selectedUser).subscribe({
      next: response => {
        this.taskSummary = response.data;
      },
      error: err => {
        this.toastr.error(err, 'ERROR!');
      }
    });
  }

  getDayWorkStatusByUser(selectedUser: string) {
    this.dashboardService.getDayWorkStatusByUser(selectedUser, this.selectedDate).subscribe({
      next: response => {
        this.dayWorkStatusByUser = response.data;
      },
      error: err => {
        this.toastr.error(err, 'ERROR!');
      }
    });
  }

  updateTimeSpentData() {
    const userId = this.member?.id || this.currentUser.id;
    const currentDate = this.selectedDate;

    if (this.selectedTimeSpent === 'Daily' || this.selectedTimeSpent === 'Weekly' || this.selectedTimeSpent === 'Monthly') {
      this.dashboardService.HoursWorked(userId, currentDate).subscribe({
        next: response => {
          this.hoursWorked = response.data;
          this.hoursWorked.increased = this.hoursWorked.today > this.hoursWorked.previousDay;
          this.hoursWorked.chartData = [
            { name: 'Today', value: this.hoursWorked.today },
            { name: 'Yesterday', value: this.hoursWorked.previousDay }
          ];
          this.hoursWorked.chartColors = [
            { name: 'Today', value: this.styles.getPropertyValue('--orange-60') },
            { name: 'Yesterday', value: this.styles.getPropertyValue('--orange-30') }
          ];
          this.hoursWorked.changeColor = this.styles.getPropertyValue('--orange-60');
          if (this.hoursWorked.increased) {
            const change = this.hoursWorked.today - this.hoursWorked.previousDay;
            this.hoursWorked.change = this.hoursWorked.previousDay === 0 ? 100 : (change * 100) / this.hoursWorked.previousDay;
            this.hoursWorked.changeDisplay = isNaN(this.hoursWorked.change) ? '' : `+${this.hoursWorked.change.toFixed(2)}`;
            this.hoursWorked.changeColor = this.styles.getPropertyValue('--green');
          } else {
            const change = this.hoursWorked.previousDay - this.hoursWorked.today;
            this.hoursWorked.change = (change * 100) / this.hoursWorked.previousDay;
            this.hoursWorked.changeDisplay = isNaN(this.hoursWorked.change) ? '' : `-${this.hoursWorked.change.toFixed(2)}`;
          }
        },
        error: err => {
          this.toastr.error('Cannot update Hours Worked', 'ERROR!');
        }
      });
    }

    if (this.selectedTimeSpent === 'Weekly' || this.selectedTimeSpent === 'Monthly') {
      this.dashboardService.weeklySummary(userId, currentDate).subscribe({
        next: response => {
          this.weeklySummary = response.data;
          this.weeklySummary.increased = this.weeklySummary.currentWeek > this.weeklySummary.previousWeek;
          this.weeklySummary.chartData = [
            { name: 'This week', value: this.weeklySummary.currentWeek },
            { name: 'Last week', value: this.weeklySummary.previousWeek }
          ];
          this.weeklySummary.chartColors = [
            { name: 'This week', value: this.styles.getPropertyValue('--orange-60') },
            { name: 'Last week', value: this.styles.getPropertyValue('--orange-30') }
          ];
          this.weeklySummary.changeColor = this.styles.getPropertyValue('--orange-60');
          if (this.weeklySummary.increased) {
            const change = this.weeklySummary.currentWeek - this.weeklySummary.previousWeek;
            this.weeklySummary.change = (change * 100) / this.weeklySummary.previousWeek;
            this.weeklySummary.changeDisplay = isNaN(this.weeklySummary.change) ? '' : `+${this.weeklySummary.change.toFixed(2)}`;
            this.weeklySummary.changeColor = this.styles.getPropertyValue('--green');
          } else {
            const change = this.weeklySummary.previousWeek - this.weeklySummary.currentWeek;
            this.weeklySummary.change = (change * 100) / this.weeklySummary.previousWeek;
            this.weeklySummary.changeDisplay = isNaN(this.weeklySummary.change) ? '' : `-${this.weeklySummary.change.toFixed(2)}`;
          }
        },
        error: err => {
          this.toastr.error('Cannot update Weekly Summary', 'ERROR!');
        }
      });
    }

    if (this.selectedTimeSpent === 'Monthly') {
      this.dashboardService.monthlySummary(userId, currentDate).subscribe({
        next: response => {
          this.monthlySummary = response.data;
          this.monthlySummary.increased = this.monthlySummary.currentMonth > this.monthlySummary.previousMonth;
          this.monthlySummary.chartData = [
            { name: 'This month', value: this.monthlySummary.currentMonth },
            { name: 'Last month', value: this.monthlySummary.previousMonth }
          ];
          this.monthlySummary.chartColors = [
            { name: 'This month', value: this.styles.getPropertyValue('--orange-60') },
            { name: 'Last month', value: this.styles.getPropertyValue('--orange-30') }
          ];
          this.monthlySummary.changeColor = this.styles.getPropertyValue('--orange-60');
          if (this.monthlySummary.increased) {
            const change = this.monthlySummary.currentMonth - this.monthlySummary.previousMonth;
            this.monthlySummary.change = (change * 100) / this.monthlySummary.previousMonth;
            this.monthlySummary.changeDisplay = isNaN(this.monthlySummary.change) ? '' : `+${this.monthlySummary.change.toFixed(2)}`;
            this.monthlySummary.changeColor = this.styles.getPropertyValue('--green');
          } else {
            const change = this.monthlySummary.previousMonth - this.monthlySummary.currentMonth;
            this.monthlySummary.change = (change * 100) / this.monthlySummary.previousMonth;
            this.monthlySummary.changeDisplay = isNaN(this.monthlySummary.change) ? '' : `-${this.monthlySummary.change.toFixed(2)}`;
          }
        },
        error: err => {
          this.toastr.error('Cannot update Monthly Summary', 'ERROR!');
        }
      });
    }
  }

  updateDashboardData() {
    const userId = this.member?.id || this.currentUser.id;
    this.updateTimeSpentData();
    this.populateTaskwiseHours(userId);
    this.getDayWorkStatusByUser(userId);
    this.getTaskStatusCounts(userId);
    this.getApplicationTimeSummary(userId);
  }

  captureState(): any {
    return {
      projectwiseTimeSelectedMemberofAllTasks: this.projectwiseTimeSelectedMemberofAllTasks,
      projectTasks: this.projectTasks,
      dayWorkStatusByUser: this.dayWorkStatusByUser
    };
  }

  restoreState(state: any): void {
    if (state) {
      if (state.projectwiseTimeSelectedMemberofAllTasks) {
        this.projectwiseTimeSelectedMemberofAllTasks = state.projectwiseTimeSelectedMemberofAllTasks;
        this.member = this.projectwiseTimeSelectedMemberofAllTasks;
        this.updateDashboardData();
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
    this.subscriptionService.getUpcomingPayment().subscribe({
      next: response => {
        this.upcomingPayment = response.data;
      },
      error: err => {
        console.log(err);
      }
    });
  }

  populateLastInvoice() {
    this.subscriptionService.getLastInvoice().subscribe({
      next: response => {
        this.lastInvoice = response.data;
      },
      error: err => {
        console.log(err);
      }
    });
  }

  getPreferences() {
    this.preferenceService.getPreferenceByKey(PreferenceKeys.DashboardTimeSpent, this.currentUser?.id).subscribe({
      next: (response: any) => {
        const preferences = response?.data?.preferences || [];
        if (!preferences || preferences.length === 0) {
          this.selectedTabIndex = 0;
          return;
        }
        const match = preferences.find((pref: any) =>
          pref?.preferenceOptionId?.preferenceKey === PreferenceKeys.DashboardTimeSpent
        );
        this.selectedTabIndex = +match?.preferenceOptionId?.preferenceValue || 0;
      },
      error: err => {
        console.error('Failed to load language preference', err);
        this.selectedTabIndex = 0;
      }
    });
  }
}