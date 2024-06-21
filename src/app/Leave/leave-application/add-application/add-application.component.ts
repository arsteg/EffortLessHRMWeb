import { Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LeaveService } from 'src/app/_services/leave.service';
import { CommonService } from 'src/app/common/common.service';
import * as moment from 'moment';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { AuthenticationService } from 'src/app/_services/authentication.service';
import { TimeLogService } from 'src/app/_services/timeLogService';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-add-application',
  templateUrl: './add-application.component.html',
  styleUrl: './add-application.component.css',
  encapsulation: ViewEncapsulation.None,
})
export class AddApplicationComponent {
  leaveApplication: FormGroup;
  allAssignee: any;
  bsValue = new Date();
  @Output() close: any = new EventEmitter();
  leaveCategories: any;
  fieldGroup: FormGroup;
  selectedDates: Date[] = [];
  @Output() leaveApplicationRefreshed: EventEmitter<void> = new EventEmitter<void>();
  portalView = localStorage.getItem('adminView');
  currentUser = JSON.parse(localStorage.getItem('currentUser'));
  members: any[] = [];
  member: any;
  @Input() tab: number;
  defaultCatSkip="0";
  defaultCatNext="100000";
  bsConfig: Partial<BsDatepickerConfig>;
  bsConfigEnd: Partial<BsDatepickerConfig>;
  minStartDate: Date;
  maxStartDate: Date;
  minEndDate: Date;
  maxEndDate: Date;
  tempLeaveCategory: any;
  totalLeaveApplied: number = 0;
  weekOffCount: number = 0;
  dayCounts = {};
  annualHolidayCount: number = 0;
  numberOfLeaveAppliedForSelectedCategory: number = 0;

  constructor(private fb: FormBuilder,
    private commonService: CommonService,
    private leaveService: LeaveService,
    private timeLogService: TimeLogService,
    private toast: ToastrService
  ) {
    this.leaveApplication = this.fb.group({
      employee: ['', Validators.required],
      leaveCategory: ['', Validators.required],
      level1Reason: [''],
      level2Reason: [''],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      comment: [''],
      status: [''],
      isHalfDayOption: [false],
      haldDays: this.fb.array([])
    });

    this.bsConfig = {
      dateInputFormat: 'YYYY-MM-DD',
      minDate: this.minStartDate,
      maxDate: this.maxStartDate
    };

    this.bsConfigEnd = {
      dateInputFormat: 'YYYY-MM-DD',
      minDate: this.minEndDate,
      maxDate: this.maxEndDate
    };
  }

  ngOnInit() {
    this.commonService.populateUsers().subscribe(result => {
      this.allAssignee = result && result.data && result.data.data;
    });
    this.getleaveCatgeoriesByUser();
    this.populateMembers();

    this.leaveApplication.get('startDate').valueChanges.subscribe(selectedDate => {
      this.onStartDateChange(selectedDate);
    });
    this.leaveApplication.get('endDate').valueChanges.subscribe(selectedDate => {
      this.onEndDateChange(selectedDate);
    });
    this.leaveApplication.get('leaveCategory').valueChanges.subscribe(leaveCategory => {
      this.tempLeaveCategory = this.leaveCategories.find(l=>l.leaveCategory._id === leaveCategory);
      this.handleLeaveCategoryChange();
    });
    this.getattendanceTemplatesByUser();
  }

  ngOnChanges() {
    this.handleLeaveCategoryChange();
  }

  handleLeaveCategoryChange() {
    if (!this.tempLeaveCategory || !this.tab) {
      // Exit if tempLeaveCategory or tab is not set yet
      return;
    }

    if (this.portalView == 'user') {
      if (this.tab === 1) {
        this.leaveApplication.patchValue({ employee: this.currentUser?.id });
      } else if (this.tab === 5) {
        this.leaveApplication.patchValue({ employee: this.member?.id });
      }
    }

    this.numberOfLeaveAppliedForSelectedCategory = 0;
    this.getAppliedLeaveCount(this.leaveApplication.value.employee, this.tempLeaveCategory.leaveCategory._id);
  }

  addHalfDayEntry() {
    this.haldDays.push(this.fb.group({
      date: [''],
      dayHalf: ['']
    }));
  }

  get haldDays() {
    return this.leaveApplication.get('haldDays') as FormArray;
  }

  // getleaveCatgeories() {
  //   const requestBody = { "skip": this.defaultCatSkip, "next": this.defaultCatNext };
  //   this.leaveService.getLeaveCategoriesByUser(this.currentUser.id).subscribe((res: any) => {
  //     this.leaveCategories = res.data;
  //   })
  // }

  getleaveCatgeoriesByUser() {
    this.leaveService.getLeaveCategoriesByUserv1(this.currentUser.id).subscribe((res: any) => {
      this.leaveCategories = res.data;
    });
  }

