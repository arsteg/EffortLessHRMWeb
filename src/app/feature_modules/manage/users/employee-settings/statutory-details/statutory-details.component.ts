import { Component, Input } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { UserService } from 'src/app/_services/users.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-statutory-details',
  templateUrl: './statutory-details.component.html',
  styleUrls: ['./statutory-details.component.css']
})
export class StatutoryDetailsComponent {
  statutoryDetailsForm: FormGroup;
  selectedUser: any;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private toast: ToastrService,
    private router: Router
  ) {
    this.statutoryDetailsForm = this.fb.group({
      user: [''],
      isEmployeeEligibleForProvidentFundDeduction: [true],
      willEmployeeProvidentFundContributionCappedAtProvidentFundCeiling: [true],
      willEmployerProvidentFundContributionBeCappedAtProvidentFundCeiling: [true],
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

  logUrlSegmentsForUser() {
    const urlPath = this.router.url;
    const segments = urlPath.split('/').filter(segment => segment);
    if (segments.length >= 3) {
      const employee = segments[segments.length - 3];
      this.userService.getUserByEmpCode(employee).subscribe((res: any) => {
        this.selectedUser = res.data;
        this.getStatutoryDetailsByUser();
      })
    }
  }

  getStatutoryDetailsByUser() {
    forkJoin([
      this.userService.getStatutoryByUserId(this.selectedUser[0]?.id)
    ]).subscribe((results: any[]) => {
      this.statutoryDetailsForm.patchValue(results[0].data[0]);
    });
  }

  onSubmission() {
    this.statutoryDetailsForm.value.user = this.selectedUser[0].id;
    this.userService.getStatutoryByUserId(this.selectedUser[0].id).subscribe((res: any) => {
      if (res.data.length === 0) {
        this.userService.addStatutoryDetails(this.statutoryDetailsForm.value).subscribe((res: any) => {
          this.getStatutoryDetailsByUser();
          this.toast.success('Statutory Details Added Successfully');
        }, error => {
          this.toast.error('Statutory Details Add Failed');
        })
      } else {
        this.userService.updateStatutoryDetails(res.data[0]._id, this.statutoryDetailsForm.value).subscribe((res: any) => {
          this.getStatutoryDetailsByUser();
          this.toast.success('Statutory Details Updated Successfully');
        }, error => {
          this.toast.error('Statutory Details Update Failed');
        })
      }
    });
  }
}