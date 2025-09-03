import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AttendanceService } from 'src/app/_services/attendance.service';
import { LeaveService } from 'src/app/_services/leave.service';
import { CommonService } from 'src/app/_services/common.Service';
import { TranslateService } from '@ngx-translate/core';
import { CustomValidators } from 'src/app/_helpers/custom-validators';
import { TimeLogService } from 'src/app/_services/timeLogService';

@Component({
  selector: 'app-general-template-settings',
  templateUrl: './general-template-settings.component.html',
  styleUrls: ['./general-template-settings.component.css']
})
export class GeneralTemplateSettingsComponent {
  @Output() close: any = new EventEmitter();
  @Input() changeMode: any;
  @Input() isEdit: boolean;
  weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  checkedFormats: any = [''];
  addTemplateForm: FormGroup;
  managers: any = [];
  selectedCategories: any = [];
  leaveCategories: any[];
  selectedCategory: string[] = ['loss-of-pay', 'present'];
  selectedWeeklyDays: any[] = [];
  selectedHalfDays: string[] = [];
  selectedAlternateWeekDays: string[] = [];
  attendanceTemplate: any;
  @Output() changeStep: any = new EventEmitter();
  capturingAttendance: any = [''];
  defaultCatSkip = "0";
  defaultCatNext = "100000";
  modes: any;
  @Output() expenseTemplateReportRefreshed: any = new EventEmitter();
  @Input() templates: any;
  submitted: boolean = false;

  constructor(
    private commonService: CommonService,
    private leaveService: LeaveService,
    private translate: TranslateService,
    private fb: FormBuilder,
    private attendanceService: AttendanceService,
    private timelog: TimeLogService,
    private toast: ToastrService
  ) {
    this.addTemplateForm = this.fb.group({
      label: ['', [Validators.required, CustomValidators.labelValidator, CustomValidators.noLeadingOrTrailingSpaces]],
      attendanceMode: [[], Validators.required],
      minimumHoursRequiredPerWeek: [40, [Validators.required, Validators.min(0), Validators.max(60)]],
      minimumMinutesRequiredPerWeek: [0, [Validators.required, Validators.min(0)]],
      notifyEmployeeMinHours: [true, Validators.required],
      weeklyOfDays: [[], CustomValidators.atLeastOneDaySelected()],
      weklyofHalfDay: [[]],
      alternateWeekOffRoutine: ['none', Validators.required],
      daysForAlternateWeekOffRoutine: [[]],
      isNotificationToSupervisors: [true],
      isCommentMandatoryForRegularisation: [true],
      departmentDesignations: ['Software Developer', Validators.required],
      approversType: ['template-wise', Validators.required],
      primaryApprover: [null],
      leveCategoryHierarchyForAbsentHalfDay: [[''], Validators.required]
    }, { validators: CustomValidators.mutuallyExclusiveDays() });
  }

  ngOnInit() {
    console.log(this.templates);
    this.getModes();
    this.getAllManagers();
    this.getLeaveCatgeories();
    if (this.isEdit) {
      this.attendanceService.selectedTemplate.subscribe(res => {
        if (res._id) {
          this.setFormValues();
        }
      });
    }
    this.addTemplateForm.get('approversType')?.valueChanges.subscribe(value => {
      this.validateApprovers(value, '');
    });
    this.addTemplateForm.get('alternateWeekOffRoutine')?.valueChanges.subscribe(value => {
      const daysControl = this.addTemplateForm.get('daysForAlternateWeekOffRoutine');
      if (value === 'odd' || value === 'even') {
        daysControl?.setValidators([CustomValidators.atLeastOneDaySelected()]);
      } else {
        daysControl?.clearValidators();
        daysControl?.setValue([]);
        this.selectedAlternateWeekDays = [];
      }
      daysControl?.updateValueAndValidity();
      this.addTemplateForm.updateValueAndValidity();
      console.log('Alternate Week Off Routine Changed:', value, 'Form Errors:', this.addTemplateForm.errors);
    });
   
  }

  validateApprovers(approversType: string, approverLevel: string) {
    const primaryApproverControl = this.addTemplateForm.get('primaryApprover');

    if (approversType === 'template-wise') {
      primaryApproverControl?.setValidators([Validators.required]);
    } else {
      primaryApproverControl?.clearValidators();
      primaryApproverControl?.setValue(null); // optional: reset value
      primaryApproverControl?.markAsPristine(); // optional
      primaryApproverControl?.markAsUntouched(); // optional
    }
  
    primaryApproverControl?.updateValueAndValidity();
  }