  getattendanceTemplatesByUser(){
    this.leaveService.getattendanceTemplatesByUser(this.currentUser.id).subscribe((res: any) => {
      if(res.status == "success"){
        let attandanceData = res.data;
        attandanceData.weeklyOfDays.forEach(day => {
          if (day != "false") {
            this.dayCounts[day] = 0;
          }
        });
      }
    })
  }

  populateMembers() {
    this.members = [];
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.members.push({ id: currentUser.id, name: "Me", email: currentUser.email });
    this.member = currentUser;
    this.timeLogService.getTeamMembers(this.member.id).subscribe({
      next: response => {
        this.timeLogService.getusers(response.data).subscribe({
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
  onMemberSelectionChange(member: any) {
    this.member = JSON.parse(member.value);
  }
  
  onSubmission() {
    if (this.leaveApplication.value) {
      // if (this.portalView == 'user') {
      //   if (this.tab === 1) {
      //     this.leaveApplication.value.employee = this.currentUser?.id;
      //   } else if (this.tab === 5) {
      //     this.leaveApplication.value.employee = this.member?.id;
      //   }
      // }
      let finalLeaveApplied = 0;
      this.leaveApplication.value.status = 'Pending';

      console.log(this.leaveApplication.value);

      // check for number of times leave applied for this category
      if(this.tempLeaveCategory.limitNumberOfTimesApply){
        if(this.tempLeaveCategory.maximumNumbersEmployeeCanApply <= this.numberOfLeaveAppliedForSelectedCategory){
          this.toast.error('You have crossed maximum limit with this leave category.', 'Error!');
          return;
        }
      }

      if(!this.tempLeaveCategory.isAnnualHolidayLeavePartOfNumberOfDaysTaken){
        finalLeaveApplied = this.totalLeaveApplied - this.weekOffCount;
      }

      if(!this.tempLeaveCategory.isWeeklyOffLeavePartOfNumberOfDaysTaken){
        finalLeaveApplied = finalLeaveApplied - this.weekOffCount;
      }

      if (this.tempLeaveCategory.maximumNumberConsecutiveLeaveDaysAllowed != null) {
        //this.toast.error('Error adding event notification', 'Error!');
        return;
      }

      if (this.tempLeaveCategory.minimumNumberOfDaysAllowed != null) {
      }

      this.leaveService.addLeaveApplication(this.leaveApplication.value).subscribe((res: any) => {
        this.closeModal();
        this.leaveApplicationRefreshed.emit();
      });

    }
  }

  closeModal() {
    this.leaveApplication.reset();
    this.close.emit(true);
  }
  // multiple date selection code

  addEvent(type: string, event: MatDatepickerInputEvent<Date>) {
    const selectedDate = event.value;
    if (selectedDate && !this.selectedDates.find(date => date.getTime() === selectedDate.getTime())) {
      this.selectedDates.push(selectedDate);
    }
  }

  onStartDateChange(selectedDate: Date): void {
    this.minEndDate = new Date(selectedDate);
    this.bsConfig = {
      ...this.bsConfig,
      minDate: this.minStartDate,
      maxDate: this.maxStartDate
    };

    this.bsConfigEnd = {
      ...this.bsConfig,
      minDate: this.minEndDate,
      maxDate: this.maxEndDate
    };

    this.weeklyCount();
  }

  onEndDateChange(selectedDate: Date): void {
    this.maxStartDate = new Date(selectedDate);
    this.bsConfig = {
      ...this.bsConfig,
      minDate: this.minStartDate,
      maxDate: this.maxStartDate
    };

    this.bsConfigEnd = {
      ...this.bsConfig,
      minDate: this.minEndDate,
      maxDate: this.maxEndDate
    };

    this.weeklyCount();
  }

  getDayName(date) {
    return date.toLocaleString('en-US', { weekday: 'short' });
  }

  weeklyCount(){
    this.weekOffCount = 0;
    this.totalLeaveApplied = 0;
    if(this.leaveApplication.get('startDate').value !='' && this.leaveApplication.get('endDate').value != ''){
      let start = this.leaveApplication.get('startDate').value;
      let end = this.leaveApplication.get('endDate').value;
      for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
        this.totalLeaveApplied++;
        let day = this.getDayName(date);
        if (this.dayCounts.hasOwnProperty(day)) {
          this.weekOffCount++;
        }
      }
      console.log(this.weekOffCount);
   }
  }

  holydayCount(){

  }

  getAppliedLeaveCount(userId: string, category: string){
    const requestBody = { "skip": "0", "next": "500" };
    const currentYear = new Date().getFullYear();
    this.leaveService.getAppliedLeaveCount(userId, requestBody).subscribe((res: any) => {
      if(res.status == "success"){
        let appliedLeave = res.data;
        this.numberOfLeaveAppliedForSelectedCategory = appliedLeave.filter((leave: any) => leave.leaveCategory == category && new Date(leave.addedBy).getFullYear() === currentYear).length;
      }
    });
  }
}