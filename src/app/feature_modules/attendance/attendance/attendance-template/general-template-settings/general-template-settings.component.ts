import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AttendanceService } from 'src/app/_services/attendance.service';
import { LeaveService } from 'src/app/_services/leave.service';
import { CommonService } from 'src/app/_services/common.Service';

@Component({
  selector: 'app-general-template-settings',
  templateUrl: './general-template-settings.component.html',
  styleUrl: './general-template-settings.component.css'
})
export class GeneralTemplateSettingsComponent {
  @Output() close: any = new EventEmitter();
  @Input() changeMode: any;
  @Input() isEdit: boolean;
  weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  checkedFormats: any = ['']
  addTemplateForm: FormGroup;
  users: any = [];
  selectedCategories: any = [];
  leaveCategories: any[];
  selectedCategory: string[] = ['loss-of-pay', 'present'];
  selectedWeeklyDays: any[] = [false, false, false, false, false, false, false];
  selectedHalfDays: string[] = [];
  selectedAlternateWeekDays: string[] = [];
  attendanceTemplate: any;
  @Output() changeStep: any = new EventEmitter();
  capturingAttendance: any = [''];
  defaultCatSkip = "0";
  defaultCatNext = "100000";
  modes: any;

  constructor(private commonService: CommonService,
    private leaveService: LeaveService,
    private fb: FormBuilder,
    private attendanceService: AttendanceService,
    private toast: ToastrService,
  ) {
    this.addTemplateForm = this.fb.group({
      label: ['', Validators.required],
      attendanceMode: [[], Validators.required],
      missingCheckInCheckoutHandlingMode: ['', Validators.required],
      missingCheckinCheckoutAttendanceProcessMode: ['', Validators.required],
      minimumHoursRequiredPerWeek: [40, Validators.required],
      minimumMinutesRequiredPerWeek: [0, Validators.required],
      notifyEmployeeMinHours: [true, Validators.required],
      isShortTimeLeaveDeductible: [true, Validators.required],
      weeklyOfDays: [null],
      weklyofHalfDay: [null],
      alternateWeekOffRoutine: ['none', Validators.required],
      daysForAlternateWeekOffRoutine: [null],
      isNotificationToSupervisors: [true],
      isCommentMandatoryForRegularisation: [true],
      departmentDesignations: ['Software Developer', Validators.required],
      approversType: ['', Validators.required],
      approvalLevel: ['', Validators.required],
      primaryApprover: [null],
      secondaryApprover: [null],
      leveCategoryHierarchyForAbsentHalfDay: [[''], Validators.required]
    })
  }

  ngOnInit() {
    this.getModes();
    this.getAllUsers();
    this.getLeaveCatgeories();
    if (this.isEdit) {
      this.attendanceService.selectedTemplate.subscribe(res => {
        if (res._id) {
          this.setFormValues();
        }
      })
    }
    this.addTemplateForm.get('approvalLevel').valueChanges.subscribe((value: any) => {
      this.validateApprovers(this.addTemplateForm.get('approversType').value, value)
    });
    this.addTemplateForm.get('approversType').valueChanges.subscribe((value: any) => {
      this.validateApprovers(value, this.addTemplateForm.get('approvalLevel').value)
    });
    this.getModes();
  }

  validateApprovers(approversType, approverLevel) {
    if (approverLevel == 1 && approversType == 'template-wise') {
      this.addTemplateForm.get('firstApprovalEmployee').setValidators([Validators.required]);
      this.addTemplateForm.get('secondApprovalEmployee').clearValidators();
    } else if (approverLevel == 2 && approversType == 'template-wise') {
      this.addTemplateForm.get('firstApprovalEmployee').setValidators([Validators.required]);
      this.addTemplateForm.get('secondApprovalEmployee').setValidators([Validators.required]);
    } else {
      this.addTemplateForm.get('firstApprovalEmployee').clearValidators();
      this.addTemplateForm.get('secondApprovalEmployee').clearValidators();
    }
    this.addTemplateForm.get('firstApprovalEmployee').updateValueAndValidity();
    this.addTemplateForm.get('secondApprovalEmployee').updateValueAndValidity();
  }

