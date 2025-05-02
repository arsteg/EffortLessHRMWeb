import { Component, Input } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { UserService } from 'src/app/_services/users.service';
import { forkJoin } from 'rxjs';
import { PayrollService } from 'src/app/_services/payroll.service';
import { AuthenticationService } from 'src/app/_services/authentication.service';

@Component({
  selector: 'app-statutory-details',
  templateUrl: './statutory-details.component.html',
  styleUrls: ['./statutory-details.component.css']
})
export class StatutoryDetailsComponent {
  statutoryDetailsForm: FormGroup;
  selectedUser: any;
  generalSettings: any;
  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private toast: ToastrService,
    private router: Router,
    private payrollService: PayrollService,
    private route: ActivatedRoute,
    public authService: AuthenticationService
  ) {
    this.statutoryDetailsForm = this.fb.group({
      user: [''],
      isEmployeeEligibleForPFDeduction: [true],
      isEmployeePFCappedAtPFCeiling: [true],
      isEmployerPFCappedAtPFCeiling: [true],
      providentFundJoiningDate: [],
      providentFundNumber: [0],
      UANNumber: [0],
      fixedAmountForYourProvidentFundWage: [0],
      additionalPFContributionInPercentage: [0],
      isESICDeductedFromSalary: [true],
      ESICNumber: [''],
      isTaxDeductedFromPlayslip: [true],
      isLWFDeductedFromPlayslip: [true],
      isIncomeTaxDeducted: [true],
      isGratuityEligible: [true],
      isComeUnderGratuityPaymentAct: [true],
      taxRegime: [''],
      taxRegimeUpdated: [],
      taxRegimeUpdatedBy: [''],
      roundOffApplicable: [true],
      dailyWageApplicable: [true],
      eligibleForOvertime: [true]
    })
  }

  ngOnInit() {
    this.logUrlSegmentsForUser();
  }
  ngAfterViewInit() {
    // Set gratuity validation after data is fully loaded
    setTimeout(() => {
      this.setGratuityEligibilityValidator();
    }, 1000);
  }
  logUrlSegmentsForUser() {
    const empCode = this.route.snapshot.paramMap.get('empCode') || this.authService.currentUserValue?.empCode;
    if (empCode) {
      this.userService.getUserByEmpCode(empCode).subscribe((res: any) => {
        this.selectedUser = res.data[0];
        this.payrollService.getGeneralSettings(this.selectedUser?.company?._id).subscribe((res: any) => {
          this.generalSettings = res.data;
        });
        this.getStatutoryDetailsByUser();
      })
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
      console.log(this.selectedUser?._id);
      console.log(this.statutoryDetailsForm.value);
      if (!res.data || res.data.length === 0) {
        this.userService.addStatutoryDetails(this.statutoryDetailsForm.value).subscribe((res: any) => {
          this.getStatutoryDetailsByUser();
          this.toast.success('Statutory Details Added Successfully');
        }, error => {
          this.toast.error('Statutory Details Add Failed');
        })
      } else {
        this.userService.updateStatutoryDetails(res.data?._id, this.statutoryDetailsForm.value).subscribe((res: any) => {
          this.getStatutoryDetailsByUser();
          this.toast.success('Statutory Details Updated Successfully');
        }, error => {
          this.toast.error('Statutory Details Update Failed');
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