import { Component, Input, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LeaveService } from 'src/app/_services/leave.service';
import { TimeLogService } from 'src/app/_services/timeLogService';
import { CommonService } from 'src/app/_services/common.Service';

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



  constructor(private leaveService: LeaveService,
    private fb: FormBuilder,
    private commonService: CommonService,
    private timeLogService: TimeLogService) {
    this.leaveBalanceForm = this.fb.group({
      user: ['', Validators.required],
      cycle: ['', Validators.required],
      category: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.commonService.populateUsers().subscribe((res: any) => {
      this.members = res.data.data;
    });
    this.getAllLeaveCatgeories();
    this.populateMembers();
    this.getCategoriesByCurrentUser();

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

  getLeaveBalanceOfAllUsers() {
    // levae balance of all users
  }
  getLeaveBalance() {
    if (this.leaveBalanceForm.valid) {
      let payload = {
        user: this.leaveBalanceForm.value.user,
        cycle: this.leaveBalanceForm.value.cycle,
        category: this.leaveBalanceForm.value.category
      }
      if (this.portalView == 'user') {
        if (this.tab === 3) {
          payload.user = this.currentUser?.id;

        } else if (this.tab === 2) {
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

  selecteduser(user) {
    this.member = user;
    this.leaveService.getLeaveCategoriesByUserv1(user).subscribe((res: any) => {
      if (res.status == 'success') {
        this.leaveCategories = res.data;
      }
    })
  }

  getCategoriesByUser() {
    this.member = this.selectedUser;
    this.leaveService.getLeaveCategoriesByUserv1(this.selectedUser).subscribe((res: any) => {
      if (res.status == 'success') {
        this.leaveCategories = res.data;
      }
    })
  }

  getCategoriesByCurrentUser() {
    const user = this.currentUser?.id;
    this.member = user;
    this.leaveService.getLeaveCategoriesByUserv1(user).subscribe((res: any) => {
      if (res.status == 'success') {
        this.leaveCategories = res.data;
      }
    })
  }

  getlaveCategoryLabel(categoryId: string) {
    this.getLeaveBalance();
    const category = this.allCategories.find(category => category._id === categoryId);
    return category ? category.label : '';
  }
}
