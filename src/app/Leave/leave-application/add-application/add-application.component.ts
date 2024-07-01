import { Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LeaveService } from 'src/app/_services/leave.service';
import { CommonService } from 'src/app/_services/common.Service';
import * as moment from 'moment';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { AuthenticationService } from 'src/app/_services/authentication.service';
import { TimeLogService } from 'src/app/_services/timeLogService';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { ToastrService } from 'ngx-toastr';
import { HolidaysService } from 'src/app/_services/holidays.service';


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
  appliedLeave: any;
  holidayCount: number;
  leaveDocumentUpload: boolean = false;
  selectedFile: File | null = null;

  constructor(private fb: FormBuilder,
    private commonService: CommonService,
    private leaveService: LeaveService,
    private timeLogService: TimeLogService,
    private toast: ToastrService,
    private holidayService: HolidaysService
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
      haldDays: this.fb.array([]),
      leaveApplicationAttachments: this.fb.array([])
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

  createAttachment(data: any = {}): FormGroup {
    return this.fb.group({
      attachmentType: [data.attachmentType || null],
      attachmentName: [data.attachmentName || null],
      attachmentSize: [data.attachmentSize || null],
      extention: [data.extention || null],
      file: [data.file || null]
    });
  }

  ngOnInit() {
    this.commonService.populateUsers().subscribe(result => {
      this.allAssignee = result && result.data && result.data.data;
    });
    this.getleaveCatgeoriesByUser();
    this.populateMembers();

    this.leaveApplication.get('startDate').valueChanges.subscribe(selectedDate => {
      this.onStartDateChange(selectedDate);
      this.getHoliydaysCountBetweenAppliedLeave();
    });
    this.leaveApplication.get('endDate').valueChanges.subscribe(selectedDate => {
      this.onEndDateChange(selectedDate);
      this.getHoliydaysCountBetweenAppliedLeave();
    });
    this.leaveApplication.get('leaveCategory').valueChanges.subscribe(leaveCategory => {
      this.tempLeaveCategory = this.leaveCategories.find(l=>l.leaveCategory._id === leaveCategory);
      console.log(this.tempLeaveCategory);
      this.leaveDocumentUpload = this.tempLeaveCategory.leaveCategory.isDocumentRequired
      this.updateValidators();
      this.handleLeaveCategoryChange();
    });
    this.leaveApplication.get('employee').valueChanges.subscribe(employee => {
      this.leaveService.getLeaveCategoriesByUserv1(employee.id).subscribe((res: any) => {
        this.leaveCategories = res.data;
      });
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
    if(this.leaveApplication.invalid){
      this.toast.error('Please enter valid data');
    }

    if (this.leaveApplication.valid) {
      let finalLeaveApplied = 0;
      this.leaveApplication.value.status = 'Pending';

      console.log(this.leaveApplication.value);

      //Check duplicate leave applied
      const dateArray = this.getDatesInRange(
        new Date(this.leaveApplication.get('startDate').value),
        new Date(this.leaveApplication.get('endDate').value));
      for (const date of dateArray) {
        const applyDate = new Date(date);
        if(this.checkDuplicateLeaveApplied(applyDate)){
          this.toast.error(`Already a leave applied with ${new Date(applyDate.getFullYear(), applyDate.getMonth(), applyDate.getDate())} date`, 'Error!');
          return;
        }
      }

      // Check for submit the leave before days
      const submitBefore = this.tempLeaveCategory.leaveCategory.submitBefore;
      const calculateBeforeCount = this.calculateDaysDifference(new Date(this.leaveApplication.get('startDate').value));
      if (submitBefore && submitBefore > 0 && calculateBeforeCount < submitBefore) {
        this.toast.error(`You should apply this leave before ${submitBefore} days`, 'Error!');
        return;
      }

      // check for number of times leave applied for this category
      if(this.tempLeaveCategory.limitNumberOfTimesApply){
        if(this.tempLeaveCategory.maximumNumbersEmployeeCanApply <= this.numberOfLeaveAppliedForSelectedCategory){
          this.toast.error('You have crossed maximum limit with this leave category.', 'Error!');
          return;
        }
      }

      if(!this.tempLeaveCategory.isAnnualHolidayLeavePartOfNumberOfDaysTaken){
        finalLeaveApplied = this.totalLeaveApplied - this.holidayCount;
      }

      if(!this.tempLeaveCategory.isWeeklyOffLeavePartOfNumberOfDaysTaken){
        finalLeaveApplied = finalLeaveApplied - this.weekOffCount;
      }

      // Check for minimum number of consecutive leave days allowed
      const minConsecutiveLeaveDays = this.tempLeaveCategory.leaveCategory.minimumNumberOfDaysAllowed;
      if (minConsecutiveLeaveDays && minConsecutiveLeaveDays > 0 && finalLeaveApplied > minConsecutiveLeaveDays) {
        this.toast.error(`Please apply minumum ${this.tempLeaveCategory.leaveCategory.minimumNumberOfDaysAllowed} day leave`, 'Error!');
        return;
      }

      // Check for maximum number of consecutive leave days allowed
      const maxConsecutiveLeaveDays = this.tempLeaveCategory.leaveCategory.maximumNumberConsecutiveLeaveDaysAllowed;
      if (maxConsecutiveLeaveDays && maxConsecutiveLeaveDays > 0 && finalLeaveApplied > maxConsecutiveLeaveDays) {
        this.toast.error(`You can't apply more than ${maxConsecutiveLeaveDays} consecutive leave days`, 'Error!');
        return;
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
      for (let date = new Date(start); (date.setUTCHours(0, 0, 0, 0)) <= (end.setUTCHours(0, 0, 0, 0)); date.setDate(date.getDate() + 1)) {
        this.totalLeaveApplied++;
        let day = this.getDayName(date);
        if (this.dayCounts.hasOwnProperty(day)) {
          this.weekOffCount++;
        }
      }
      console.log(this.weekOffCount);
   }
  }

  getAppliedLeaveCount(userId: string, category: string){
    const requestBody = { "skip": "0", "next": "500" };
    const currentYear = new Date().getFullYear();
    this.leaveService.getAppliedLeaveCount(userId, requestBody).subscribe((res: any) => {
      if(res.status == "success"){
        this.appliedLeave = res.data;
        this.numberOfLeaveAppliedForSelectedCategory = this.appliedLeave.filter((leave: any) => leave.leaveCategory == category && new Date(leave.addedBy).getFullYear() === currentYear).length;
      }
    });
  }

  checkDuplicateLeaveApplied(applyDate: Date): boolean {
    const applyDateOnly = new Date(applyDate.getFullYear(), applyDate.getMonth(), applyDate.getDate());

    let leaveAppliedCountForSameDate = this.appliedLeave.filter((leave: any) => {
      const startDate = new Date(leave.startDate);
      const endDate = new Date(leave.endDate);
      const startDateOnly = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
      const endDateOnly = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());

      return applyDateOnly >= startDateOnly && applyDateOnly <= endDateOnly;
    }).length;

    if (leaveAppliedCountForSameDate) {
      return true;
    }
    return false;
  }

  getDatesInRange(startDate: Date, endDate: Date): Date[] {
    const dateArray: Date[] = [];
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      dateArray.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return dateArray;
  }

  calculateDaysDifference(startDate: Date): number {
    const currentDate = new Date();
    const startDateOnly = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    const currentDateOnly = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());

    const timeDifference = startDateOnly.getTime() - currentDateOnly.getTime();
    const daysDifference = Math.floor(timeDifference / (1000 * 3600 * 24));
    return daysDifference;
  }

  getHoliydaysCountBetweenAppliedLeave(){
    if(this.leaveApplication.get('startDate').value === "" || this.leaveApplication.get('endDate').value === ""){
      return;
    }
    let startDate = new Date(this.leaveApplication.get('startDate').value);
    let endDate = new Date(this.leaveApplication.get('endDate').value);

    const holidayYears = [startDate.getFullYear(), endDate.getFullYear()];
    const requestBody = {"skip": 0, "next": 500, "years": holidayYears };
    this.holidayService.getHolidaysOfYear(requestBody).subscribe((res: any) => {
      if (res && res.data) {
        const holidays = res.data;
        let count: number = 0;
        let holidayData = holidays.map((holiday: any) => holiday.date);
        for (let date = startDate; date <= endDate; date.setDate(date.getDate() + 1)) {
          date.setUTCHours(0, 0, 0, 0);
          const dateStr = date.toISOString();
          if (holidayData.includes(dateStr)) {
            count++;
          }
        }
        this.holidayCount = count;
      }
    });
  }

  get leaveApplicationAttachments(): FormArray {
    return this.leaveApplication.get('leaveApplicationAttachments') as FormArray;
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.selectedFile = input.files[0];
      if (this.selectedFile) {
        const reader = new FileReader();
        reader.readAsDataURL(this.selectedFile);
        reader.onloadend = (e) => {
          if (e.target.readyState === FileReader.DONE) {
            const staticAttachments = [
              {
                attachmentType: this.selectedFile.type,
                attachmentName: this.selectedFile.name.split('.')[0],
                attachmentSize: this.selectedFile.size.toString(),
                extention: this.selectedFile.name.split('.')[1],
                file: e.target.result as string
              }
            ];

            staticAttachments.forEach(attachment => {
              this.leaveApplicationAttachments.push(this.createAttachment(attachment));
            });
          }
        };
      }
    }
  }

  updateValidators(){
    if(this.leaveDocumentUpload)
    {
      this.leaveApplication.get('leaveApplicationAttachments')?.setValidators(Validators.required);
    }
    else{
      this.leaveApplication.get('leaveApplicationAttachments')?.clearValidators();
    }
    this.leaveApplication.get('leaveApplicationAttachments')?.updateValueAndValidity();
  }
}
