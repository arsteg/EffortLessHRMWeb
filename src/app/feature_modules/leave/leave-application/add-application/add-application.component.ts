import { Component, EventEmitter, Input, Output, ViewEncapsulation, OnDestroy } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LeaveService } from 'src/app/_services/leave.service';
import { CommonService } from 'src/app/_services/common.Service';
import { TimeLogService } from 'src/app/_services/timeLogService';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { CompanyService } from 'src/app/_services/company.service';
import { UserService } from 'src/app/_services/users.service';
import { provideNativeDateAdapter } from '@angular/material/core';
import * as moment from 'moment';

@Component({
  selector: 'app-add-application',
  templateUrl: './add-application.component.html',
  providers: [provideNativeDateAdapter()],
  styleUrl: './add-application.component.css',
  encapsulation: ViewEncapsulation.None,
})
export class AddApplicationComponent implements OnDestroy {
  leaveApplication: FormGroup;
  allAssignee: any;
  bsValue = new Date();
  @Output() close: any = new EventEmitter();
  leaveCategories: any[] = [];
  selectedDates: Date[] = [];
  @Output() leaveApplicationRefreshed: EventEmitter<void> = new EventEmitter<void>();
  portalView = localStorage.getItem('adminView');
  currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  members: any[] = [];
  member: any;
  @Input() tab: number;
  tempLeaveCategory: any;
  totalLeaveApplied: number = 0;
  weekOffCount: number = 0;
  dayCounts = {};
  numberOfLeaveAppliedForSelectedCategory: number = 0;
  appliedLeave: any;
  holidayCount: number;
  leaveDocumentUpload: boolean = false;
  selectedFiles: File[] = [];
  bsConfig: Partial<BsDatepickerConfig> = {
    dateInputFormat: 'DD-MM-YYYY',
    showWeekNumbers: false,
    minDate: new Date()
  };
  endDateBsConfig: Partial<BsDatepickerConfig> = {
    dateInputFormat: 'DD-MM-YYYY',
    showWeekNumbers: false,
    minDate: new Date()
  };
  today: Date = new Date();
  showHalfDayOption: boolean = true;
  checkStatus: any;
  existingLeaves: any[] = [];
  minSelectableDate: Date;
  weeklyOffDates: Date[] = [];
  holidays: any;
  weeklyOffDays: string[] = [];
  attachments: '';
  appointmentDetail: any;
  maxHalfDaysAllowed = 0;
  halfDayLimitReached = false;
  reasonMandatory: boolean;
  documentMandatory: boolean;
  maximumLimit: number;
  maxConsecutiveLeaveDays: number = 0;
  maxSelectableEndDate: Date;
  formSubmitted: boolean = false;
  private employeeValueChangesSubscription: Subscription;
  private leaveCategoryValueChangesSubscription: Subscription;
  private startDateValueChangesSubscription: Subscription;
  private endDateValueChangesSubscription: Subscription;
  private lastFetchedEmployeeId: string | null = null;
  private holidaysFetchedYear: number | null = null;

