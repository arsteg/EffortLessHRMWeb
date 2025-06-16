import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AuthenticationService } from 'src/app/_services/authentication.service';
import { PayrollService } from 'src/app/_services/payroll.service';

@Component({
    selector: 'app-general-settings',
    templateUrl: './general-settings.component.html',
    styleUrls: ['./general-settings.component.css']
})
export class GeneralSettingsComponent implements OnInit {
    generalSettingForm: FormGroup;
    isEdit = false;
    days: number[] = Array.from({ length: 28 }, (_, i) => i + 1);
    approvers: any[] = [];
    fixedAllowance: any[] = [];
    currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    showPassword = false;

    constructor(
        private fb: FormBuilder,
        private payrollService: PayrollService,
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
            leaveEncashment: [[]],
            denominatorForCalculatingTheEncashment: [''],
            payoutRolloverLeaveEncashmentForEmployees: [[]],
            calculateLeaveRecovery: [[]],
            denominatorForCalculatingTheLeaveRecovery: [[]],
            recoverOutstandingIncomeTaxOfEmployees: [[]],
            isNoticePeriodRecoveryApplicable: [true],
            denominatorForCalculatingTheNoticeRecovery: [''],
            isAllowTDSFromEffortlessHRM: [true],
            isAllowNcpDaysApplicableInPF: [true],
            isAllowToCalculateOvertime: [true]
        });
        this.generalSettingForm.disable();
    }

    ngOnInit() {
        this.loadData();
    }

    loadData() {
        // Load approvers
        this.authService.getUserManagers(this.currentUser.id).subscribe({
            next: (res: any) => this.approvers = res.data,
            error: () => this.toast.error('Failed to load approvers')
        });

        // Load fixed allowances and general settings
        this.payrollService.getFixedAllowance({ skip: '', next: '' }).subscribe({
            next: (res: any) => {
                this.fixedAllowance = res.data;
                this.loadGeneralSettings();
            },
            error: () => this.toast.error('Failed to load fixed allowances')
        });
    }

    loadGeneralSettings() {
        const companyId = this.fixedAllowance[0]?.company;
        if (!companyId) return;

        this.payrollService.getGeneralSettings(companyId).subscribe({
            next: (res: any) => {
                this.patchFormValues(res.data);
            },
            error: () => this.toast.error('Failed to load general settings')
        });
    }

    patchFormValues(settings: any) {
        this.generalSettingForm.patchValue({
            dayOfMonthToRunPayroll: settings.dayOfMonthToRunPayroll,
            payrollApprovar: settings.payrollApprovar,
            dayOfMonthToStartAttendanceCycle: settings.dayOfMonthToStartAttendanceCycle,
            password: settings.password,
            isPasswordForSalaryRegister: settings.isPasswordForSalaryRegister,
            isGraduityEligible: settings.isGraduityEligible,
            percentageForGraduity: settings.percentageForGraduity,
            attendanceCycle: settings.attendanceCycle,
            graduityComponentsGraduitycalculation: settings.graduityComponentsGraduitycalculation,
            leaveEncashment: settings.leaveEncashment,
            denominatorForCalculatingTheEncashment: settings.denominatorForCalculatingTheEncashment,
            payoutRolloverLeaveEncashmentForEmployees: settings.payoutRolloverLeaveEncashmentForEmployees,
            calculateLeaveRecovery: settings.calculateLeaveRecovery,
            denominatorForCalculatingTheLeaveRecovery: settings.denominatorForCalculatingTheLeaveRecovery,
            recoverOutstandingIncomeTaxOfEmployees: settings.recoverOutstandingIncomeTaxOfEmployees,
            isNoticePeriodRecoveryApplicable: settings.isNoticePeriodRecoveryApplicable,
            denominatorForCalculatingTheNoticeRecovery: settings.denominatorForCalculatingTheNoticeRecovery,
            isAllowTDSFromEffortlessHRM: settings.isAllowTDSFromEffortlessHRM,
            isAllowNcpDaysApplicableInPF: settings.isAllowNcpDaysApplicableInPF,
            isAllowToCalculateOvertime: settings.isAllowToCalculateOvertime
        });
    }

    saveGeneralSettings() {
        const companyId = this.fixedAllowance[0]?.company;
        if (!companyId) return;

        this.payrollService.getGeneralSettings(companyId).subscribe({
            next: (res: any) => {
                const settings = res.data;
                const request = settings.length === 0
                    ? this.payrollService.addGeneralSettings(this.generalSettingForm.value)
                    : this.payrollService.updateGeneralSettings(companyId, this.generalSettingForm.value);

                request.subscribe({
                    next: (res: any) => {
                        this.patchFormValues(res.data);
                        this.toast.success(`General Settings ${settings.length === 0 ? 'Added' : 'Updated'} Successfully`);
                        this.resetSettings();
                    },
                    error: () => this.toast.error('Failed to save general settings')
                });
            },
            error: () => this.toast.error('Failed to check existing settings')
        });
    }

    toggleEdit() {
        this.isEdit = !this.isEdit;
        this.isEdit ? this.generalSettingForm.enable() : this.resetSettings();
    }

    resetSettings() {
        this.isEdit = false;
        this.generalSettingForm.disable();
        this.loadGeneralSettings();
    }

    togglePasswordVisibility() {
        this.showPassword = !this.showPassword;
    }
}