  setFormValues() {
    if (this.isEdit) {
      this.attendanceService.selectedTemplate.subscribe(res => {
        const templateData = res;
        this.addTemplateForm.patchValue({
          label: templateData?.label,
          attendanceMode: templateData?.attendanceMode || [],
          minimumHoursRequiredPerWeek: templateData?.minimumHoursRequiredPerWeek,
          minimumMinutesRequiredPerWeek: templateData?.minimumMinutesRequiredPerWeek,
          notifyEmployeeMinHours: templateData?.notifyEmployeeMinHours,
          weeklyOfDays: templateData?.weeklyOfDays || [],
          weklyofHalfDay: templateData?.weklyofHalfDay || [],
          alternateWeekOffRoutine: templateData?.alternateWeekOffRoutine || 'none',
          daysForAlternateWeekOffRoutine: templateData?.daysForAlternateWeekOffRoutine || [],
          isNotificationToSupervisors: templateData?.isNotificationToSupervisors,
          isCommentMandatoryForRegularisation: templateData?.isCommentMandatoryForRegularisation,
          departmentDesignations: templateData?.departmentDesignations,
          approversType: templateData?.approversType || 'template-wise',
          primaryApprover: templateData?.primaryApprover,
          leveCategoryHierarchyForAbsentHalfDay: templateData?.leveCategoryHierarchyForAbsentHalfDay || ['loss-of-pay', 'present']
        });
        this.selectedWeeklyDays = templateData?.weeklyOfDays || [];
        this.selectedHalfDays = templateData?.weklyofHalfDay || [];
        this.selectedAlternateWeekDays = templateData?.daysForAlternateWeekOffRoutine || [];
        this.selectedCategory = templateData?.leveCategoryHierarchyForAbsentHalfDay || ['loss-of-pay', 'present'];
        this.capturingAttendance = templateData?.attendanceMode || [];
        // Trigger validation after setting values
        this.addTemplateForm.updateValueAndValidity();
        console.log('Form Values after setFormValues:', this.addTemplateForm.value);
        console.log('Form Errors after setFormValues:', this.addTemplateForm.errors);
      });
    } else {
      this.addTemplateForm.reset({
        label: '',
        attendanceMode: [],
        minimumHoursRequiredPerWeek: 40,
        minimumMinutesRequiredPerWeek: 0,
        notifyEmployeeMinHours: true,
        weeklyOfDays: [],
        weklyofHalfDay: [],
        alternateWeekOffRoutine: 'none',
        daysForAlternateWeekOffRoutine: [],
        isNotificationToSupervisors: true,
        approversType: '',
        primaryApprover: null,
      });
      this.selectedWeeklyDays = [];
      this.selectedHalfDays = [];
      this.selectedAlternateWeekDays = [];
      this.capturingAttendance = [];
      this.addTemplateForm.updateValueAndValidity();
    }
  }

  isWeeklyDays(days: string) {
    return this.selectedWeeklyDays?.length ? this.selectedWeeklyDays.includes(days) : false;
  }

  isHalfDays(days: string) {
    return this.selectedHalfDays?.length ? this.selectedHalfDays.includes(days) : false;
  }

  isAlternateWeekDays(days: string) {
    return this.selectedAlternateWeekDays?.length ? this.selectedAlternateWeekDays.includes(days) : false;
  }

  closeModal() {
    this.close.emit(true);
  }

  onDaysChange(event: any, day: string, type: string) {
    if (type === 'weeklyOfDays') {
      const index = this.selectedWeeklyDays.indexOf(day);
      if (event.checked && index === -1) {
        this.selectedWeeklyDays.push(day);
        // Remove from weklyofHalfDay and daysForAlternateWeekOffRoutine
        this.selectedHalfDays = this.selectedHalfDays.filter(d => d !== day);
        this.selectedAlternateWeekDays = this.selectedAlternateWeekDays.filter(d => d !== day);
        this.addTemplateForm.patchValue({
          weklyofHalfDay: this.selectedHalfDays,
          daysForAlternateWeekOffRoutine: this.selectedAlternateWeekDays
        });
      } else if (!event.checked && index > -1) {
        this.selectedWeeklyDays.splice(index, 1);
      }

      this.addTemplateForm.get('weeklyOfDays')?.setValue(this.selectedWeeklyDays);
      this.addTemplateForm.get('weeklyOfDays')?.markAsTouched();
      this.addTemplateForm.get('weeklyOfDays')?.updateValueAndValidity();
      } else if (type === 'weklyofHalfDay') {
      const selectedDays = this.addTemplateForm.get('weklyofHalfDay')?.value || [];
      const index = selectedDays.indexOf(day);

      if (event.checked && index === -1) {
        selectedDays.push(day);
        // Remove from weeklyOfDays and daysForAlternateWeekOffRoutine
        this.selectedWeeklyDays = this.selectedWeeklyDays.filter(d => d !== day);
        this.selectedAlternateWeekDays = this.selectedAlternateWeekDays.filter(d => d !== day);
        this.addTemplateForm.patchValue({
          weeklyOfDays: this.selectedWeeklyDays,
          daysForAlternateWeekOffRoutine: this.selectedAlternateWeekDays
        });
      } else if (!event.checked && index !== -1) {
        selectedDays.splice(index, 1);
      }

      this.addTemplateForm.patchValue({ weklyofHalfDay: selectedDays });
      this.addTemplateForm.get('weklyofHalfDay')?.markAsTouched();
      this.addTemplateForm.get('weklyofHalfDay')?.updateValueAndValidity();
      } else if (type === 'daysForAlternateWeekOffRoutine') {
      const selectedDays = this.addTemplateForm.get('daysForAlternateWeekOffRoutine')?.value || [];
      const index = selectedDays.indexOf(day);

      if (event.checked && index === -1) {
        selectedDays.push(day);
        // Remove from weeklyOfDays and weklyofHalfDay
        this.selectedWeeklyDays = this.selectedWeeklyDays.filter(d => d !== day);
        this.selectedHalfDays = this.selectedHalfDays.filter(d => d !== day);
        this.addTemplateForm.patchValue({
          weeklyOfDays: this.selectedWeeklyDays,
          weklyofHalfDay: this.selectedHalfDays
        });
      } else if (!event.checked && index !== -1) {
        selectedDays.splice(index, 1);
      }

      this.addTemplateForm.patchValue({ daysForAlternateWeekOffRoutine: selectedDays });
      this.addTemplateForm.get('daysForAlternateWeekOffRoutine')?.markAsTouched();
      this.addTemplateForm.get('daysForAlternateWeekOffRoutine')?.updateValueAndValidity();
      }

    this.addTemplateForm.updateValueAndValidity();
   }

