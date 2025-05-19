import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AuthenticationService } from 'src/app/_services/authentication.service';
import { PayrollService } from 'src/app/_services/payroll.service';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-general-settings',
  templateUrl: './general-settings.component.html',
  styleUrl: './general-settings.component.css'
})
export class GeneralSettingsComponent {
  selectedTab: number = 1;
  generalSettings: any;
  closeResult: string = '';
  isEdit = false;
  regularization: any;
  members: any = [];
  activeTab: string = 'tabRoundingRules';
  generalSettingForm: FormGroup;
  selectedRecord: any;
  day: number[] = [];
  approvers: any;
  currentUser = JSON.parse(localStorage.getItem('currentUser'));
  months: string[] = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  fixedAllowance: any[];
  gratuityTemplate: any;
  dialogRef: MatDialogRef<any>;

  constructor(private fb: FormBuilder,
    private payroll: PayrollService,
    private toast: ToastrService,
    private authService: AuthenticationService
  ) {
    this.generalSettingForm = this.fb.group({
      dayOfMonthToRunPayroll: [0],
      payrollApprovar: [''],
      dayOfMonthToStartAttendanceCycle: [0],
      password: [''],
      isPasswordForSalaryRegister: [true],
      isGraduityEligible: [true],
      percentageForGraduity: [''],
      attendanceCycle: [''],
      graduityComponentsGraduitycalculation: [''],
      leaveEncashment: [
        []
      ],
      denominatorForCalculatingTheEncashment: [''],
      payoutRolloverLeaveEncashmentForEmployees: [
        []
      ],
      calculateLeaveRecovery: [
        []
      ],
      denominatorForCalculatingTheLeaveRecovery: [
        []
      ],
      recoverOutstandingIncomeTaxOfEmployees: [
        []
      ],
      isNoticePeriodRecoveryApplicable: [true],
      denominatorForCalculatingTheNoticeRecovery: [''],
      isAllowTDSFromEffortlessHRM: [true],
      isAllowNcpDaysApplicableInPF: [true],
      isAllowToCalculateOvertime: [true]
    });
    this.generalSettingForm.disable();
  }

  ngOnInit() {
    this.getData();
  }

  getData() {
    // Display Day
    for (let i = 1; i <= 28; i++) {
      this.day.push(i);
    }
    // get Managers
    this.authService.getUserManagers(this.currentUser.id).subscribe((res: any) => {
      this.approvers = res.data;
    });
    // get fixed allowances
    let payload = {
      skip: '',
      next: ''
    }
    this.payroll.getFixedAllowance(payload).subscribe((res: any) => {
      this.fixedAllowance = res.data;

      // get general settings by company
      this.payroll.getGeneralSettings(this.fixedAllowance[0].company).subscribe((res: any) => {
        this.generalSettings = res.data;
        this.generalSettingForm.patchValue({
          dayOfMonthToRunPayroll: this.generalSettings.dayOfMonthToRunPayroll,
          payrollApprovar: this.generalSettings.payrollApprovar,
          dayOfMonthToStartAttendanceCycle: this.generalSettings.dayOfMonthToStartAttendanceCycle,
          password: this.generalSettings.password,
          isPasswordForSalaryRegister: this.generalSettings.isPasswordForSalaryRegister,
          isGraduityEligible: this.generalSettings.isGraduityEligible,
          percentageForGraduity: this.generalSettings.percentageForGraduity,
          attendanceCycle: this.generalSettings.attendanceCycle,
          graduityComponentsGraduitycalculation: this.generalSettings.graduityComponentsGraduitycalculation,
          leaveEncashment: this.generalSettings.leaveEncashment,
          denominatorForCalculatingTheEncashment: this.generalSettings.denominatorForCalculatingTheEncashment,
          payoutRolloverLeaveEncashmentForEmployees: this.generalSettings.payoutRolloverLeaveEncashmentForEmployees,
          calculateLeaveRecovery: this.generalSettings.calculateLeaveRecovery,
          denominatorForCalculatingTheLeaveRecovery: this.generalSettings.denominatorForCalculatingTheLeaveRecovery,
          recoverOutstandingIncomeTaxOfEmployees: this.generalSettings.recoverOutstandingIncomeTaxOfEmployees,
          isNoticePeriodRecoveryApplicable: this.generalSettings.isNoticePeriodRecoveryApplicable,
          denominatorForCalculatingTheNoticeRecovery: this.generalSettings.denominatorForCalculatingTheNoticeRecovery,
          isAllowTDSFromEffortlessHRM: this.generalSettings.isAllowTDSFromEffortlessHRM,
          isAllowNcpDaysApplicableInPF: this.generalSettings.isAllowNcpDaysApplicableInPF,
          isAllowToCalculateOvertime: this.generalSettings.isAllowToCalculateOvertime
        })
      })
    });
  }

