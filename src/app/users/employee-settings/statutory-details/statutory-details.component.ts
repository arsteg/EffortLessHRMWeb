import { Component, Input } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { error } from 'console';
import { ToastrService } from 'ngx-toastr';
import { UserService } from 'src/app/_services/users.service';

@Component({
  selector: 'app-statutory-details',
  templateUrl: './statutory-details.component.html',
  styleUrl: './statutory-details.component.css'
})
export class StatutoryDetailsComponent {
  statutoryDetailsForm: FormGroup;
  selectedUser = this.userService.getData();

  constructor(private fb: FormBuilder,
    private userService: UserService,
    private toast: ToastrService
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
      taxRegime: [true],
      taxRegimeUpdated: [],
      taxRegimeUpdatedBy: [''],
      roundOffApplicable: [true],
      dailyWageApplicable: [true],
      eligibleForOvertime: [true]
    })
  }

  ngOnInit() {
    this.getStatutoryDetailsByUser();
  }

  getStatutoryDetailsByUser() {
    this.userService.getStatutoryByUserId(this.selectedUser.id).subscribe((res: any) => {
      this.statutoryDetailsForm.patchValue(res.data[0]);
    });

  }
  onSubmission() {
    this.statutoryDetailsForm.value.user = this.selectedUser.id;
    this.userService.getStatutoryByUserId(this.selectedUser.id).subscribe((res: any) => {
      if (res.data < 0) {
        this.userService.addStatutoryDetails(this.statutoryDetailsForm.value).subscribe((res: any) => {
          this.getStatutoryDetailsByUser();
          this.toast.success('Statutory Details Added Successfully');
        },
      error=>{
        this.toast.error('Statutory Details Add Failed');
      })
      }
      else {
        this.userService.updateStatutoryDetails(res.data[0]._id, this.statutoryDetailsForm.value).subscribe((res: any) => {
          this.getStatutoryDetailsByUser();
          this.toast.success('Statutory Details Updated Successfully');
        },
          error => {
            this.toast.error('Statutory Details Update Failed');
          })
      }
    });
  }
}