  getAllManagers() {
    this.managers = [];
    this.timelog.getManagers().subscribe({
      next: response => {
        this.timelog.getusers(response.data).subscribe({
          next: result => {
            result.data.forEach(user => {
              this.managers.push({ id: user.id, name: `${user.firstName} ${user.lastName}`, email: user.email });
            });
          },
          error: error => {
            console.log('Error fetching users:', error);
          }
        });
      },
      error: error => {
        console.log('Error fetching managers:', error);
      }
    });
  }

  getLeaveCatgeories() {
    const requestBody = { skip: this.defaultCatSkip, next: this.defaultCatNext };
    this.leaveService.getAllLeaveCategories(requestBody).subscribe((res: any) => {
      const categories = res.data;
      this.leaveCategories = categories.filter((leaveType: { leaveType: string; }) => leaveType.leaveType === 'general-leave');
      console.log('Leave Categories:', this.leaveCategories);
    }, error => {
      console.log('Error fetching leave categories:', error);
    });
  }

  onSubmission() {
    this.addTemplateForm.markAllAsTouched();
    this.addTemplateForm.updateValueAndValidity();
  console.log(this.addTemplateForm.valid);
    if (this.addTemplateForm.valid) {
      this.submitted = true;

      this.addTemplateForm.value.leveCategoryHierarchyForAbsentHalfDay = this.selectedCategory;
      this.addTemplateForm.value.daysForAlternateWeekOffRoutine = this.selectedAlternateWeekDays;
      this.addTemplateForm.value.weklyofHalfDay = this.selectedHalfDays;
      this.addTemplateForm.value.weeklyOfDays = this.selectedWeeklyDays;

      if (!this.isEdit) {
        this.attendanceService.addAttendanceTemplate(this.addTemplateForm.value).subscribe(
          (res: any) => {
            this.attendanceService.selectedTemplate.next(res.data);
            this.toast.success(this.translate.instant('attendance.successCreate'), this.translate.instant('common.success'));
            this.expenseTemplateReportRefreshed.emit(res.data);
            this.closeModal();
            this.submitted = false;
          },
          err => {
            const errorMessage = err?.error?.message || err?.message || err || this.translate.instant('attendance.createError');
            this.toast.error(errorMessage, this.translate.instant('common.error'));
            this.submitted = false;
          }
        );
      } else {
        const templateId = this.attendanceService.selectedTemplate.getValue()._id;
        this.attendanceService.updateAttendanceTemplate(templateId, this.addTemplateForm.value).subscribe(
          (res: any) => {
            this.toast.success(this.translate.instant('attendance.successUpdate'), this.translate.instant('common.success'));
            this.expenseTemplateReportRefreshed.emit(res.data);
            this.closeModal();
            this.submitted = false;
          },
          err => {
            const errorMessage = err?.error?.message || err?.message || err || this.translate.instant('attendance.updateError');
            this.toast.error(errorMessage, this.translate.instant('common.error'));
            this.submitted = false;
          }
        );
      }
    } else {
      this.submitted = false;
      }
  }

  getModes() {
    this.attendanceService.getModes().subscribe((res: any) => {
      this.modes = res.data;
      console.log('Modes:', this.modes);
    }, error => {
      console.log('Error fetching modes:', error);
    });
  }
}