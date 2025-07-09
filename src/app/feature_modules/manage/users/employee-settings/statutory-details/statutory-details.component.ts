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
      isEmployeeEligibleForPFDeduction: [true],
      isEmployeePFCappedAtPFCeiling: [true],
      isEmployerPFCappedAtPFCeiling: [true],
      providentFundJoiningDate: [],
      providentFundNumber: ['', [Validators.pattern(/^[a-zA-Z0-9]{1,22}$/)]],
      UANNumber: ['', [Validators.pattern(/^\d{12}$/)]],
      fixedAmountForYourProvidentFundWage: [0],
      additionalPFContributionInPercentage: [
        0,
        [Validators.pattern(/^\d*\.?\d+$/)] // accepts integers or decimals, but no + - or characters
      ],
      isESICDeductedFromSalary: [true],
      ESICNumber: ['', [Validators.pattern(/^\d{17}$/)]],
      isTaxDeductedFromPlayslip: [true],
      isLWFDeductedFromPlayslip: [true],
      isIncomeTaxDeducted: [true],
      isGratuityEligible: [true],
      isComeUnderGratuityPaymentAct: [true],
      taxRegime: [''],
      taxRegimeUpdated: [],
      taxRegimeUpdatedBy: [''],
      roundOffApplicable: [true],
      eligibleForOvertime: [true]
    })
  }

  ngOnInit() {
    this.logUrlSegmentsForUser();
    this.isUserMode = this.router.url.includes('profile');
    this.toggleRadioControlsDisable(this.isUserMode);
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
      'isGratuityEligible',
      'isComeUnderGratuityPaymentAct',
      'roundOffApplicable',
      'eligibleForOvertime'
    ];
  
    controlsToToggle.forEach(controlName => {
      const control = this.statutoryDetailsForm.get(controlName);
      if (!control) return;
  
      if (isDisable) {
        control.disable();
      } else {
        control.enable();
      }
    });
  }
  
  ngAfterViewInit() {
    // Set gratuity validation after data is fully loaded
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

  onSubmission() {
    const userId = this.selectedUser?._id;

    this.statutoryDetailsForm.patchValue({
      user: userId,
      taxRegimeUpdatedBy: userId
    });

    this.userService.getStatutoryByUserId(this.selectedUser?._id).subscribe((res: any) => {
      this.statutoryDetailsForm.get('isGratuityEligible').enable();

      if (!res.data || res.data.length === 0 || res.data === null) {
        this.userService.addStatutoryDetails(this.statutoryDetailsForm.value).subscribe((res: any) => {
          this.getStatutoryDetailsByUser();
          this.toast.success(this.translate.instant('manage.users.employee-settings.statutory_details_added'));
        }, err => {
          const errorMessage = err?.error?.message || err?.message || err 
          || this.translate.instant('manage.users.employee-settings.failed_to_add_statutory_details')
          ;       
          this.toast.error(errorMessage, 'Error!');
        })
      } else {
        this.userService.updateStatutoryDetails(res.data?._id, this.statutoryDetailsForm.value).subscribe((res: any) => {
          this.getStatutoryDetailsByUser();
          this.toast.success(this.translate.instant('manage.users.employee-settings.statutory_details_updated'));
   
        }, err => {
          const errorMessage = err?.error?.message || err?.message || err 
          || this.translate.instant('manage.users.employee-settings.failed_to_update_statutory_details')
          ;       
          this.toast.error(errorMessage, 'Error!');
        })
      }
      this.statutoryDetailsForm.get('isGratuityEligible').disable();
    });

  }
  setGratuityEligibilityValidator() {
    const gratuityControl = this.statutoryDetailsForm.get('isGratuityEligible');

    if (!this.generalSettings?.isGraduityEligible) {
      // Not eligible per general settings
      gratuityControl?.setValue(false);
      gratuityControl?.setErrors({ generalSettingRestricted: true });
      gratuityControl?.disable();
      return;
    }

    // Calculate year difference
    const createdOn = new Date(this.selectedUser?.createdOn);
    const currentDate = new Date();
    const yearDiff = currentDate.getFullYear() - createdOn.getFullYear();
    const monthDiff = currentDate.getMonth() - createdOn.getMonth();
    const dayDiff = currentDate.getDate() - createdOn.getDate();

    const completedFiveYears = (
      yearDiff > 5 ||
      (yearDiff === 5 && (monthDiff > 0 || (monthDiff === 0 && dayDiff >= 0)))
    );

    if (!completedFiveYears) {
      gratuityControl?.setValue(false);
      gratuityControl?.setErrors({ notCompletedFiveYears: true });
      gratuityControl?.disable();
    } else {
      gratuityControl?.enable();
      gratuityControl?.setErrors(null);
    }
  }

}