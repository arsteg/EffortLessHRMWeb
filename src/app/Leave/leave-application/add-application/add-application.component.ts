import { Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LeaveService } from 'src/app/_services/leave.service';
import { CommonService } from 'src/app/_services/common.Service';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
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
  defaultCatSkip = "0";
  defaultCatNext = "100000";
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
  bsConfig = {
    dateInputFormat: 'DD-MM-YYYY',
    showWeekNumbers: false
  };
  isSubmitClicked = false;

  constructor(private fb: FormBuilder,
    private commonService: CommonService,
    private leaveService: LeaveService,
    private timeLogService: TimeLogService,
    private toast: ToastrService,
    private holidayService: HolidaysService,
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
      halfDays: this.fb.array([]),
      leaveApplicationAttachments: this.fb.array([])
    });

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

    this.leaveApplication.get('leaveCategory').valueChanges.subscribe(leaveCategory => {
      this.tempLeaveCategory = this.leaveCategories.find(l => l.leaveCategory._id === leaveCategory);
      this.leaveDocumentUpload = this.tempLeaveCategory.leaveCategory
      // this.updateValidators();
      this.handleLeaveCategoryChange();
    });
    this.leaveApplication.get('employee').valueChanges.subscribe(employee => {
      this.leaveService.getLeaveCategoriesByUserv1(employee).subscribe((res: any) => {
        this.leaveCategories = res.data;
      });
    });
    this.getattendanceTemplatesByUser();

    this.leaveApplication.get('employee')?.valueChanges.subscribe(() => this.checkForDuplicateLeave());
    this.leaveApplication.get('leaveCategory')?.valueChanges.subscribe(() => this.checkForDuplicateLeave());
    this.leaveApplication.get('startDate')?.valueChanges.subscribe(() => this.checkForDuplicateLeave());
    this.leaveApplication.get('endDate')?.valueChanges.subscribe(() => this.checkForDuplicateLeave());
  }

  ngOnChanges() {
    this.handleLeaveCategoryChange();
  }
  checkForDuplicateLeave() {
    const employeeId = this.leaveApplication.get('employee')?.value;
    const leaveCategory = this.leaveApplication.get('leaveCategory')?.value;
    const startDate = this.leaveApplication.get('startDate')?.value;
    const endDate = this.leaveApplication.get('endDate')?.value;

    if (!employeeId || !leaveCategory || !startDate || !endDate) {
      return;
    }

    let payload = { skip: '', next: '' };
    this.leaveService.getLeaveApplicationbyUser(payload, employeeId).subscribe((res: any) => {
      this.existingLeaves = res.data;
      const formattedStartDate = this.stripTime(new Date(startDate));
      const formattedEndDate = this.stripTime(new Date(endDate));

      const isDuplicate = this.existingLeaves.some((leave: any) =>
        leave.employee === employeeId &&
        leave.leaveCategory === leaveCategory &&
        this.stripTime(new Date(leave.startDate)) === formattedStartDate &&
        this.stripTime(new Date(leave.endDate)) === formattedEndDate
      );

      if (isDuplicate) {
        this.leaveApplication.setErrors({ duplicateLeave: true });
      } else {
        this.leaveApplication.setErrors(null);
      }
    });
  }
  

  handleLeaveCategoryChange() {
    if (!this.tempLeaveCategory || !this.tab) {
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
    this.halfDays.push(this.fb.group({
      date: [''],
      dayHalf: ['']
    }));
  }

  get halfDays() {
    return this.leaveApplication.get('halfDays') as FormArray;
  }

  getAllLeaveCategories() {
    let payload = {
      skip: '',
      next: ''
    }
    this.leaveService.getAllLeaveCategories(payload).subscribe((res: any) => {
      this.leaveCategories = res.data;
    })
  }

  getleaveCatgeoriesByUser() {
    this.leaveService.getLeaveCategoriesByUserv1(this.currentUser.id).subscribe((res: any) => {
      this.leaveCategories = res.data;
    });
  }

  getattendanceTemplatesByUser() {
    this.leaveService.getattendanceTemplatesByUser(this.currentUser.id).subscribe((res: any) => {
      if (res.status == "success") {
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

  existingLeaves: any[] = [];

  getLeaveApplicationByUser() {
    let payload = {
      skip: '',
      next: ''
    }
    const employeeId = this.leaveApplication.get('employee')?.value;
    if (employeeId) {
      this.leaveService.getLeaveApplicationbyUser(payload, employeeId).subscribe((res: any) => {
        this.existingLeaves = res.data;
        console.log(this.leaveApplication.updateValueAndValidity());
        this.leaveApplication.updateValueAndValidity();
      });
    }
  }

  stripTime(date: Date): string {
    date.setUTCHours(0, 0, 0, 0);
    return date.toISOString();
  }

  onSubmission() {
    const employeeId = this.leaveApplication.get('employee')?.value;
    const leaveCategory = this.leaveApplication.get('leaveCategory')?.value;
    let startDate = this.leaveApplication.get('startDate')?.value;
    let endDate = this.leaveApplication.get('endDate')?.value;
    startDate = this.stripTime(new Date(startDate));
    endDate = this.stripTime(new Date(endDate));

    this.leaveApplication.patchValue({
      startDate: startDate,
      endDate: endDate
    });

    this.leaveApplication.value.status = 'Level 1 Approval Pending';
    let payload = { skip: '', next: '' }
    console.log(this.leaveApplication.value);
    this.leaveService.getLeaveApplicationbyUser(payload, employeeId).subscribe((res: any) => {
      console.log(res.data)
      this.existingLeaves = res.data;
      const isDuplicate = this.existingLeaves.some((leave: any) =>
        leave.employee === employeeId &&
        leave.leaveCategory === leaveCategory &&
        leave.startDate === startDate &&
        leave.endDate === endDate
      );
      console.log(isDuplicate);
      if (isDuplicate) {
        this.toast.error('A leave application with the same details already Exists.', 'Error');
        return;
      }
      else {
        this.leaveService.addLeaveApplication(this.leaveApplication.value).subscribe((res: any) => {
          this.leaveApplicationRefreshed.emit();
          this.leaveApplication.reset();
          this.toast.success('Leave Application Added Successfully');
        });
      }
    })
  }
 
  closeModal() {
    this.leaveApplication.reset();
    this.close.emit(true);
  }

  addEvent(type: string, event: MatDatepickerInputEvent<Date>) {
    const selectedDate = event.value;
    if (selectedDate && !this.selectedDates.find(date => date.getTime() === selectedDate.getTime())) {
      this.selectedDates.push(selectedDate);
    }
  }

 
  getDayName(date) {
    return date.toLocaleString('en-US', { weekday: 'short' });
  }

  weeklyCount() {
    this.weekOffCount = 0;
    this.totalLeaveApplied = 0;
    if (this.leaveApplication.get('startDate').value != '' && this.leaveApplication.get('endDate').value != '') {
      let start = this.leaveApplication.get('startDate').value;
      let end = this.leaveApplication.get('endDate').value;
      for (let date = new Date(start); (date.setUTCHours(0, 0, 0, 0)) <= (end.setUTCHours(0, 0, 0, 0)); date.setDate(date.getDate() + 1)) {
        this.totalLeaveApplied++;
        let day = this.getDayName(date);
        if (this.dayCounts.hasOwnProperty(day)) {
          this.weekOffCount++;
        }
      }
    }
  }

  getAppliedLeaveCount(userId: string, category: string) {
    const requestBody = { "skip": "0", "next": "500" };
    const currentYear = new Date().getFullYear();
    this.leaveService.getAppliedLeaveCount(userId, requestBody).subscribe((res: any) => {
      if (res.status == "success") {
        this.appliedLeave = res.data;
        this.numberOfLeaveAppliedForSelectedCategory = this.appliedLeave.filter((leave: any) => leave.leaveCategory == category && new Date(leave.addedBy).getFullYear() === currentYear).length;
      }
    });
  }

  checkDuplicateLeaveApplied(applyDate: Date): boolean {
    const applyDateOnly = new Date(applyDate.getFullYear(), applyDate.getMonth(), applyDate.getDate());
    console.log(this.appliedLeave);
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

  getHoliydaysCountBetweenAppliedLeave() {
    if (this.leaveApplication.get('startDate').value === "" || this.leaveApplication.get('endDate').value === "") {
      return;
    }
    let startDate = new Date(this.leaveApplication.get('startDate').value);
    let endDate = new Date(this.leaveApplication.get('endDate').value);

    const holidayYears = [startDate.getFullYear(), endDate.getFullYear()];
    const requestBody = { "skip": 0, "next": 500, "years": holidayYears };
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

  updateValidators() {
    if (this.leaveDocumentUpload) {
      this.leaveApplication.get('leaveApplicationAttachments')?.setValidators(Validators.required);
    }
    else {
      this.leaveApplication.get('leaveApplicationAttachments')?.clearValidators();
    }
    this.leaveApplication.get('leaveApplicationAttachments')?.updateValueAndValidity();
  }
}
