import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AttendanceService } from 'src/app/_services/attendance.service';
import { LeaveService } from 'src/app/_services/leave.service';
import { CommonService } from 'src/app/_services/common.Service';

function atLeastOneDaySelected(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const days = control.value as string[];
    return days && days.length > 0 ? null : { atLeastOneDayRequired: true };
  };
}
const labelValidator: ValidatorFn = (control: AbstractControl) => {
  const value = control.value as string;
  if (!value || /^\s*$/.test(value)) {
    return { required: true };
  }
  const valid = /^(?=.*[a-zA-Z])[a-zA-Z\s(),\-/]*$/.test(value);
  return valid ? null : { invalidLabel: true };
};
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
  users: any = [];
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
  submitted: boolean = true;

  constructor(
    private commonService: CommonService,
    private leaveService: LeaveService,
    private fb: FormBuilder,
    private attendanceService: AttendanceService,
    private toast: ToastrService
  ) {
    this.addTemplateForm = this.fb.group({
      label: ['', [Validators.required, labelValidator, this.duplicateLabelValidator()]],
      attendanceMode: [[], Validators.required],
      minimumHoursRequiredPerWeek: [40, [Validators.required, Validators.min(0)]],
      minimumMinutesRequiredPerWeek: [0, [Validators.required, Validators.min(0)]],
      notifyEmployeeMinHours: [true, Validators.required],
      weeklyOfDays: [[]],
      weklyofHalfDay: [null],
      alternateWeekOffRoutine: ['none', Validators.required],
      daysForAlternateWeekOffRoutine: [null],
      isNotificationToSupervisors: [true],
      isCommentMandatoryForRegularisation: [true],
      departmentDesignations: ['Software Developer', Validators.required],
      approversType: ['template-wise', Validators.required],
      approvalLevel: ['1', Validators.required],
      primaryApprover: [null],
      secondaryApprover: [null],
      leveCategoryHierarchyForAbsentHalfDay: [[''], Validators.required]
    });
  }

  ngOnInit() {
    console.log(this.templates)
    this.getModes();
    this.getAllUsers();
    this.getLeaveCatgeories();
    if (this.isEdit) {
      this.attendanceService.selectedTemplate.subscribe(res => {
        if (res._id) {
          this.setFormValues();
        }
      });
    }

    this.addTemplateForm.get('alternateWeekOffRoutine').valueChanges.subscribe(value => {
      const daysControl = this.addTemplateForm.get('daysForAlternateWeekOffRoutine');
      if (value === 'odd' || value === 'even') {
        daysControl.setValidators([atLeastOneDaySelected()]);
      } else {
        daysControl.clearValidators();
      }
      daysControl.updateValueAndValidity();
    });

    this.addTemplateForm.get('approvalLevel').valueChanges.subscribe((value: any) => {
      this.validateApprovers(this.addTemplateForm.get('approversType').value, value);
    });
    this.addTemplateForm.get('approversType').valueChanges.subscribe((value: any) => {
      this.validateApprovers(value, this.addTemplateForm.get('approvalLevel').value);
    });
  }
  duplicateLabelValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: boolean } | null => {
      const label = control.value;
      if (label && this.templates.some(template => template.label.toLowerCase() === label.toLowerCase())) {
        return { duplicateLabel: true };
      }
      return null;
    };
  }

  validateApprovers(approversType: string, approverLevel: string) {
    const primaryApproverControl = this.addTemplateForm.get('primaryApprover');
    const secondaryApproverControl = this.addTemplateForm.get('secondaryApprover');

    // Always clear validators and reset values before setting new ones,
    // to ensure a clean state when switching approver types.
    primaryApproverControl.clearValidators();
    secondaryApproverControl.clearValidators();
    primaryApproverControl.setValue(null);
    secondaryApproverControl.setValue(null);

    if (approversType === 'template-wise') {
      if (approverLevel === '1') {
        primaryApproverControl.setValidators([Validators.required]);
      } else if (approverLevel === '2') {
        primaryApproverControl.setValidators([Validators.required]);
        secondaryApproverControl.setValidators([Validators.required]);
      }
    }
    // No explicit validators for 'employee-wise' as per your logic,
    // but the clearValidators and setValue(null) above handle the reset.

    primaryApproverControl.updateValueAndValidity();
    secondaryApproverControl.updateValueAndValidity();
  }


  setFormValues() {
    if (this.isEdit) {
      this.attendanceService.selectedTemplate.subscribe(res => {
        const templateData = res;
        this.addTemplateForm.patchValue({
          label: templateData?.label,
          attendanceMode: templateData?.attendanceMode,
          minimumHoursRequiredPerWeek: templateData?.minimumHoursRequiredPerWeek,
          minimumMinutesRequiredPerWeek: templateData?.minimumMinutesRequiredPerWeek,
          notifyEmployeeMinHours: templateData?.notifyEmployeeMinHours,
          weeklyOfDays: templateData?.weeklyOfDays,
          weklyofHalfDay: templateData?.weklyofHalfDay,
          alternateWeekOffRoutine: templateData?.alternateWeekOffRoutine,
          daysForAlternateWeekOffRoutine: templateData?.daysForAlternateWeekOffRoutine,
          isNotificationToSupervisors: templateData?.isNotificationToSupervisors,
          isCommentMandatoryForRegularisation: templateData?.isCommentMandatoryForRegularisation,
          departmentDesignations: templateData?.departmentDesignations,
          approversType: templateData?.approversType,
          approvalLevel: templateData?.approvalLevel,
          primaryApprover: templateData?.primaryApprover,
          secondaryApprover: templateData?.secondaryApprover,
          leveCategoryHierarchyForAbsentHalfDay: templateData?.leveCategoryHierarchyForAbsentHalfDay
        });
        this.selectedWeeklyDays = templateData?.weeklyOfDays || [];
        this.selectedHalfDays = templateData?.weklyofHalfDay || [];
        this.selectedAlternateWeekDays = templateData?.daysForAlternateWeekOffRoutine || [];
        this.selectedCategory = templateData?.leveCategoryHierarchyForAbsentHalfDay || ['loss-of-pay', 'present'];
        this.capturingAttendance = templateData?.attendanceMode || [''];
      });
    } else {
      this.addTemplateForm.reset({
        label: '',
        minimumHoursRequiredPerWeek: 40,
        minimumMinutesRequiredPerWeek: 0,
        notifyEmployeeMinHours: true,
        weeklyOfDays: null,
        weklyofHalfDay: null,
        alternateWeekOffRoutine: 'none',
        daysForAlternateWeekOffRoutine: null,
        isNotificationToSupervisors: true,
        isCommentMandatoryForRegularisation: true,
        approversType: '',
        approvalLevel: '',
        primaryApprover: '',
        secondaryApprover: ''
      });
      this.selectedWeeklyDays = [];
      this.selectedHalfDays = [];
      this.selectedAlternateWeekDays = [];
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
      } else if (!event.checked && index > -1) {
        this.selectedWeeklyDays.splice(index, 1);
      }

      this.addTemplateForm.get('weeklyOfDays')?.setValue(this.selectedWeeklyDays);
      this.addTemplateForm.get('weeklyOfDays')?.markAsTouched();
      this.addTemplateForm.get('weeklyOfDays')?.updateValueAndValidity();
    }

    else if (type === 'weklyofHalfDay') {
      const selectedDays = this.addTemplateForm.get('weklyofHalfDay')?.value || [];
      const index = selectedDays.indexOf(day);

      if (event.checked && index === -1) {
        selectedDays.push(day);
      } else if (!event.checked && index !== -1) {
        selectedDays.splice(index, 1);
      }

      this.addTemplateForm.patchValue({ weklyofHalfDay: selectedDays });
    }

    else if (type === 'daysForAlternateWeekOffRoutine') {
      const selectedDays = this.addTemplateForm.get('daysForAlternateWeekOffRoutine')?.value || [];
      const index = selectedDays.indexOf(day);

      if (event.checked && index === -1) {
        selectedDays.push(day);
      } else if (!event.checked && index !== -1) {
        selectedDays.splice(index, 1);
      }

      this.addTemplateForm.patchValue({ daysForAlternateWeekOffRoutine: selectedDays });
      this.addTemplateForm.get('daysForAlternateWeekOffRoutine')?.updateValueAndValidity();
    }
  }

  getAllUsers() {
    this.commonService.populateUsers().subscribe((res: any) => {
      this.users = res.data.data;
    });
  }

  getLeaveCatgeories() {
    const requestBody = { skip: this.defaultCatSkip, next: this.defaultCatNext };
    this.leaveService.getAllLeaveCategories(requestBody).subscribe((res: any) => {
      const categories = res.data;
      this.leaveCategories = categories.filter((leaveType: { leaveType: string; }) => leaveType.leaveType === 'general-leave');
    });
  }

  onSubmission() {
    if (this.addTemplateForm.valid && !this.submitted) {
      this.submitted = true; // Disable button immediately
      this.addTemplateForm.value.leveCategoryHierarchyForAbsentHalfDay = this.selectedCategory;
      this.addTemplateForm.value.daysForAlternateWeekOffRoutine = this.selectedAlternateWeekDays;
      this.addTemplateForm.value.weklyofHalfDay = this.selectedHalfDays;
      this.addTemplateForm.value.weeklyOfDays = this.selectedWeeklyDays;

      if (!this.isEdit) {
        this.attendanceService.addAttendanceTemplate(this.addTemplateForm.value).subscribe({
          next: (res: any) => {
            this.attendanceService.selectedTemplate.next(res.data);
            this.toast.success('Attendance Template created', 'Successfully!!!');
            this.expenseTemplateReportRefreshed.emit(res.data);
            this.closeModal();
          },
          error: (err) => {
            this.toast.error('Attendance Template cannot be created', 'Error!!!');
            this.submitted = false; // Re-enable button on error
          },
          complete: () => {
            this.submitted = false; // Re-enable button after completion
          }
        });
      } else {
        const templateId = this.attendanceService.selectedTemplate.getValue()._id;
        this.attendanceService.updateAttendanceTemplate(templateId, this.addTemplateForm.value).subscribe({
          next: (res: any) => {
            this.toast.success('Attendance Template Updated', 'Successfully!');
            this.expenseTemplateReportRefreshed.emit(res.data);
            this.closeModal();
          },
          error: (err) => {
            this.toast.error('Attendance Template cannot be Updated', 'Error!');
            this.submitted = false; // Re-enable button on error
          },
          complete: () => {
            this.submitted = false; // Re-enable button after completion
          }
        });
      }
    } else {
      this.addTemplateForm.markAllAsTouched();
      this.submitted = false; // Ensure button is enabled if form is invalid
    }
  }

  getModes() {
    this.attendanceService.getModes().subscribe((res: any) => {
      this.modes = res.data;
    });
  }
}