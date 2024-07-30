import { Component, Input } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { UserService } from 'src/app/_services/users.service';

@Component({
  selector: 'app-statutory-details',
  templateUrl: './statutory-details.component.html',
  styleUrl: './statutory-details.component.css'
})
export class StatutoryDetailsComponent {
  statutoryDetailsForm: FormGroup;
  @Input() selectedUser: any;

  constructor(private fb: FormBuilder,
    private userService: UserService
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

  ngOnInit() { }

  onSubmission() {
    this.statutoryDetailsForm.value.user = this.selectedUser.id;
    console.log(this.statutoryDetailsForm.value);
    this.userService.addStatutoryDetails(this.statutoryDetailsForm.value).subscribe((res: any) => {
      console.log(res.data);
    })
  }
}
