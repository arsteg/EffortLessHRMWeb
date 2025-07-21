import { Component, EventEmitter, Input, Output, ViewEncapsulation, OnDestroy } from '@angular/core'; // Import OnDestroy
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LeaveService } from 'src/app/_services/leave.service';
import { CommonService } from 'src/app/_services/common.Service';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { TimeLogService } from 'src/app/_services/timeLogService';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { ToastrService } from 'ngx-toastr';
import { HolidaysService } from 'src/app/_services/holidays.service';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import { forkJoin, Subscription } from 'rxjs'; // Import Subscription
import { map } from 'rxjs/operators';
import { CompanyService } from 'src/app/_services/company.service';

@Component({
  selector: 'app-add-application',
  templateUrl: './add-application.component.html',
  styleUrl: './add-application.component.css',
  encapsulation: ViewEncapsulation.None,
})
export class AddApplicationComponent implements OnDestroy { // Implement OnDestroy
  leaveApplication: FormGroup;
  allAssignee: any;
  bsValue = new Date();
  @Output() close: any = new EventEmitter();
  leaveCategories: any;
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
    minDate: new Date() // Default to today
  };
  today: Date = new Date();
  showHalfDayOption: boolean = true;
  checkStatus: any;
  existingLeaves: any[] = [];
  minSelectableDate: Date;
  weeklyOffDates: Date[] = [];
  holidays: any;
  weeklyOffDays: string[] = [];

  // Add subscriptions to manage lifecycle
  private employeeValueChangesSubscription: Subscription;
  private leaveCategoryValueChangesSubscription: Subscription;
  private startDateValueChangesSubscription: Subscription;
  private endDateValueChangesSubscription: Subscription;


  constructor(
    private fb: FormBuilder,
    private commonService: CommonService,
    private leaveService: LeaveService,
    private timeLogService: TimeLogService,
    private toast: ToastrService,
    private companyService: CompanyService,
    private translate: TranslateService
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
      leaveApplicationAttachments: this.fb.array([])
    }, { validators: this.dateValidator });
    this.leaveApplication.get('startDate')?.valueChanges.subscribe(() => this.updateHalfDayValidation());
    this.leaveApplication.get('endDate')?.valueChanges.subscribe(() => this.updateHalfDayValidation());
  }

  dateValidator(group: AbstractControl) {
    const startDate = group.get('startDate')?.value;
    const endDate = group.get('endDate')?.value;

    if (startDate && endDate && moment(startDate).isAfter(moment(endDate))) {
      group.get('endDate')?.setErrors({ dateRangeError: true });
    }
    return null;
  }

  ngOnInit() {
    forkJoin({
      users: this.commonService.populateUsers(),
    }).subscribe({
      next: ({ users }) => {
        this.allAssignee = users?.data?.data;
      },
      error: () => {
        this.toast.error(this.translate.instant('leave.errorFetchingUsers'));
      }
    });

    this.populateMembers();
    this.getHolidays();

    this.leaveCategoryValueChangesSubscription = this.leaveApplication.get('leaveCategory').valueChanges.subscribe(leaveCategory => {
      this.tempLeaveCategory = this.leaveCategories.find(l => l.leaveCategory._id === leaveCategory);
      this.leaveDocumentUpload = this.tempLeaveCategory?.leaveCategory?.documentRequired || false;
      this.handleLeaveCategoryChange();
      this.updateMinDate();
    });

    // Store the employee valueChanges subscription
    this.employeeValueChangesSubscription = this.leaveApplication.get('employee').valueChanges.subscribe(employee => {
      this.leaveService.getLeaveCategoriesByUserv1(employee).subscribe({
        next: (res: any) => {
          this.leaveCategories = res.data;
          this.checkStatus = res.status;
        },
        error: () => {
          this.toast.error(this.translate.instant('leave.errorFetchingCategories'));
        }
      });
      this.getHolidays(); // This also gets called, so it needs consideration
      // Also reset related fields to prevent stale data
      this.leaveApplication.patchValue({
        leaveCategory: '',
        startDate: '',
        endDate: '',
        isHalfDayOption: false,
      });
      (this.leaveApplication.get('halfDays') as FormArray).clear(); // Clear halfDays array
      this.selectedFiles = []; // Clear selected files
      this.leaveDocumentUpload = false; // Reset document upload requirement
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
      this.getattendanceTemplatesByUser();
      this.getHolidays();
    }

    // Store duplicate leave check subscriptions
    this.startDateValueChangesSubscription = this.leaveApplication.get('startDate')?.valueChanges.subscribe(() => this.checkForDuplicateLeave());
    this.endDateValueChangesSubscription = this.leaveApplication.get('endDate')?.valueChanges.subscribe(() => this.checkForDuplicateLeave());
    // The employee and leaveCategory valueChanges already have other subscriptions,
    // so you can call checkForDuplicateLeave() within those existing subscriptions
    // or chain them with .pipe(tap(() => this.checkForDuplicateLeave()))
    // For simplicity, I'll keep them separate for now but note the redundancy.
    this.leaveApplication.get('employee')?.valueChanges.subscribe(() => this.checkForDuplicateLeave());
    this.leaveApplication.get('leaveCategory')?.valueChanges.subscribe(() => this.checkForDuplicateLeave());

  }

  ngOnDestroy() {
    // Unsubscribe from all subscriptions to prevent memory leaks
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

  ngOnChanges() {
    this.handleLeaveCategoryChange();
  }

  getLeaveCategoryDetails(category: any) {
    this.leaveService.getLeaveCategorById(this.leaveApplication.get('leaveCategory')?.value).subscribe((res: any) => {
      this.tempLeaveCategory = res?.data;
      this.updateMinDate();
    });
  }

  updateMinDate() {
    if (this.tempLeaveCategory?.submitBefore) {
      const submitBeforeDays = parseInt(this.tempLeaveCategory.submitBefore, 10);
      if (!isNaN(submitBeforeDays)) {
        const minDate = new Date();
        minDate.setDate(minDate.getDate() + submitBeforeDays);
        this.minSelectableDate = minDate;
        this.bsConfig = {
          ...this.bsConfig,
          minDate: this.minSelectableDate
        };
        this.validateDates();
      }
    } else {
      this.minSelectableDate = new Date();
      this.bsConfig = {
        ...this.bsConfig,
        minDate: this.minSelectableDate
      };
    }
  }

  validateDates() {
    const startDate = this.leaveApplication.get('startDate')?.value;
    const endDate = this.leaveApplication.get('endDate')?.value;
    const halfDay = this.leaveApplication.get('date')?.value; // This refers to a half-day date, which isn't a direct form control but part of the halfDays FormArray

    // Apply the validation error if startDate is before minSelectableDate
    if (startDate && this.minSelectableDate && moment(startDate).isBefore(moment(this.minSelectableDate), 'day')) {
      this.leaveApplication.get('startDate')?.setErrors({ submitBeforeError: true });
    } else {
      // Clear the error if the condition is no longer met
      if (this.leaveApplication.get('startDate')?.hasError('submitBeforeError')) {
        this.leaveApplication.get('startDate')?.updateValueAndValidity(); // Re-evaluate all validators
      }
    }

    // Apply the validation error if endDate is before minSelectableDate
    if (endDate && this.minSelectableDate && moment(endDate).isBefore(moment(this.minSelectableDate), 'day')) {
      this.leaveApplication.get('endDate')?.setErrors({ submitBeforeError: true });
    } else {
      // Clear the error if the condition is no longer met
      if (this.leaveApplication.get('endDate')?.hasError('submitBeforeError')) {
        this.leaveApplication.get('endDate')?.updateValueAndValidity();
      }
    }
    // Note: The 'date' control for half-days is within a FormArray,
    // so its validation would typically be handled within the halfDayValidator or by
    // updating each individual control's validity when minSelectableDate changes.
    // The current `halfDay` check here is likely not directly effective for FormArray controls.
    // The `updateHalfDayValidation()` already calls `updateValueAndValidity()` on halfDays, which is good.
  }

  getHolidays() {
    const payload = {
      next: '', skip: '', status: '', year: new Date().getFullYear()
    };
    this.companyService.getHolidays(payload).subscribe((res: any) => {
      this.holidays = res.data;
    });
  }

  checkForDuplicateLeave() {
    const employeeId = this.leaveApplication.get('employee')?.value;
    const leaveCategory = this.leaveApplication.get('leaveCategory')?.value;
    const startDate = this.leaveApplication.get('startDate')?.value;
    const endDate = this.leaveApplication.get('endDate')?.value;

    if (!employeeId || !leaveCategory || !startDate || !endDate) {
      this.leaveApplication.setErrors(null); // Clear duplicate leave error if inputs are incomplete
      this.showHalfDayOption = true; // Re-enable half-day option if no dates/category
      return;
    }

    let payload = { skip: '', next: '' };
    this.leaveService.getLeaveApplicationbyUser(payload, employeeId).subscribe({
      next: (res: any) => {
        this.existingLeaves = res.data;
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
        } else {
          // Only clear duplicateLeave error, preserve other errors like dateRangeError
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
    this.getattendanceTemplatesByUser();
    this.numberOfLeaveAppliedForSelectedCategory = 0;
    // Ensure tempLeaveCategory is available before calling getAppliedLeaveCount
    if (this.leaveApplication.value.employee && this.tempLeaveCategory?.leaveCategory?._id) {
      this.getAppliedLeaveCount(this.leaveApplication.value.employee, this.tempLeaveCategory.leaveCategory._id);
    }
  }

  halfDayValidator() {
    return (formArray: FormArray): { [key: string]: any } | null => {
      const startDate = this.leaveApplication?.get('startDate')?.value;
      const endDate = this.leaveApplication?.get('endDate')?.value;

      if (!startDate || !endDate) {
        return null; // No validation if dates aren't set
      }

      for (let i = 0; i < formArray.length; i++) {
        const halfDayDate = formArray.at(i).get('date')?.value;
        if (halfDayDate && (halfDayDate < startDate || halfDayDate > endDate)) {
          formArray.at(i).get('date')?.setErrors({ dateOutOfRange: true });
          return { dateOutOfRange: true };
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
    this.halfDays.push(this.fb.group({
      date: ['', Validators.required],
      dayHalf: ['', Validators.required]
    }));
  }
  removeHalfDayEntry(index: number): void {
    this.halfDays.removeAt(index);
  }
  onHalfDayChange() {
    // Only reset the halfDays FormArray, not the entire 'halfDays' control (which would clear the array)
    (this.leaveApplication.get('halfDays') as FormArray).clear();
    // Re-add one empty half-day entry if half-day option is true, for better UX
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

          // Map short day names to full names for moment.js compatibility
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

    while (moment(currentDate).isSameOrBefore(end, 'day')) { // Use moment for date comparison
      const dayName = moment(currentDate).format('dddd');
      if (this.weeklyOffDays.includes(dayName)) {
        weeklyOffDates.push(new Date(currentDate));
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return weeklyOffDates;
  }
  // Assuming you have moment.js imported as 'moment'

  // Modify your stripTime function to use moment.js for consistency
  stripTime(date: Date): number {
    // This will return the timestamp for the start of the day in local time
    return moment(date).startOf('day').valueOf();
  }

  weeklyOffDateFilter = (date: Date | null): boolean => {
    if (!date) {
      return true; // Allow if no date
    }

    // Use moment to get the day name from the provided date object directly
    const dayName = moment(date).format('dddd'); // e.g., "Sunday"

    // Check for weekly off days
    if (this.weeklyOffDays.includes(dayName)) {
      return false; // Disable weekly off days
    }

    // Normalize the selected date to the start of the day for consistent comparison
    const selectedDateNormalized = this.stripTime(date); // This will be the timestamp of the start of the day (local)

    const isHoliday = this.holidays.some(holiday => {
      // Normalize the holiday date as well
      const holidayDateNormalized = this.stripTime(new Date(holiday.date));
      return holidayDateNormalized === selectedDateNormalized;
    });

    return !isHoliday;
  };

  populateMembers() {
    if (this.portalView === 'user') {
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
  }

  onEmployeeChange(event: any) {
    // This method is called from the template's mat-select (selectionChange).
    // The value is already patched by formControlName="employee".
    // The console logs are for debugging and can be removed.
    // console.log(this.leaveApplication.get('employee').setValue(event.value));
    // console.log(event);

    // If you explicitly want to reset other fields when the employee changes,
    // ensure you do it here, but remember that the valueChanges subscription
    // on 'employee' already handles some of this.
    // The logic below from your original commented code is good if you want a full reset
    // but ensure it doesn't conflict with or redundantly trigger the valueChanges listener.
    // Given the `employee` valueChanges listener now includes a `patchValue`
    // to reset related fields, this `onEmployeeChange` method might become redundant
    // unless you have other specific logic for the `selectionChange` event.
  }


  onSubmission() {
    // Before submission, ensure the form is valid.
    if (this.leaveApplication.invalid) {
      this.leaveApplication.markAllAsTouched(); // Mark all fields as touched to show validation errors
      this.toast.error(this.translate.instant('leave.validationError')); // Generic error for invalid form
      return;
    }

    const employeeId = this.leaveApplication.get('employee')?.value;
    const leaveCategory = this.leaveApplication.get('leaveCategory')?.value;
    let startDate = this.leaveApplication.get('startDate')?.value;
    let endDate = this.leaveApplication.get('endDate')?.value;

    // Convert dates to timestamps (stripped of time)
    startDate = this.stripTime(new Date(startDate));
    endDate = this.stripTime(new Date(endDate));

    // Prepare the leave application payload
    const leaveApplicationPayload = {
      employee: employeeId,
      leaveCategory: leaveCategory,
      startDate: startDate,
      endDate: endDate,
      status: 'Level 1 Approval Pending',
      level1Reason: this.leaveApplication.get('level1Reason')?.value || '', // Use empty string for optional fields
      level2Reason: this.leaveApplication.get('level2Reason')?.value || '', // Use empty string for optional fields
      leaveApplicationAttachments: [],
      isHalfDayOption: this.leaveApplication.get('isHalfDayOption')?.value,
      halfDays: this.leaveApplication.get('isHalfDayOption')?.value ? this.leaveApplication.get('halfDays')?.value : [], // Only include halfDays if option is true
      comment: this.leaveApplication.get('comment')?.value
    };

    // The duplicate leave check is already performed by valueChanges subscription.
    // However, it's good to have a final check before the actual submission API call.
    // The current `checkForDuplicateLeave` sets form errors. So we can check for them here.
    if (this.leaveApplication.hasError('duplicateLeave')) {
      this.toast.error(this.translate.instant('leave.duplicateLeaveError'));
      return;
    }


    // If no files are selected, call the API immediately
    if (!this.selectedFiles || this.selectedFiles.length === 0) {
      this.submitLeaveApplication(leaveApplicationPayload);
    } else {
      // Process files and then call the API
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
        this.toast.success(this.translate.instant('leave.successAddLeave'));
        this.leaveApplicationRefreshed.emit(res.data);
        this.leaveApplication.reset({}, { emitEvent: false });
        this.selectedFiles = [];
        (this.leaveApplication.get('halfDays') as FormArray).clear();
        this.leaveDocumentUpload = false;
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
    }
  }

  removeFile(index: number) {
    if (index !== -1) {
      this.selectedFiles.splice(index, 1);
    }
  }

  closeModal() {
    this.leaveApplication.reset(); // Reset form when closing, which is fine as it's typically destroyed
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
}

interface attachments {
  attachmentName: string;
  attachmentType: string;
  attachmentSize: number;
  extention: string;
  file: string;
}