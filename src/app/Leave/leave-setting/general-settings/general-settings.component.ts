import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LeaveService } from 'src/app/_services/leave.service';

@Component({
  selector: 'app-general-settings',
  templateUrl: './general-settings.component.html',
  styleUrl: './general-settings.component.css'
})
export class GeneralSettingsComponent {
  months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October',
    'November', 'December'];
  isEdit: boolean = false;
  selectedHour: number;
  selectedMinute: number;
  leaveGeneralSettings: any;
  leaveGeneralSettingForm: FormGroup;
  bsValue = new Date();
  totalMinutes: number = 0;
  form: FormGroup;

  constructor(private leaveService: LeaveService,
    private fb: FormBuilder) {
    this.leaveGeneralSettingForm = this.fb.group({
      leaveCycleStart: ['', Validators.required],
      isAdminAccessLeaveApproveReject: [true, Validators.required],
      canSupervisorAddLeaveAdjustment: [true, Validators.required],
      isDailyLeaveAccrualsRun: [true, Validators.required],
      initialBalanceSetDate: [],
      isFreezeInitialBalancesOnceFirstAccrualRun: [true, Validators.required],
      shortLeaveApplicationLimit: [0, Validators.required],
      maxDurationForShortLeaveApplicationInMin: [0, Validators.required],
      band: ['', Validators.required],
      fullDayMinHour: [0, Validators.required],
      halfDayMinHour: [0, Validators.required],
    });
    this.form = this.fb.group({
      hours: [0],
      minutes: [0]
    });
  }

  ngOnInit(): void {
    const currentTime = new Date();
    this.selectedHour = currentTime.getHours();
    this.selectedMinute = currentTime.getMinutes();
    // this.getLeave();
    this.leaveService.getGeneralSettingsByCompany().subscribe((res: any) => {
      this.leaveGeneralSettings = res.data;
    this.leaveGeneralSettingForm.patchValue({
      leaveCycleStart: this.leaveGeneralSettings.leaveCycleStart,
      isAdminAccessLeaveApproveReject: this.leaveGeneralSettings.isAdminAccessLeaveApproveReject,
      canSupervisorAddLeaveAdjustment: this.leaveGeneralSettings.canSupervisorAddLeaveAdjustment,
      isDailyLeaveAccrualsRun: this.leaveGeneralSettings.isDailyLeaveAccrualsRun,
      initialBalanceSetDate: this.leaveGeneralSettings.initialBalanceSetDate,
      isFreezeInitialBalancesOnceFirstAccrualRun: this.leaveGeneralSettings.isFreezeInitialBalancesOnceFirstAccrualRun,
      shortLeaveApplicationLimit: this.leaveGeneralSettings.shortLeaveApplicationLimit,
      maxDurationForShortLeaveApplicationInMin: this.leaveGeneralSettings.maxDurationForShortLeaveApplicationInMin,
      band: this.leaveGeneralSettings.band,
      fullDayMinHour: this.leaveGeneralSettings.fullDayMinHour,
      // fullDayMinHour: this.totalMinutes,
      halfDayMinHour: this.leaveGeneralSettings.halfDayMinHour,
    });
  })

  }


  calculateTotalTime() {
    const hours = this.form.value.hours;
    const minutes = this.form.value.minutes;
    this.totalMinutes = (hours * 60) + minutes;
    console.log(this.totalMinutes)
  }

  toggleEdit() {
    this.isEdit = !this.isEdit;
  }

  incrementHour() {
    if (this.selectedHour < 23) {
      this.selectedHour++;
      console.log(this.selectedHour)
    }
  }

  decrementHour() {
    if (this.selectedHour > 0) {
      this.selectedHour--;
    }
  }

  incrementMinute() {
    if (this.selectedMinute < 59) {
      this.selectedMinute++;
    }
  }

  decrementMinute() {
    if (this.selectedMinute > 0) {
      this.selectedMinute--;
    }
  }

  getLeave() {
    this.leaveService.getGeneralSettingsByCompany().subscribe((res: any) => {
      this.leaveGeneralSettings = res.data;
      console.log(this.leaveGeneralSettings)
    })
  }

  onUpdate() {
    this.isEdit = true;
    let id = this.leaveGeneralSettings._id;
    const request = this.leaveGeneralSettingForm.value
    let payload = {
      leaveCycleStart: request.leaveCycleStart,
      isAdminAccessLeaveApproveReject: request.isAdminAccessLeaveApproveReject,
      canSupervisorAddLeaveAdjustment: request.canSupervisorAddLeaveAdjustment,
      isDailyLeaveAccrualsRun: request.isDailyLeaveAccrualsRun,
      initialBalanceSetDate: request.initialBalanceSetDate,
      isFreezeInitialBalancesOnceFirstAccrualRun: request.isFreezeInitialBalancesOnceFirstAccrualRun,
      shortLeaveApplicationLimit: request.shortLeaveApplicationLimit,
      maxDurationForShortLeaveApplicationInMin: request.maxDurationForShortLeaveApplicationInMin,
      band: 'admin',
      // fullDayMinHour: request.fullDayMinHour,
      fullDayMinHour: this.totalMinutes,
      halfDayMinHour: request.halfDayMinHour,
    }
    console.log(payload);
    this.leaveService.updateGeneralSettings(id, payload).subscribe((res: any) => {
      this.leaveGeneralSettings = res.data;
    });
  }
}
