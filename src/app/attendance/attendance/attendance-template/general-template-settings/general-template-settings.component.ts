import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AttendanceService } from 'src/app/_services/attendance.service';
import { LeaveService } from 'src/app/_services/leave.service';
import { CommonService } from 'src/app/common/common.service';

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
  selectedWeeklyDays: string[] = [];
  selectedHalfDays: string[] = [];
  selectedAlternateWeekDays: string[] = [];
  attendanceTemplate: any;

  constructor(private commonService: CommonService,
    private leaveService: LeaveService,
    private fb: FormBuilder,
    private attendanceService: AttendanceService,
    private toast: ToastrService,
  ) {
    this.addTemplateForm = this.fb.group({
      label: [''],
      attendanceMode: [''],
      missingCheckInCheckoutHandlingMode: [''],
      missingCheckinCheckoutAttendanceProcessMode: [''],
      minimumHoursRequiredPerWeek: [40],
      minimumMinutesRequiredPerWeek: [0],
      notifyEmployeeMinHours: [true],
      isShortTimeLeaveDeductible: [true],
      weeklyOfDays: [null],
      weklyofHalfDay: [null],
      alternateWeekOffRoutine: ['none'],
      daysForAlternateWeekOffRoutine: [null],
      isNotificationToSupervisors: [true],
      isCommentMandatoryForRegularisation: [true],
      departmentDesignations: ['Software Developer'],
      approversType: [''],
      approvalLevel: [''],
      primaryApprover: [null],
      secondaryApprover: [null],
      leveCategoryHierarchyForAbsentHalfDay: [['']]
    })
  }

  ngOnInit() {
    console.log(this.isEdit)
    this.getAllUsers();
    this.getLeaveCatgeories();
    if (this.isEdit) {
      this.attendanceService.selectedTemplate.subscribe(res => {
        if (res._id) {
          console.log(res)
          this.setFormValues(res)
        }
      })
    }
  }

  setFormValues(templateData: any) {
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

    console.log(this.selectedWeeklyDays, this.addTemplateForm.value);
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
    this.leaveService.getAllLeaveCategories().subscribe((res: any) => {
      const categories = res.data;
      this.leaveCategories = categories.filter((leaveType) => leaveType.leaveType === 'general-leave');
    })
  }

  onSubmission() {
   if(this.isEdit) {
      this.addTemplateForm.value.leveCategoryHierarchyForAbsentHalfDay = this.selectedCategory;
      this.addTemplateForm.value.daysForAlternateWeekOffRoutine = this.selectedAlternateWeekDays;
      this.addTemplateForm.value.weklyofHalfDay = this.selectedHalfDays
      this.addTemplateForm.value.weeklyOfDays = this.selectedWeeklyDays

      this.attendanceService.addAttendanceTemplate(this.addTemplateForm.value).subscribe((res: any) => {
        this.attendanceTemplate = res.data;
        this.toast.success('Attendance Template created', 'Successfully!!!');
        this.addTemplateForm.reset();
      },
        err => {
          this.toast.error('Attendance Template can not be created', 'Error!!!')
        })
    }
    else{
      console.log('update call')
    }
  }

  getTemplateById() {

    this.attendanceService.getAttendanceTemplateById
  }
}