import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { CustomValidators } from 'src/app/_helpers/custom-validators';
import { AuthenticationService } from 'src/app/_services/authentication.service';
import { PayrollService } from 'src/app/_services/payroll.service';
import { UserService } from 'src/app/_services/users.service';

@Component({
    selector: 'app-general-settings',
    templateUrl: './general-settings.component.html',
    styleUrls: ['./general-settings.component.css']
})
export class GeneralSettingsComponent implements OnInit {
    generalSettingForm: FormGroup;
    isEdit = false;
    days: (number | string)[] = [...Array.from({ length: 28 }, (_, i) => i + 1), "Last Day of Month"];
    approvers: any[] = [];
    fixedAllowance: any[] = [];
    currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    showPassword = false;

    constructor(
        private fb: FormBuilder,
        private payrollService: PayrollService,
        private userService: UserService,
        private toast: ToastrService,
         private translate: TranslateService,
        private authService: AuthenticationService
    ) {
        this.generalSettingForm = this.fb.group({
            dayOfMonthToRunPayroll:[{ value: 'Last Day of Month', disabled: true }, Validators.required],
            payrollApprovar: ['',Validators.required],
            password: [''],
            isPasswordForSalaryRegister: [false],
            isGraduityEligible: [false],
            percentageForGraduity: ['0'],
            isAllowTDSFromEffortlessHRM: [false],
            isAllowToCalculateOvertime: [false]
        });
        // this.generalSettingForm.disable();
    }

    ngOnInit() {
        this.loadData();
        this.generalSettingForm.get('isPasswordForSalaryRegister')?.valueChanges.subscribe((value: boolean) => {
            const passwordControl = this.generalSettingForm.get('password');
          
            if (value === true) {
              passwordControl?.setValidators([Validators.required]);
            } else {
              passwordControl?.clearValidators();
              passwordControl?.setValue('');  // optional: clear password when it's not needed
            }
          
            passwordControl?.updateValueAndValidity();
          });
          this.generalSettingForm.get('isGraduityEligible')?.valueChanges.subscribe((value: boolean) => {
            const gratuityControl = this.generalSettingForm.get('percentageForGraduity');
          
            if (value === true) {
              gratuityControl?.setValidators([Validators.required, CustomValidators.greaterThanOneValidator()]);

            } else {
              gratuityControl?.clearValidators();
              gratuityControl?.setValue('');
            }
          
            gratuityControl?.updateValueAndValidity();
          });
    }

    loadData() {
        // Load approvers
       this.getAllManagers();

        // Load fixed allowances and general settings
        this.payrollService.getFixedAllowance({ skip: '', next: '' }).subscribe({
            next: (res: any) => {
                this.fixedAllowance = res.data;
                this.loadGeneralSettings();
            },
            error: () => this.toast.error('Failed to load fixed allowances')
        });
    }
    getAllManagers() {
        this.approvers = [];
        this.userService.getManagers().subscribe({
          next: response => {
            this.userService.getusers(response.data).subscribe({
              next: result => {
                result.data.forEach(user => {
                  this.approvers.push({ id: user.id, name: `${user.firstName} ${user.lastName}`, email: user.email });
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
          dayOfMonthToRunPayroll: settings.dayOfMonthToRunPayroll ?? 'Last Day of Month',
            payrollApprovar: settings.payrollApprovar,
            password: settings.password,
            isPasswordForSalaryRegister: settings.isPasswordForSalaryRegister ?? false,
            isGraduityEligible: settings.isGraduityEligible ?? false,
            percentageForGraduity: settings.percentageForGraduity ?? '0',
            isAllowTDSFromEffortlessHRM: settings.isAllowTDSFromEffortlessHRM  ?? false,
            isAllowToCalculateOvertime: settings.isAllowToCalculateOvertime ?? false
        });
    }

    saveGeneralSettings() {
        this.generalSettingForm.get('dayOfMonthToRunPayroll')?.enable();
        const companyId = this.fixedAllowance[0]?.company;
        if (!companyId) return;
        if (this.generalSettingForm.invalid) {
            
            this.generalSettingForm.markAllAsTouched();  // This triggers validation errors
            this.toast.error(this.translate.instant('payroll.RequiredFieldAreMissing'), 'Error!');  
            this.generalSettingForm.get('dayOfMonthToRunPayroll')?.disable();
            return;
          }
        this.payrollService.getGeneralSettings(companyId).subscribe({
            next: (res: any) => {
                const settings = res.data;
                const request = settings.length === 0
                    ? this.payrollService.addGeneralSettings(this.generalSettingForm.value)
                    : this.payrollService.updateGeneralSettings(companyId, this.generalSettingForm.value);

                request.subscribe(
                  (res) => {
                        this.patchFormValues(res.data);
                        this.toast.success(`General Settings ${settings.length === 0 ? 'Added' : 'Updated'} Successfully`);                         
                        this.resetSettings();
                    },
                    (err) => {
                      {
                        const errorMessage = err?.error?.message || err?.message || this.translate.instant('payroll.save_failed');
                        this.translate.get('payroll.save_failed').subscribe(title => {
                          this.toast.error(errorMessage, title);
                        });
                        this.generalSettingForm.get('dayOfMonthToRunPayroll')?.disable();
                      }
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
        this.generalSettingForm.get('dayOfMonthToRunPayroll')?.disable();
        this.loadGeneralSettings();
    }

    togglePasswordVisibility() {
        this.showPassword = !this.showPassword;
    }
}