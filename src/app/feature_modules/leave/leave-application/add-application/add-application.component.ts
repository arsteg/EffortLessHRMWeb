import { Component, EventEmitter, Input, Output, ViewEncapsulation, OnDestroy } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LeaveService } from 'src/app/_services/leave.service';
import { CommonService } from 'src/app/_services/common.Service';
import { TimeLogService } from 'src/app/_services/timeLogService';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import { forkJoin, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { CompanyService } from 'src/app/_services/company.service';

@Component({
  selector: 'app-add-application',
  templateUrl: './add-application.component.html',
  styleUrl: './add-application.component.css',
  encapsulation: ViewEncapsulation.None,
})
export class AddApplicationComponent implements OnDestroy {
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
      leaveApplicationAttachments: [this.attachments]
    }, { validators: this.dateValidator });
    this.leaveApplication.get('halfDays')?.setValidators([this.halfDayRequiredValidator(this.leaveApplication)]);
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
      this.getHolidays();
      this.leaveApplication.patchValue({
        leaveCategory: '',
        startDate: '',
        endDate: '',
        isHalfDayOption: false,
      });
      (this.leaveApplication.get('halfDays') as FormArray).clear();
      this.selectedFiles = [];
      this.leaveDocumentUpload = false;
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

    this.startDateValueChangesSubscription = this.leaveApplication.get('startDate')?.valueChanges.subscribe(() => this.checkForDuplicateLeave());
    this.endDateValueChangesSubscription = this.leaveApplication.get('endDate')?.valueChanges.subscribe(() => this.checkForDuplicateLeave());
    this.leaveApplication.get('employee')?.valueChanges.subscribe(() => this.checkForDuplicateLeave());
    this.leaveApplication.get('leaveCategory')?.valueChanges.subscribe(() => this.checkForDuplicateLeave());

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
      this.leaveApplication.setErrors(null);
      this.showHalfDayOption = true;
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
    if (this.leaveApplication.value.employee && this.tempLeaveCategory?.leaveCategory?._id) {
      this.getAppliedLeaveCount(this.leaveApplication.value.employee, this.tempLeaveCategory.leaveCategory._id);
    }
  }

  halfDayRequiredValidator(formGroup: FormGroup) {
    return (formArray: FormArray): { [key: string]: any } | null => {
      const isHalfDayOption = formGroup.get('isHalfDayOption')?.value;
      if (!isHalfDayOption) {
        console.log('Half day option is not selected, no validation needed.');
        return null;
      }

      if (formArray.length === 0) {
        console.log('Half day entries are required but none found.');
        return { halfDayRequired: true };
      }

      for (let i = 0; i < formArray.length; i++) {
        const halfDayDate = formArray.at(i).get('date')?.value;
        const dayHalf = formArray.at(i).get('dayHalf')?.value;
        if (!halfDayDate || !dayHalf) {
          console.log(`Half day entry at index ${i} is incomplete.`);
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
    this.halfDays.push(this.fb.group({
      date: ['', Validators.required],
      dayHalf: ['', Validators.required]
    }));
  }
  removeHalfDayEntry(index: number): void {
    this.halfDays.removeAt(index);
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

  onSubmission() {
    if (this.leaveApplication.invalid) {
      this.leaveApplication.markAllAsTouched();
      this.toast.error(this.translate.instant('leave.validationError'));
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
        this.toast.success(this.translate.instant('leave.successAddLeave'));
        this.leaveApplicationRefreshed.emit(res.data);
        this.leaveApplication.reset();
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
    this.leaveApplication.reset();
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