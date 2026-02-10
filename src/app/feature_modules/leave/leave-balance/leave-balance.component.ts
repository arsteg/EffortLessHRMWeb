import { Component, Input, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LeaveService } from 'src/app/_services/leave.service';
import { TimeLogService } from 'src/app/_services/timeLogService';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { TableColumn } from 'src/app/models/table-column';

@Component({
  selector: 'app-leave-balance',
  templateUrl: './leave-balance.component.html',
  styleUrl: './leave-balance.component.css'
})
export class LeaveBalanceComponent {
  leaveBalanceForm: FormGroup;
  members: any = [];
  leaveBalance: any;
  leaveCategories: any;
  selectedUser: any;
  allCategories: any;
  member: any = JSON.parse(localStorage.getItem('currentUser') || '{}').id;
  @Input() tab: number;
  portalView = localStorage.getItem('adminView');
  currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  users: any = [];
  user: any;
  defaultCatSkip = "0";
  defaultCatNext = "100000";
  years = [];
  months = [
    'leave.month.january',
    'leave.month.february',
    'leave.month.march',
    'leave.month.april',
    'leave.month.may',
    'leave.month.june',
    'leave.month.july',
    'leave.month.august',
    'leave.month.september',
    'leave.month.october',
    'leave.month.november',
    'leave.month.december'
  ];
  extractedUrl: string = '';
  error: string = '';
  private isSettingDefaults = false;  // Prevent valueChanges during initialization
  private membersLoaded = false;      // Track if populateMembers completed
  columns: TableColumn[] = [
    {
      key: 'startMonth',
      name: this.translate.instant('leave.startMonth'),
      valueFn: (row: any) => this.getMonthName(row.startMonth)
    },
    {
      key: 'endMonth',
      name: this.translate.instant('leave.endMonth'),
      valueFn: (row: any) => this.getMonthName(row.endMonth)
    },
    {
      key: 'openingBalance',
      name: this.translate.instant('leave.openingBalance'),
      valueFn: (row: any) => this.formatDecimal(row.openingBalance)
    },
    {
      key: 'accruedBalance',
      name: this.translate.instant('leave.accruedBalance'),
      valueFn: (row: any) => this.formatDecimal(row.accruedBalance)
    },
    {
      key: 'leaveApplied',
      name: this.translate.instant('leave.leaveApplied'),
      valueFn: (row: any) => this.formatDecimal(row.leaveApplied)
    },
    {
      key: 'leaveRemaining',
      name: this.translate.instant('leave.leaveRemaining'),
      valueFn: (row: any) => this.formatDecimal(row.leaveRemaining)
    },
    {
      key: 'closingBalance',
      name: this.translate.instant('leave.closingBalance'),
      valueFn: (row: any) => this.formatDecimal(row.closingBalance)
    },
    {
      key: 'leaveTaken',
      name: this.translate.instant('leave.leaveTaken'),
      valueFn: (row: any) => this.formatDecimal(row.leaveTaken)
    }
  ];

  allData: any[] = [];
  totalRecords: number = 0;

  constructor(
    private leaveService: LeaveService,
    private fb: FormBuilder,
    private timeLogService: TimeLogService,
    private router: Router,
    private toast: ToastrService,
    private translate: TranslateService
  ) {
    this.translate.setDefaultLang('en');
    this.leaveBalanceForm = this.fb.group({
      user: ['', Validators.required],
      cycle: ['', Validators.required],
      category: ['', Validators.required]
    });
  }

