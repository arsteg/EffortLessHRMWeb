import { Component, Input, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LeaveService } from 'src/app/_services/leave.service';
import { TimeLogService } from 'src/app/_services/timeLogService';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

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
  member: any = JSON.parse(localStorage.getItem('currentUser')).id;
  @Input() tab: number;
  portalView = localStorage.getItem('adminView');
  currentUser = JSON.parse(localStorage.getItem('currentUser'));
  users: any = [];
  user: any;
  defaultCatSkip = "0";
  defaultCatNext = "100000";
  years = []; months = [
    'JANUARY',
    'FEBRUARY',
    'MARCH',
    'APRIL',
    'MAY',
    'JUNE',
    'JULY',
    'AUGUST',
    'SEPTEMBER',
    'OCTOBER',
    'NOVEMBER',
    'DECEMBER'
  ];
  extractedUrl: string = '';
  error: string = ''

  constructor(private leaveService: LeaveService,
    private fb: FormBuilder,
    private timeLogService: TimeLogService,
    private router: Router,
    private toast: ToastrService) {
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
      console.log(this.extractedUrl)
    }


    this.getAllLeaveCatgeories();
    this.populateMembers();
    if (this.extractedUrl != 'my-team-balance' && this.extractedUrl != 'leave-balance') { this.getCategoriesByCurrentUser(); }

    const currentYear = new Date().getFullYear();
    const previousYear = currentYear - 1;
    const nextYear = currentYear + 1;

    this.years = [
      { label: `JANUARY_${previousYear}-DECEMBER_${previousYear}` },
      { label: `JANUARY_${currentYear}-DECEMBER_${currentYear}` },
      { label: `JANUARY_${nextYear}-DECEMBER_${nextYear}` },
    ];

    this.leaveBalanceForm.valueChanges.subscribe(() => {
      if (this.leaveBalanceForm.valid) {
        this.getLeaveBalance();
      }
    });
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes['leaveBalanceForm'] && this.leaveBalanceForm.valid) {
      this.getLeaveBalance();
    }
  }

  getMonthName(monthNumber: number): string {
    return this.months[monthNumber - 1];
  }

  populateMembers() {
    this.users = [];
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.users.push({ id: currentUser.id, name: "Me", email: currentUser.email });
    this.user = currentUser;
    this.timeLogService.getTeamMembers(this.user.id).subscribe({
      next: response => {
        this.timeLogService.getusers(response.data).subscribe({
          next: result => {
            result.data.forEach(user => {
              if (user.id != currentUser.id) {
                this.users.push({ id: user.id, name: `${user.firstName} ${user.lastName}`, email: user.email });
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
  onMemberSelectionChange(member: any) {
    this.member = JSON.parse(member.value);
  }


  getLeaveBalance() {
    if (this.leaveBalanceForm.valid) {
      let payload = {
        user: this.leaveBalanceForm.value.user,
        cycle: this.leaveBalanceForm.value.cycle,
        category: this.leaveBalanceForm.value.category
      }
      if (this.portalView == 'user') {
        if (this.extractedUrl === 'my-leave-balance') {
          payload.user = this.currentUser?.id;

        } else if (this.extractedUrl === 'my-team-balance') {
          payload.user = this.member?.id;
        }
      }
      console.log(payload)
      this.leaveService.getLeaveBalance(payload).subscribe((res: any) => {
        this.leaveBalance = res.data;
      });
    }
  }

  getAllLeaveCatgeories() {
    const requestBody = { "skip": this.defaultCatSkip, "next": this.defaultCatNext };
    this.leaveService.getAllLeaveCategories(requestBody).subscribe((res: any) => {
      this.allCategories = res.data;
    })
  }
  selecteduser(userId: string) {
    this.member = userId;

    // Clear the error and form controls initially
    this.error = '';
    this.leaveCategories = []; // Clear leave categories
    this.leaveBalanceForm.patchValue({ category: '' }); // Reset the category field

    this.leaveService.getLeaveCategoriesByUserv1(userId).subscribe(
      (res: any) => {
        if (res.status === 'success') {
          this.leaveCategories = res.data;
          this.error = ''; // Clear any previous error message
        } else if (res.status === 'failure') {
          this.leaveCategories = []; // Clear categories as none are available
          this.leaveBalanceForm.patchValue({ category: '' }); // Reset the category field
          this.error =
            'It seems that leave categories have not been assigned to this employee yet. Please contact your administrator to assign the appropriate leave categories.';
        }
      },
      (err) => {
        // Handle HTTP or server errors
        this.leaveCategories = [];
        this.leaveBalanceForm.patchValue({ category: '' }); // Reset the category field
        this.error = 'An error occurred while fetching leave categories. Please try again later.';
      }
    );
  }



  getCategoriesByCurrentUser() {
    const user = this.currentUser?.id;
    this.member = user;
    this.leaveService.getLeaveCategoriesByUserv1(user).subscribe((res: any) => {
      if (res.status == 'success') {
        this.leaveCategories = res.data;
      }
      else if (res.status == 'failure') {
        this.toast.error('It seems that leave categories have not been assigned to this employee yet. Please contact your administrator to assign the appropriate leave categories.')
      }
    })
  }

  getlaveCategoryLabel(categoryId: string) {
    this.getLeaveBalance();
    const category = this.allCategories.find(category => category._id === categoryId);
    return category ? category.label : '';
  }
}
