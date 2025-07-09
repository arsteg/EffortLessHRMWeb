import { Component, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { UserService } from 'src/app/_services/users.service';
import { forkJoin } from 'rxjs';
import { PayrollService } from 'src/app/_services/payroll.service';
import { AuthenticationService } from 'src/app/_services/authentication.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-statutory-details',
  templateUrl: './statutory-details.component.html',
  styleUrls: ['./statutory-details.component.css']
})
export class StatutoryDetailsComponent {
  statutoryDetailsForm: FormGroup;
  selectedUser: any;
  generalSettings: any;
  isUserMode: boolean = true;
  isSubmitting: boolean = false;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private toast: ToastrService,
    private router: Router,
    private payrollService: PayrollService,
    private route: ActivatedRoute,
    private translate: TranslateService,
    public authService: AuthenticationService
  ) {
    this.statutoryDetailsForm = this.fb.group({
      user: [''],
      isEmployeeEligibleForPFDeduction: [true, Validators.required],
      isEmployeePFCappedAtPFCeiling: [true, Validators.required],
      isEmployerPFCappedAtPFCeiling: [true, Validators.required],
      providentFundJoiningDate: [],
      providentFundNumber: ['', [Validators.pattern(/^[a-zA-Z0-9]{1,22}$/)]],
      UANNumber: ['', [Validators.pattern(/^\d{12}$/)]],
      fixedAmountForYourProvidentFundWage: [0],
      additionalPFContributionInPercentage: [
        0,
        [Validators.pattern(/^\d*\.?\d+$/)] // Accepts integers or decimals, no + - or characters
      ],
      isESICDeductedFromSalary: [true, Validators.required],
      ESICNumber: ['', [Validators.pattern(/^\d{17}$/)]],
      isTaxDeductedFromPlayslip: [true, Validators.required],
      isLWFDeductedFromPlayslip: [true, Validators.required],
      isIncomeTaxDeducted: [true, Validators.required],
      isGratuityEligible: [true, Validators.required],
      isComeUnderGratuityPaymentAct: [true, Validators.required],
      taxRegime: ['', Validators.required],
      taxRegimeUpdated: [],
      taxRegimeUpdatedBy: [''],
      roundOffApplicable: [true, Validators.required],
      eligibleForOvertime: [true, Validators.required]
    });
  }

  ngOnInit() {
    this.logUrlSegmentsForUser();
    this.isUserMode = this.router.url.includes('profile');
    this.toggleRadioControlsDisable(this.isUserMode);
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.setGratuityEligibilityValidator();
    }, 1000);
  }

  logUrlSegmentsForUser() {
    const empCode = this.route.parent.snapshot.paramMap.get('empCode') || this.authService.currentUserValue?.empCode;
    if (empCode) {
      this.userService.getUserByEmpCode(empCode).subscribe((res: any) => {
        this.selectedUser = res.data[0];
        this.payrollService.getGeneralSettings(this.selectedUser?.company?._id).subscribe((res: any) => {
          this.generalSettings = res.data;
        });
        this.getStatutoryDetailsByUser();
      });
    }
  }

  getStatutoryDetailsByUser() {
    forkJoin([
      this.userService.getStatutoryByUserId(this.selectedUser?._id)
    ]).subscribe((results: any[]) => {
      this.statutoryDetailsForm.patchValue(results[0].data);
      const userId = this.selectedUser?._id;
      this.statutoryDetailsForm.patchValue({
        user: userId,
        taxRegimeUpdatedBy: userId
      });
    });
  }

  toggleRadioControlsDisable(isDisable: boolean) {
    const controlsToToggle = [
      'isEmployeeEligibleForPFDeduction',
      'isEmployeePFCappedAtPFCeiling',
      'isEmployerPFCappedAtPFCeiling',
      'isESICDeductedFromSalary',
      'isTaxDeductedFromPlayslip',
      'isLWFDeductedFromPlayslip',
      'isIncomeTaxDeducted',
      'isComeUnderGratuityPaymentAct',
      'roundOffApplicable',
      'eligibleForOvertime'
    ];

    controlsToToggle.forEach(controlName => {
      const control = this.statutoryDetailsForm.get(controlName);
      if (!control) return;

      if (isDisable) {
        control.disable({ emitEvent: false });
        control.clearValidators(); // Prevent disabled controls from affecting form validity
      } else {
        control.enable({ emitEvent: false });
        control.setValidators(Validators.required);
      }
      control.updateValueAndValidity({ emitEvent: false });
    });

    // Handle taxRegime separately as it’s a select, not a radio button
    const taxRegimeControl = this.statutoryDetailsForm.get('taxRegime');
    if (taxRegimeControl) {
      if (isDisable) {
        taxRegimeControl.disable({ emitEvent: false });
        taxRegimeControl.clearValidators();
      } else {
        taxRegimeControl.enable({ emitEvent: false });
        taxRegimeControl.setValidators(Validators.required);
      }
      taxRegimeControl.updateValueAndValidity({ emitEvent: false });
    }
  }

  setGratuityEligibilityValidator() {
    const gratuityControl = this.statutoryDetailsForm.get('isGratuityEligible');
    if (!gratuityControl) return;

    if (!this.generalSettings?.isGraduityEligible) {
      gratuityControl.setValue(false);
      gratuityControl.setErrors({ generalSettingRestricted: true });
      gratuityControl.disable({ emitEvent: false });
      gratuityControl.clearValidators();
      gratuityControl.updateValueAndValidity({ emitEvent: false });
      return;
    }

    const createdOn = new Date(this.selectedUser?.createdOn);
    const currentDate = new Date();
    const yearDiff = currentDate.getFullYear() - createdOn.getFullYear();
    const monthDiff = currentDate.getMonth() - createdOn.getMonth();
    const dayDiff = currentDate.getDate() - createdOn.getDate();

    const completedFiveYears =
      yearDiff > 5 || (yearDiff === 5 && (monthDiff > 0 || (monthDiff === 0 && dayDiff >= 0)));

    if (!completedFiveYears) {
      gratuityControl.setValue(false);
      gratuityControl.setErrors({ notCompletedFiveYears: true });
      gratuityControl.disable({ emitEvent: false });
      gratuityControl.clearValidators();
      gratuityControl.updateValueAndValidity({ emitEvent: false });
    } else {
      gratuityControl.enable({ emitEvent: false });
      if (!this.isUserMode) {
        gratuityControl.setValidators(Validators.required);
      }
      gratuityControl.setErrors(null);
      gratuityControl.updateValueAndValidity({ emitEvent: false });
    }
  }

  onSubmission() {
    this.isSubmitting = true;
    this.statutoryDetailsForm.markAllAsTouched(); // Show validation errors in UI

    // Check only enabled controls for validity
    let isInvalid = false;
    Object.keys(this.statutoryDetailsForm.controls).forEach(controlName => {
      const control = this.statutoryDetailsForm.get(controlName);
      if (control?.enabled && control?.invalid) {
        isInvalid = true;
      }
    });

    if (isInvalid) {
      this.toast.error(
        this.translate.instant('common.missing_required_Field'),
        this.translate.instant('common.validation_error')
      );
      this.isSubmitting = false;
      return;
    }

    const userId = this.selectedUser?._id;

    this.statutoryDetailsForm.patchValue({
      user: userId,
      taxRegimeUpdatedBy: userId
    });

    this.userService.getStatutoryByUserId(this.selectedUser?._id).subscribe((res: any) => {
      this.statutoryDetailsForm.get('isGratuityEligible').enable({ emitEvent: false });

      if (!res.data || res.data.length === 0 || res.data === null) {
        this.userService.addStatutoryDetails(this.statutoryDetailsForm.value).subscribe({
          next: (res: any) => {
            this.getStatutoryDetailsByUser();
            this.toast.success(
              this.translate.instant('manage.users.employee-settings.statutory_details_added'),
              this.translate.instant('common.success')
            );
            this.isSubmitting = false;
          },
          error: (err) => {
            const errorMessage =
              err?.error?.message ||
              err?.message ||
              this.translate.instant('manage.users.employee-settings.failed_to_add_statutory_details');
            this.toast.error(errorMessage, this.translate.instant('common.error'));
            this.isSubmitting = false;
          }
        });
      } else {
        this.userService.updateStatutoryDetails(res.data?._id, this.statutoryDetailsForm.value).subscribe({
          next: (res: any) => {
            this.getStatutoryDetailsByUser();
            this.toast.success(
              this.translate.instant('manage.users.employee-settings.statutory_details_updated'),
              this.translate.instant('common.success')
            );
            this.isSubmitting = false;
          },
          error: (err) => {
            const errorMessage =
              err?.error?.message ||
              err?.message ||
              this.translate.instant('manage.users.employee-settings.failed_to_update_statutory_details');
            this.toast.error(errorMessage, this.translate.instant('common.error'));
            this.isSubmitting = false;
          }
        });
      }
      this.setGratuityEligibilityValidator(); // Reapply gratuity validator after submission
    });
  }
}