  onCancel() {
    this.payroll.getGeneralSettings(this.fixedAllowance[0].company).subscribe((res: any) => {
      this.generalSettings = res.data;
      this.generalSettingForm.patchValue({
        dayOfMonthToRunPayroll: this.generalSettings.dayOfMonthToRunPayroll,
        payrollApprovar: this.generalSettings.payrollApprovar,
        dayOfMonthToStartAttendanceCycle: this.generalSettings.dayOfMonthToStartAttendanceCycle,
        password: this.generalSettings.password,
        isPasswordForSalaryRegister: this.generalSettings.isPasswordForSalaryRegister,
        isGraduityEligible: this.generalSettings.isGraduityEligible,
        percentageForGraduity: this.generalSettings.percentageForGraduity,
        attendanceCycle: this.generalSettings.attendanceCycle,
        graduityComponentsGraduitycalculation: this.generalSettings.graduityComponentsGraduitycalculation,
        leaveEncashment: this.generalSettings.leaveEncashment,
        denominatorForCalculatingTheEncashment: this.generalSettings.denominatorForCalculatingTheEncashment,
        payoutRolloverLeaveEncashmentForEmployees: this.generalSettings.payoutRolloverLeaveEncashmentForEmployees,
        calculateLeaveRecovery: this.generalSettings.calculateLeaveRecovery,
        denominatorForCalculatingTheLeaveRecovery: this.generalSettings.denominatorForCalculatingTheLeaveRecovery,
        recoverOutstandingIncomeTaxOfEmployees: this.generalSettings.recoverOutstandingIncomeTaxOfEmployees,
        isNoticePeriodRecoveryApplicable: this.generalSettings.isNoticePeriodRecoveryApplicable,
        denominatorForCalculatingTheNoticeRecovery: this.generalSettings.denominatorForCalculatingTheNoticeRecovery,
        isAllowTDSFromEffortlessHRM: this.generalSettings.isAllowTDSFromEffortlessHRM,
        isAllowNcpDaysApplicableInPF: this.generalSettings.isAllowNcpDaysApplicableInPF,
        isAllowToCalculateOvertime: this.generalSettings.isAllowToCalculateOvertime
      })
    })
  }
  saveGeneralSettings() {
    this.payroll.getGeneralSettings(this.fixedAllowance[0]?.company).subscribe((res: any) => {
      const response = res.data;
      console.log(response)
      if (response.length === 0) {
        console.log(this.isEdit);
        this.payroll.addGeneralSettings(this.generalSettingForm.value).subscribe((res: any) => {
          this.generalSettings = res.data;
          this.toast.success('General Settings Added Successfully');
          this.resetSettings();
        });
      }
      else {
        const company = this.fixedAllowance[0].company;
        this.payroll.updateGeneralSettings(company, this.generalSettingForm.value).subscribe((res: any) => {
          this.generalSettings = res.data;
          this.toast.success('General Settings Updated Successfully');
          this.resetSettings();
        });
      }
    });
  }

  toggleEdit() {
    this.isEdit = !this.isEdit;
    if (this.isEdit) {
      this.generalSettingForm.enable();
    } else {
      this.onCancel();
      this.generalSettingForm.disable();
    }
  }
  resetSettings() {
    this.toggleEdit();
  }
}