  ngOnInit() {
    const fullUrl = this.router.url;

    // Extract the part after "/home/leave/"
    const basePath = '/home/leave/';
    if (fullUrl.includes(basePath)) {
      this.extractedUrl = fullUrl.split(basePath)[1];
    }

    this.getAllLeaveCatgeories();

    // Create years array BEFORE async operations
    const currentYear = new Date().getFullYear();
    const previousYear = currentYear - 1;
    const nextYear = currentYear + 1;
    this.years = [
      {
        label: `${this.translate.instant('leave.month.january')} ${previousYear.toString()} - ${this.translate.instant('leave.month.december')} ${previousYear.toString()}`,
        value: `${this.translate.instant('leave.month.january')}_${previousYear.toString()}-${this.translate.instant('leave.month.december')}_${previousYear.toString()}`
      },
      {
        label: `${this.translate.instant('leave.month.january')} ${currentYear.toString()} - ${this.translate.instant('leave.month.december')} ${currentYear.toString()}`,
        value: `${this.translate.instant('leave.month.january')}_${currentYear.toString()}-${this.translate.instant('leave.month.december')}_${currentYear.toString()}`
      },
      {
        label: `${this.translate.instant('leave.month.january')} ${nextYear.toString()} - ${this.translate.instant('leave.month.december')} ${nextYear.toString()}`,
        value: `${this.translate.instant('leave.month.january')}_${nextYear.toString()}-${this.translate.instant('leave.month.december')}_${nextYear.toString()}`
      }
    ];

    // Setup valueChanges with flag check
    this.leaveBalanceForm.valueChanges.subscribe(() => {
      if (!this.isSettingDefaults && this.leaveBalanceForm.valid) {
        this.getLeaveBalance();
      }
    });

    // Load members with completion callback
    this.populateMembers(() => {
      // This runs AFTER members are loaded
      this.setDefaultValuesAndLoad();
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['leaveBalanceForm'] && this.leaveBalanceForm.valid) {
      this.getLeaveBalance();
    }
  }

  formatDecimal(value: any): string {
    if (value == null || value === '') return '-';
    const num = Number(value);
    return isNaN(num) ? '-' : num.toFixed(1);
  }

  getMonthName(monthNumber: number): string {
    return this.translate.instant(this.months[monthNumber - 1]);
  }

  populateMembers(onComplete?: () => void): void {
    this.users = [];
    let currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

    // Always add current user first (synchronous)
    this.users.push({ id: currentUser.id, name: this.translate.instant('leave.userMe'), email: currentUser.email });
    this.user = currentUser;

    // Fetch team members (async)
    this.timeLogService.getTeamMembers(this.user.id).subscribe({
      next: response => {
        this.timeLogService.getusers(response.data).subscribe({
          next: result => {
            result.data.forEach(user => {
              if (user.id != currentUser.id) {
                this.users.push({ id: user.id, name: `${user.firstName} ${user.lastName}`, email: user.email });
              }
            });
            this.membersLoaded = true;
            if (onComplete) onComplete();  // SUCCESS PATH
          },
          error: () => {
            this.toast.error(this.translate.instant('leave.errorFetchingUsers'));
            this.membersLoaded = true;
            if (onComplete) onComplete();  // ERROR PATH
          }
        });
      },
      error: () => {
        this.toast.error(this.translate.instant('leave.errorFetchingTeamMembers'));
        this.membersLoaded = true;
        if (onComplete) onComplete();  // ERROR PATH
      }
    });
  }

  onMemberSelectionChange(member: any) {
    this.member = JSON.parse(member.value);
  }

  getLeaveBalance() {
    if (this.leaveBalanceForm.valid) {
      let payload = {
        user: this.leaveBalanceForm.value.user,
        cycle: this.leaveBalanceForm.value.cycle?.toUpperCase(),
        category: this.leaveBalanceForm.value.category
      };
      // if (this.portalView == 'user') {
      //   if (this.extractedUrl === 'my-leave-balance') {
      //     payload.user = this.currentUser?.id;
      //   } else if (this.extractedUrl === 'my-team-balance') {
      //     payload.user = this.member?.id;
      //   }
      // }
      this.leaveService.getLeaveBalance(payload).subscribe({
        next: (res: any) => {
          this.leaveBalance = res.data;
          this.allData = this.leaveBalance;
          this.totalRecords = this.leaveBalance.length;
        },
        error: () => {
          this.toast.error(this.translate.instant('leave.errorFetchingBalance'));
        }
      });
    } else {
      this.error = this.translate.instant('leave.formInvalidError');
    }
  }

  getAllLeaveCatgeories() {
    const requestBody = { "skip": this.defaultCatSkip, "next": this.defaultCatNext };
    this.leaveService.getAllLeaveCategories(requestBody).subscribe({
      next: (res: any) => {
        this.allCategories = res.data;
      },
      error: () => {
        this.toast.error(this.translate.instant('leave.errorFetchingCategories'));
      }
    });
  }

  selecteduser(userId: string) {
    this.member = userId;

    // Clear the error and form controls initially
    this.error = '';
    this.leaveCategories = [];
    this.isSettingDefaults = true;
    this.leaveBalanceForm.patchValue({ category: '' });
    this.leaveBalanceForm.patchValue({ user: userId });

    this.leaveService.getLeaveCategoriesByUserv1(userId).subscribe(
      {
        next: (res: any) => {
          if (res.status === 'success') {
            this.leaveCategories = res.data;
            this.error = '';

            // Auto-select first category if available
            if (this.leaveCategories && this.leaveCategories.length > 0) {
              const firstCategoryId = this.leaveCategories[0]?.leaveCategory?._id;
              if (firstCategoryId) {
                this.leaveBalanceForm.patchValue({ category: firstCategoryId });
              }
            }

            // Re-enable auto-trigger and load if form is valid
            this.isSettingDefaults = false;
            if (this.leaveBalanceForm.valid) {
              this.getLeaveBalance();
            }
          } else if (res.status === 'failure') {
            this.leaveCategories = [];
            this.leaveBalanceForm.patchValue({ category: '' });
            this.error = this.translate.instant('leave.noCategoriesAssigned');
            this.isSettingDefaults = false;
          }
        },
        error: () => {
          this.leaveCategories = [];
          this.leaveBalanceForm.patchValue({ category: '' });
          this.error = this.translate.instant('leave.errorFetchingCategoriesGeneric');
          this.isSettingDefaults = false;
        }
      }
    );
  }

  private setDefaultValuesAndLoad(): void {
    this.isSettingDefaults = true;  // Disable valueChanges auto-trigger

    const currentUser = this.currentUser?.id;

    // Set user default (logged-in user)
    this.leaveBalanceForm.patchValue({ user: currentUser });
    this.member = currentUser;

    // Set cycle default (current year - index 1 in years array)
    if (this.years && this.years.length > 1) {
      const currentYearCycle = this.years[1].value;  // Middle option = current year
      this.leaveBalanceForm.patchValue({ cycle: currentYearCycle });
    }

    // Fetch categories for current user
    this.leaveService.getLeaveCategoriesByUserv1(currentUser).subscribe({
      next: (res: any) => {
        if (res.status === 'success') {
          this.leaveCategories = res.data;

          // Auto-select first category if available
          if (this.leaveCategories && this.leaveCategories.length > 0) {
            const firstCategoryId = this.leaveCategories[0]?.leaveCategory?._id;
            if (firstCategoryId) {
              this.leaveBalanceForm.patchValue({ category: firstCategoryId });
            }
          }

          // Form is complete - trigger single load
          this.isSettingDefaults = false;
          if (this.leaveBalanceForm.valid) {
            this.getLeaveBalance();  // Explicit single call
          }
        } else {
          this.isSettingDefaults = false;
          this.toast.error(this.translate.instant('leave.noCategoriesAssigned'));
        }
      },
      error: () => {
        this.isSettingDefaults = false;
        this.toast.error(this.translate.instant('leave.errorFetchingCategories'));
      }
    });
  }

  getlaveCategoryLabel(categoryId: string) {
    this.getLeaveBalance();
    const category = this.allCategories.find(category => category._id === categoryId);
    return category ? category.label : '';
  }
}