  constructor(
    private fb: FormBuilder,
    private commonService: CommonService,
    private leaveService: LeaveService,
    private timeLogService: TimeLogService,
    private toast: ToastrService,
    private companyService: CompanyService,
    private translate: TranslateService,
    private userService: UserService
  ) {
    this.translate.setDefaultLang('en');
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
      leaveApplicationAttachments: ['', this.attachmentValidator()]
    }, { validators: this.customDateValidator() });
    this.leaveApplication.get('halfDays')?.setValidators([this.halfDayRequiredValidator(this.leaveApplication)]);
    this.leaveApplication.get('startDate')?.valueChanges.subscribe(() => this.updateHalfDayValidation());
    this.leaveApplication.get('endDate')?.valueChanges.subscribe(() => this.updateHalfDayValidation());
  }

  dateValidator(group: AbstractControl) {
    const startDate = group.get('startDate')?.value;
    const endDate = group.get('endDate')?.value;

    if (startDate && endDate && moment(startDate).isAfter(moment(endDate))) {
      group.get('endDate')?.setErrors({ dateRangeError: true });
      return null;
    }

    return null;
  }

  customDateValidator() {
    return (group: AbstractControl) => {
      const startDate = group.get('startDate')?.value;
      const endDate = group.get('endDate')?.value;

      if (startDate && endDate && moment(startDate).isAfter(moment(endDate))) {
        group.get('endDate')?.setErrors({ dateRangeError: true });
        return null;
      }

      // Check if the date range exceeds maximum consecutive leave days
      if (startDate && endDate && this.maxConsecutiveLeaveDays) {
        const start = moment(startDate);
        const end = moment(endDate);
        const daysDiff = end.diff(start, 'days') + 1; // +1 because start date counts as day 1
        
        if (daysDiff > this.maxConsecutiveLeaveDays) {
          group.get('endDate')?.setErrors({ maxConsecutiveDaysExceeded: true });
          return null;
        }
      }

      return null;
    };
  }

  attachmentValidator() {
    return (control: AbstractControl) => {
      // If documents are not mandatory, no validation needed
      if (!this.documentMandatory) {
        return null;
      }
      
      // If documents are mandatory, check if files are selected
      if (!this.selectedFiles || this.selectedFiles.length === 0) {
        return { attachmentRequired: true };
      }
      
      return null;
    };
  }

  ngOnInit() {
    this.populateMembers();

    this.leaveCategoryValueChangesSubscription = this.leaveApplication.get('leaveCategory').valueChanges.subscribe(leaveCategory => {
      this.leaveApplication.patchValue({
        startDate: null,
        endDate: null,
        halfDays: []
      });
      this.halfDays.clear?.();
      this.checkForDuplicateLeave();
      if (this.leaveCategories?.length) {
        this.tempLeaveCategory = this.leaveCategories.find(category => category?.leaveCategory?._id === leaveCategory);
        
        // Set maximum consecutive leave days from the selected category
        this.maxConsecutiveLeaveDays = this.tempLeaveCategory?.leaveCategory?.maximumNumberConsecutiveLeaveDaysAllowed || 0;
        
        // Update form validators to include the new max consecutive days limit
        this.updateFormValidators();
        
        if (this.tempLeaveCategory?.leaveCategory?.isDocumentRequired) {
          this.documentMandatory = this.tempLeaveCategory?.leaveCategory?.isDocumentRequired;
        }else {
          this.documentMandatory = false;
        }
        
        // Update attachment validation based on document requirement
        this.updateAttachmentValidation();

        if (this.tempLeaveCategory?.limitNumberOfTimesApply) {
          this.maximumLimit = this.tempLeaveCategory?.maximumNumbersEmployeeCanApply;
          this.validateMaxLeaveLimit();
        }
        this.leaveDocumentUpload = this.tempLeaveCategory?.leaveCategory?.documentRequired || false;
        this.leaveCategories?.map((category: any) => {
          this.reasonMandatory = category?.leaveTemplate?.isCommentMandatory;
          if (this.reasonMandatory) {
            this.leaveApplication.get('comment')?.setValidators([Validators.required]);
          } else {
            this.leaveApplication.get('comment')?.clearValidators();
          }

          this.leaveApplication.get('comment')?.updateValueAndValidity();
          if (category.leaveCategory._id === leaveCategory) {
            this.getSelectedUserAppointment();
            this.leaveApplication.patchValue({
              isHalfDayOption: category?.leaveCategory?.isHalfDayTypeOfLeave
            });
          }
        });
      }

      this.updateMinDate(new Date());
      this.handleLeaveCategoryChange();
      this.formSubmitted = false;
    });

    this.employeeValueChangesSubscription = this.leaveApplication.get('employee').valueChanges.subscribe(employee => {
      if (!employee) {
        return; // Skip if resetting or employee is empty
      }
      else {
        this.leaveService.getLeaveCategoriesByUserv1(employee).subscribe({
          next: (res: any) => {
            this.leaveCategories = res.data;
            this.checkStatus = res.status;
          },
          error: () => {
            this.toast.error(this.translate.instant('leave.errorFetchingCategories'));
          }
        });
      }
      this.leaveApplication.patchValue({
        leaveCategory: null,
        startDate: null,
        endDate: null,
        isHalfDayOption: false,
      });
      (this.leaveApplication.get('halfDays') as FormArray).clear();
      this.selectedFiles = [];
      this.leaveDocumentUpload = false;
      this.documentMandatory = false;
      this.checkForDuplicateLeave();
      
      // Reset max end date configuration when employee changes
      this.maxConsecutiveLeaveDays = 0;
      this.maxSelectableEndDate = null;
      this.endDateBsConfig = {
        ...this.endDateBsConfig,
        maxDate: null
      };
      
      // Update form validators after reset
      this.updateFormValidators();
      this.updateAttachmentValidation();
      this.formSubmitted = false;
    });

    if (this.portalView === 'user' && this.tab === 1 && this.currentUser.id) {
      this.leaveService.getLeaveCategoriesByUserv1(this.currentUser.id).subscribe({
        next: (res: any) => {
          this.leaveCategories = res.data;
          this.checkStatus = res.status;
        },
        error: () => {
          this.toast.error(this.translate.instant('leave.errorFetchingCategories'));
        }
      });
    }

    this.startDateValueChangesSubscription = this.leaveApplication.get('startDate')?.valueChanges.subscribe((startDate) => {
      // Clear end date when start date changes
      this.leaveApplication.patchValue({ endDate: null });
      
      // Update maximum end date based on start date and consecutive days limit
      this.updateMaxEndDate(startDate);
      
      this.checkForDuplicateLeave();
      this.calculateDateRangeAndLimitHalfDays();
    });
    this.endDateValueChangesSubscription = this.leaveApplication.get('endDate')?.valueChanges.subscribe((endDate) => {
      // Validate end date against maximum consecutive days limit
      if (endDate && this.leaveApplication.get('startDate')?.value && this.maxConsecutiveLeaveDays) {
        const startDate = moment(this.leaveApplication.get('startDate')?.value);
        const endDateMoment = moment(endDate);
        const daysDiff = endDateMoment.diff(startDate, 'days') + 1;
        
        if (daysDiff > this.maxConsecutiveLeaveDays) {
          this.leaveApplication.get('endDate')?.setErrors({ maxConsecutiveDaysExceeded: true });
        }
      }
      
      this.checkForDuplicateLeave();
      this.calculateDateRangeAndLimitHalfDays();
    });
  }

  ngOnDestroy() {
    if (this.employeeValueChangesSubscription) {
      this.employeeValueChangesSubscription.unsubscribe();
    }
    if (this.leaveCategoryValueChangesSubscription) {
      this.leaveCategoryValueChangesSubscription.unsubscribe();
    }
    if (this.startDateValueChangesSubscription) {
      this.startDateValueChangesSubscription.unsubscribe();
    }
    if (this.endDateValueChangesSubscription) {
      this.endDateValueChangesSubscription.unsubscribe();
    }
  }

  ngOnChanges() { }

  getSelectedUserAppointment() {
    let userId: string | undefined;

    if (this.portalView === 'user' && this.tab === 1) {
      userId = this.currentUser?.id;
    } else if (this.portalView === 'admin' || (this.portalView === 'user' && this.tab === 5)) {
      userId = this.leaveApplication.get('employee')?.value;
    }

    if (!userId) return;

    this.userService.getAppointmentByUserId(userId).subscribe((res: any) => {
      this.appointmentDetail = res.data;

      const joiningDate = new Date(this.appointmentDetail.joiningDate);
      const confirmationDate = new Date(this.appointmentDetail.confirmationDate);

      const eligibilityType = this.tempLeaveCategory?.dealWithNewlyJoinedEmployee;

      if (eligibilityType === 'eligibleImmediately') {
        this.updateMinDate(joiningDate);
      } else if (eligibilityType === 'eligibleAfterConfirmation') {
        this.updateMinDate(confirmationDate);
      }
    });
  }

  updateMinDate(baseDate: Date): void {
    let minDate = new Date(baseDate);

    if (this.tempLeaveCategory?.leaveCategory?.submitBefore) {
      const submitBeforeDays = parseInt(this.tempLeaveCategory.leaveCategory.submitBefore, 10);
      if (!isNaN(submitBeforeDays)) {
        minDate.setDate(minDate.getDate() + submitBeforeDays);
      }
    }

    this.minSelectableDate = minDate;
    this.bsConfig = {
      ...this.bsConfig,
      minDate: this.minSelectableDate
    };

    this.validateDates();
  }

  updateMaxEndDate(startDate: Date): void {
    if (!startDate || !this.maxConsecutiveLeaveDays) {
      this.maxSelectableEndDate = null;
      this.endDateBsConfig = {
        ...this.endDateBsConfig,
        maxDate: null
      };
      return;
    }

    // Calculate the maximum end date based on start date and consecutive days limit
    const maxEndDate = new Date(startDate);
    maxEndDate.setDate(maxEndDate.getDate() + this.maxConsecutiveLeaveDays - 1); // -1 because start date counts as day 1

    this.maxSelectableEndDate = maxEndDate;
    this.endDateBsConfig = {
      ...this.endDateBsConfig,
      maxDate: this.maxSelectableEndDate
    };
  }

  calculateDateRangeAndLimitHalfDays() {
    const start = this.leaveApplication.get('startDate')?.value;
    const end = this.leaveApplication.get('endDate')?.value;

    if (start && end) {
      const startDate = moment(start);
      const endDate = moment(end);
      const duration = endDate.diff(startDate, 'days') + 1;
      this.maxHalfDaysAllowed = duration;

      this.halfDayLimitReached = this.halfDays.length > this.maxHalfDaysAllowed;
    }
  }

  validateDates() {
    const startDate = this.leaveApplication.get('startDate')?.value;
    const endDate = this.leaveApplication.get('endDate')?.value;
    if (startDate && this.minSelectableDate && moment(startDate).isBefore(moment(this.minSelectableDate), 'day')) {
      this.leaveApplication.get('startDate')?.setErrors({ submitBeforeError: true });
    } else {
      if (this.leaveApplication.get('startDate')?.hasError('submitBeforeError')) {
        this.leaveApplication.get('startDate')?.updateValueAndValidity();
      }
    }

    if (endDate && this.minSelectableDate && moment(endDate).isBefore(moment(this.minSelectableDate), 'day')) {
      this.leaveApplication.get('endDate')?.setErrors({ submitBeforeError: true });
    } else {
      if (this.leaveApplication.get('endDate')?.hasError('submitBeforeError')) {
        this.leaveApplication.get('endDate')?.updateValueAndValidity();
      }
    }
  }

  getHolidays() {
    const currentYear = new Date().getFullYear();
    if (this.holidaysFetchedYear === currentYear) {
      return; // Skip if holidays for the current year are already fetched
    }

    const payload = {
      next: '', skip: '', status: '', year: currentYear
    };
    this.companyService.getHolidays(payload).subscribe({
      next: (res: any) => {
        this.holidays = res.data;
        this.holidaysFetchedYear = currentYear;
      },
      error: () => {
        this.toast.error(this.translate.instant('leave.errorFetchingHolidays'));
      }
    });
  }
  validateMaxLeaveLimit() {
    const employeeId = this.leaveApplication.get('employee')?.value;
    const leaveCategory = this.leaveApplication.get('leaveCategory')?.value;

    if (!employeeId || !leaveCategory || !this.tempLeaveCategory?.limitNumberOfTimesApply) {
      return;
    }

    // Count existing leave applications for the same category
    const existingLeaveApplications = this.existingLeaves.filter(leave => leave.leaveCategory?._id === leaveCategory).length;
    const totalLeaveApplications = existingLeaveApplications + 1; // +1 for the new application

    if (totalLeaveApplications > this.maximumLimit) {
      this.leaveApplication.get('leaveCategory')?.setErrors({ maxLeaveLimitExceeded: true });
    } else {
      if (this.leaveApplication.get('leaveCategory')?.hasError('maxLeaveLimitExceeded')) {
        const errors = { ...this.leaveApplication.get('leaveCategory')?.errors };
        delete errors['maxLeaveLimitExceeded'];
        this.leaveApplication.get('leaveCategory')?.setErrors(Object.keys(errors).length > 0 ? errors : null);
      }
    }
  }

  checkForDuplicateLeave() {
    const employeeId = this.leaveApplication.get('employee')?.value;
    const leaveCategory = this.leaveApplication.get('leaveCategory')?.value;
    const startDate = this.leaveApplication.get('startDate')?.value;
    const endDate = this.leaveApplication.get('endDate')?.value;

    if (!employeeId) {
      this.leaveApplication.setErrors(null);
      this.showHalfDayOption = true;
      return;
    }

    // Only fetch leaves if the employee ID has changed
    if (employeeId !== this.lastFetchedEmployeeId && employeeId) {
      let payload = { skip: '', next: '' };
      this.leaveService.getLeaveApplicationbyUser(payload, employeeId).subscribe({
        next: (res: any) => {
          this.existingLeaves = res.data;
          this.lastFetchedEmployeeId = employeeId;
          this.validateMaxLeaveLimit(); // Validate max limit after fetching leaves

          if (!leaveCategory || !startDate || !endDate) {
            this.leaveApplication.setErrors(null);
            this.showHalfDayOption = true;
            return;
          }

          const formattedStartDate = this.stripTime(new Date(startDate));
          const formattedEndDate = this.stripTime(new Date(endDate));

          const isOverlappingLeave = this.existingLeaves.some((leave: any) => {
            const leaveStartDate = this.stripTime(new Date(leave.startDate));
            const leaveEndDate = this.stripTime(new Date(leave.endDate));
            return leave.employee === employeeId &&
              leave.leaveCategory === leaveCategory &&
              (formattedStartDate <= leaveEndDate && formattedEndDate >= leaveStartDate);
          });

          if (isOverlappingLeave) {
            this.leaveApplication.setErrors({ duplicateLeave: true });
            this.showHalfDayOption = false;
            this.toast.error(this.translate.instant('leave.duplicateLeaveError'));
          } else {
            if (this.leaveApplication.hasError('duplicateLeave')) {
              const errors = { ...this.leaveApplication.errors };
              delete errors['duplicateLeave'];
              this.leaveApplication.setErrors(Object.keys(errors).length > 0 ? errors : null);
            }
            this.showHalfDayOption = true;
          }
        },
        error: () => {
          this.toast.error(this.translate.instant('leave.errorFetchingLeaves'));
        }
      });
    } else {
      // Use cached existingLeaves for validation
      this.validateMaxLeaveLimit();

      if (!leaveCategory || !startDate || !endDate) {
        this.leaveApplication.setErrors(null);
        this.showHalfDayOption = true;
        return;
      }

      const formattedStartDate = this.stripTime(new Date(startDate));
      const formattedEndDate = this.stripTime(new Date(endDate));

      const isOverlappingLeave = this.existingLeaves.some((leave: any) => {
        const leaveStartDate = this.stripTime(new Date(leave.startDate));
        const leaveEndDate = this.stripTime(new Date(leave.endDate));
        return leave.employee === employeeId &&
          leave.leaveCategory === leaveCategory &&
          (formattedStartDate <= leaveEndDate && formattedEndDate >= leaveStartDate);
      });

      if (isOverlappingLeave) {
        this.leaveApplication.setErrors({ duplicateLeave: true });
        this.showHalfDayOption = false;
        this.toast.error(this.translate.instant('leave.duplicateLeaveError'));
      } else {
        if (this.leaveApplication.hasError('duplicateLeave')) {
          const errors = { ...this.leaveApplication.errors };
          delete errors['duplicateLeave'];
          this.leaveApplication.setErrors(Object.keys(errors).length > 0 ? errors : null);
        }
        this.showHalfDayOption = true;
      }
    }
  }
  handleLeaveCategoryChange() {
    if (!this.tab) {
      return;
    }

    if (this.portalView == 'user') {
      if (this.tab === 1 || this.tab === 5) {
        if (!this.leaveApplication.get('employee')?.value) {
          this.leaveApplication.patchValue({ employee: this.currentUser?.id });
        }
      }
    }
    if (this.leaveApplication.get('employee')?.value) {
      this.getattendanceTemplatesByUser();
      this.getHolidays();
    }

    this.numberOfLeaveAppliedForSelectedCategory = 0;
    if (this.leaveApplication.value.employee && this.tempLeaveCategory?.leaveCategory?._id) {
      this.getAppliedLeaveCount(this.leaveApplication.value.employee, this.tempLeaveCategory.leaveCategory._id);
    }
  }

  halfDayRequiredValidator(formGroup: FormGroup) {
    return (formArray: FormArray): { [key: string]: any } | null => {
      const isHalfDayOption = formGroup.get('isHalfDayOption')?.value;
      if (!isHalfDayOption) {
        return null;
      }

      if (formArray.length === 0) {
        return { halfDayRequired: true };
      }

      for (let i = 0; i < formArray.length; i++) {
        const halfDayDate = formArray.at(i).get('date')?.value;
        const dayHalf = formArray.at(i).get('dayHalf')?.value;
        if (!halfDayDate || !dayHalf) {
          return { halfDayRequired: true };
        }
      }
      return null;
    };
  }

  updateHalfDayValidation() {
    this.halfDays.controls.forEach((control) => {
      control.get('date')?.updateValueAndValidity();
    });
  }

  addHalfDayEntry() {
    if (this.halfDays.length < this.maxHalfDaysAllowed) {
      this.halfDays.push(this.fb.group({
        date: [null, Validators.required],
        dayHalf: [null, Validators.required]
      }));
      this.halfDayLimitReached = this.halfDays.length >= this.maxHalfDaysAllowed;
    }
  }

  removeHalfDayEntry(index: number): void {
    this.halfDays.removeAt(index);
    this.halfDayLimitReached = this.halfDays.length >= this.maxHalfDaysAllowed;
  }

  onHalfDayChange() {
    (this.leaveApplication.get('halfDays') as FormArray).clear();
    if (this.leaveApplication.get('isHalfDayOption')?.value) {
      this.addHalfDayEntry();
    }
  }

  get halfDays() {
    return this.leaveApplication.get('halfDays') as FormArray;
  }

  getleaveCatgeoriesByUser() {
    return this.leaveService.getLeaveCategoriesByUserv1(this.currentUser.id).pipe(
      map((res: any) => res.data)
    );
  }

  getattendanceTemplatesByUser() {
    let userId = this.portalView === 'user' ? this.currentUser.id : this.leaveApplication.get('employee')?.value;
    if (!userId) {
      return;
    }
    this.leaveService.getattendanceTemplatesByUser(userId).subscribe({
      next: (res: any) => {
        if (res.status === 'success') {
          let attendanceData = res.data[0].attendanceTemplate;
          this.weeklyOffDays = [];
          this.dayCounts = {};

          const dayNameMap: { [key: string]: string } = {
            'Sun': 'Sunday',
            'Sat': 'Saturday',
            'Mon': 'Monday',
            'Tue': 'Tuesday',
            'Wed': 'Wednesday',
            'Thu': 'Thursday',
            'Fri': 'Friday'
          };

          attendanceData.weeklyOfDays.forEach((day: string) => {
            if (day !== 'false' && dayNameMap[day]) {
              this.weeklyOffDays.push(dayNameMap[day]);
              this.dayCounts[dayNameMap[day]] = 0;
            }
          });
        }
      },
      error: () => {
        this.toast.warning(this.translate.instant('leave.errorFetchingAttendanceTemplates'));
      }
    });
  }

  getWeeklyOffDates(startDate: Date, endDate: Date): Date[] {
    if (!startDate || !endDate || !this.weeklyOffDays.length) {
      return [];
    }

    const weeklyOffDates: Date[] = [];
    const currentDate = new Date(startDate);
    const end = new Date(endDate);

    while (moment(currentDate).isSameOrBefore(end, 'day')) {
      const dayName = moment(currentDate).format('dddd');
      if (this.weeklyOffDays.includes(dayName)) {
        weeklyOffDates.push(new Date(currentDate));
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return weeklyOffDates;
  }

  stripTime(date: Date): number {
    return moment(date).startOf('day').valueOf();
  }

  weeklyOffDateFilter = (date: Date | null): boolean => {
    if (!date) {
      return true;
    }

    const dayName = moment(date).format('dddd');

    if (this.weeklyOffDays.includes(dayName)) {
      return false;
    }

    const selectedDateNormalized = this.stripTime(date);

    const isHoliday = this.holidays.some(holiday => {
      const holidayDateNormalized = this.stripTime(new Date(holiday.date));
      return holidayDateNormalized === selectedDateNormalized;
    });

    return !isHoliday;
  };

  populateMembers() {
    if (this.portalView === 'user' && this.tab === 5) {
      this.members = [];
      let currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      this.members.push({ id: currentUser.id, name: this.translate.instant('leave.userMe'), email: currentUser.email });
      this.member = currentUser;
      this.timeLogService.getTeamMembers(this.member.id).subscribe({
        next: response => {
          this.timeLogService.getusers(response.data).subscribe({
            next: result => {
              result.data.forEach(user => {
                if (user.id != currentUser.id) {
                  this.members.push({ id: user.id, name: `${user.firstName} ${user.lastName}`, email: user.email });
                }
              });
            },
            error: () => {
              this.toast.error(this.translate.instant('leave.errorFetchingUsers'));
            }
          });
        },
        error: () => {
          this.toast.error(this.translate.instant('leave.errorFetchingTeamMembers'));
        }
      });
    }
    if (this.portalView === 'admin') {
      this.commonService.populateUsers().subscribe((res: any) => {
        this.allAssignee = res.data.data;
      })
    }
  }
  resetForm() {
    this.leaveApplication.reset({
      employee: '',
      leaveCategory: '',
      level1Reason: '',
      level2Reason: '',
      startDate: null,
      endDate: null,
      comment: '',
      status: '',
      isHalfDayOption: false,
      halfDays: [],
      leaveApplicationAttachments: []
    });
    this.selectedFiles = [];
    (this.leaveApplication.get('halfDays') as FormArray).clear();
    this.leaveDocumentUpload = false;
    this.documentMandatory = false;
    this.existingLeaves = []; // Clear cached leaves
    this.lastFetchedEmployeeId = null; // Reset cached employee ID
    
    // Reset max end date configuration
    this.maxConsecutiveLeaveDays = 0;
    this.maxSelectableEndDate = null;
    this.endDateBsConfig = {
      ...this.endDateBsConfig,
      maxDate: null
    };
    
    // Update form validators after reset
    this.updateFormValidators();
    this.updateAttachmentValidation();
    this.formSubmitted = false;
  }
  onSubmission() {
    this.formSubmitted = true;
    
    if (this.leaveApplication.invalid || this.leaveApplication.hasError('maxLeaveLimitExceeded') || this.leaveApplication.hasError('maxLeaveLimitExceeded')) {
      this.leaveApplication.markAllAsTouched();
      return;
    }

    // Check if attachments are required but not provided
    if (this.documentMandatory && (!this.selectedFiles || this.selectedFiles.length === 0)) {
      this.leaveApplication.get('leaveApplicationAttachments')?.markAsTouched();
      this.toast.error(this.translate.instant('leave.attachmentRequired'));
      return;
    }

    const employeeId = this.leaveApplication.get('employee')?.value;
    const leaveCategory = this.leaveApplication.get('leaveCategory')?.value;
    let startDate = this.leaveApplication.get('startDate')?.value;
    let endDate = this.leaveApplication.get('endDate')?.value;

    startDate = this.stripTime(new Date(startDate));
    endDate = this.stripTime(new Date(endDate));

    const leaveApplicationPayload = {
      employee: employeeId,
      leaveCategory: leaveCategory,
      startDate: startDate,
      endDate: endDate,
      status: 'Level 1 Approval Pending',
      level1Reason: this.leaveApplication.get('level1Reason')?.value || '',
      level2Reason: this.leaveApplication.get('level2Reason')?.value || '',
      leaveApplicationAttachments: [],
      isHalfDayOption: this.leaveApplication.get('isHalfDayOption')?.value,
      halfDays: this.leaveApplication.get('isHalfDayOption')?.value ? this.leaveApplication.get('halfDays')?.value : [],
      comment: this.leaveApplication.get('comment')?.value
    };
    if (this.leaveApplication.hasError('duplicateLeave')) {
      this.toast.error(this.translate.instant('leave.duplicateLeaveError'));
      return;
    }
    if (!this.selectedFiles || this.selectedFiles.length === 0) {
      this.submitLeaveApplication(leaveApplicationPayload);
    } else {
      this.processFiles(this.selectedFiles).then((attachments) => {
        leaveApplicationPayload.leaveApplicationAttachments = attachments;
        this.submitLeaveApplication(leaveApplicationPayload);
      }).catch(error => {
        this.toast.error(this.translate.instant('leave.fileProcessingError') + ': ' + error.message);
      });
    }
  }

  async processFiles(files: File[]): Promise<any[]> {
    const attachments: any[] = [];

    for (const file of files) {
      const base64String = await this.readFileAsBase64(file);
      const fileNameParts = file.name.split('.');
      const extention = fileNameParts[fileNameParts.length - 1];

      attachments.push({
        attachmentName: file.name,
        attachmentType: file.type,
        attachmentSize: file.size,
        extention: extention,
        file: base64String
      });
    }

    return attachments;
  }

  readFileAsBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = reader.result?.toString().split(',')[1];
        if (base64String) {
          resolve(base64String);
        } else {
          reject(new Error("Failed to read file as Base64."));
        }
      };
      reader.onerror = (error) => reject(error);
    });
  }

  submitLeaveApplication(payload: any) {
    this.leaveService.addLeaveApplication(payload).subscribe({
      next: (res: any) => {
        if (res.data) {
          this.toast.success(this.translate.instant('leave.successAddLeave'));
        } else if (res.data === null) {
          this.toast.warning(res.message);
        }

        this.leaveApplicationRefreshed.emit(res.data);
        this.resetForm();
      },
      error: (error) => {
        const errorMessage = error || this.translate.instant('leave.errorAddLeaveGeneric');
        this.toast.error(errorMessage);
      }
    });
  }
  onFileSelected(event: any) {
    const files: FileList = event.target.files;
    if (files) {
      this.selectedFiles = Array.from(files);
      // Update the form control value to trigger validation
      this.leaveApplication.get('leaveApplicationAttachments')?.setValue(this.selectedFiles.length > 0 ? 'files_selected' : '');
      this.leaveApplication.get('leaveApplicationAttachments')?.updateValueAndValidity();
    }
  }

  removeFile(index: number) {
    if (index !== -1) {
      this.selectedFiles.splice(index, 1);
      // Update the form control value to trigger validation
      this.leaveApplication.get('leaveApplicationAttachments')?.setValue(this.selectedFiles.length > 0 ? 'files_selected' : '');
      this.leaveApplication.get('leaveApplicationAttachments')?.updateValueAndValidity();
    }
  }

  closeModal() {
    this.resetForm();
    this.close.emit(true);
  }

  getAppliedLeaveCount(userId: string, category: string) {
    const requestBody = { "skip": "0", "next": "500" };
    const currentYear = new Date().getFullYear();
    this.leaveService.getAppliedLeaveCount(userId, requestBody).subscribe({
      next: (res: any) => {
        if (res.status == "success") {
          this.appliedLeave = res.data;
          this.numberOfLeaveAppliedForSelectedCategory = this.appliedLeave.filter((leave: any) => leave.leaveCategory == category && new Date(leave.addedBy).getFullYear() === currentYear).length;
          this.validateMaxLeaveLimit(); // Validate after getting leave count
        }
      },
      error: () => {
        this.toast.error(this.translate.instant('leave.errorFetchingLeaveCount'));
      }
    });
  }

  get leaveApplicationAttachments(): FormArray {
    return this.leaveApplication.get('leaveApplicationAttachments') as FormArray;
  }

  updateFormValidators() {
    this.leaveApplication.setValidators(this.customDateValidator());
    this.leaveApplication.updateValueAndValidity();
  }

  updateAttachmentValidation() {
    const attachmentControl = this.leaveApplication.get('leaveApplicationAttachments');
    if (this.documentMandatory) {
      attachmentControl?.setValidators([this.attachmentValidator()]);
    } else {
      attachmentControl?.clearValidators();
    }
    attachmentControl?.updateValueAndValidity();
  }
}

interface attachments {
  attachmentName: string;
  attachmentType: string;
  attachmentSize: number;
  extention: string;
  file: string;
}