  setFormValues() {
    if (this.isEdit) {
      this.attendanceService.selectedTemplate.subscribe(res => {
        const templateData = res;
        this.addTemplateForm.patchValue({
          label: templateData?.label,
          attendanceMode: templateData?.attendanceMode,
          missingCheckInCheckoutHandlingMode: templateData?.missingCheckInCheckoutHandlingMode,
          missingCheckinCheckoutAttendanceProcessMode: templateData?.missingCheckinCheckoutAttendanceProcessMode,
          minimumHoursRequiredPerWeek: templateData?.minimumHoursRequiredPerWeek,
          minimumMinutesRequiredPerWeek: templateData?.minimumMinutesRequiredPerWeek,
          notifyEmployeeMinHours: templateData?.notifyEmployeeMinHours,
          isShortTimeLeaveDeductible: templateData?.isShortTimeLeaveDeductible,
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
        this.selectedWeeklyDays = templateData?.weeklyOfDays;
        this.selectedHalfDays = templateData?.weklyofHalfDay;
        this.selectedAlternateWeekDays = templateData?.daysForAlternateWeekOffRoutine;
        this.selectedCategory = templateData?.leveCategoryHierarchyForAbsentHalfDay;
        this.capturingAttendance = templateData?.attendanceMode;
      });
    }
    if (!this.isEdit) {
      this.addTemplateForm.reset({
        label: '',
        missingCheckInCheckoutHandlingMode: '',
        missingCheckinCheckoutAttendanceProcessMode: '',
        minimumHoursRequiredPerWeek: 40,
        minimumMinutesRequiredPerWeek: 0,
        notifyEmployeeMinHours: true,
        isShortTimeLeaveDeductible: true,
        weeklyOfDays: null,
        weklyofHalfDay: null,
        alternateWeekOffRoutine: 'none',
        daysForAlternateWeekOffRoutine: null,
        isNotificationToSupervisors: true,
        isCommentMandatoryForRegularisation: true,
        approversType: '',
        approvalLevel: '',
        primaryApprover: '',
        secondaryApprover: '',
      });
    }
  }

  isWeeklyDays(days) {
    return this.selectedWeeklyDays?.length ? this.selectedWeeklyDays.includes(days) : days != 'Sun' && days != 'Mon' && days != 'Tue' && days != 'Wed' && days != 'Thu' && days != 'Fri' && days != 'Sat';
  }

  isHalfDays(days) {
    return this.selectedHalfDays?.length ? this.selectedHalfDays.includes(days) : days != 'Sun' && days != 'Mon' && days != 'Tue' && days != 'Wed' && days != 'Thu' && days != 'Fri' && days != 'Sat';
  }
  isAlternateWeekDays(days) {
    return this.selectedAlternateWeekDays?.length ? this.selectedAlternateWeekDays.includes(days) : days != 'Sun' && days != 'Mon' && days != 'Tue' && days != 'Wed' && days != 'Thu' && days != 'Fri' && days != 'Sat';
  }

  closeModal() {
    this.close.emit(true);
  }

  onDaysChange(event: any, day: string, type: string) {
    let selectedDays: string[];
    if (type === 'weeklyOfDays') {
      selectedDays = this.selectedWeeklyDays;
      this.addTemplateForm.value.weeklyOfDays = selectedDays
    } else if (type === 'weklyofHalfDay') {
      selectedDays = this.selectedHalfDays;
      this.addTemplateForm.value.weklyofHalfDay = selectedDays
    } else if (type === 'daysForAlternateWeekOffRoutine') {
      selectedDays = this.selectedAlternateWeekDays;
      this.addTemplateForm.value.daysForAlternateWeekOffRoutine = selectedDays
    }

    const index = selectedDays.indexOf(day);
    if (event.target.checked && index === -1) {
      selectedDays.push(day);
    } else if (!event.target.checked && index !== -1) {
      selectedDays.splice(index, 1);
    }
  }

  getAllUsers() {
    this.commonService.populateUsers().subscribe((res: any) => {
      this.users = res.data.data;
    })
  }

  getLeaveCatgeories() {
    const requestBody = { "skip": this.defaultCatSkip, "next": this.defaultCatNext };
    this.leaveService.getAllLeaveCategories(requestBody).subscribe((res: any) => {
      const categories = res.data;
      this.leaveCategories = categories.filter((leaveType) => leaveType.leaveType === 'general-leave');
    })
  }

  onSubmission() {
    // this.validateApprovers(this.addTemplateForm.value.approversType, this.addTemplateForm.value.approvalLevel);
    if (this.addTemplateForm.valid) {

      this.addTemplateForm.value.leveCategoryHierarchyForAbsentHalfDay = this.selectedCategory;
      this.addTemplateForm.value.daysForAlternateWeekOffRoutine = this.selectedAlternateWeekDays;
      this.addTemplateForm.value.weklyofHalfDay = this.selectedHalfDays;
      this.addTemplateForm.value.weeklyOfDays = this.selectedWeeklyDays;
      if (this.isEdit == false) {
        this.attendanceService.addAttendanceTemplate(this.addTemplateForm.value).subscribe((res: any) => {
          this.attendanceService.selectedTemplate.next(res.data);
          this.toast.success('Attendance Template created', 'Successfully!!!');
          this.changeStep.emit(2);
        },
          (err) => {
            this.toast.error('Attendance Template can not be created', 'Error!!!')
          })
      }
      else {
        const templateId = this.attendanceService.selectedTemplate.getValue()._id;
        this.attendanceService.updateAttendanceTemplate(templateId, this.addTemplateForm.value).subscribe((res: any) => {
          this.toast.success('Attendance Template Updated', 'Successfully!');
          this.changeStep.emit(2);
        },
          err => {
            this.toast.error('Attendance Template can not be Updated', 'Error!')

          })
      }
    }
    else {
      this.addTemplateForm.markAllAsTouched();
    }
  }

  getModes() {
    this.attendanceService.getModes().subscribe((res: any) => {
      this.modes = res.data;
    })
  }
}
