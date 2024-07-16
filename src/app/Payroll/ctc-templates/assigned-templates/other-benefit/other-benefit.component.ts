import { Component, Input } from '@angular/core';
import { PayrollService } from 'src/app/_services/payroll.service';

@Component({
  selector: 'app-other-benefit',
  templateUrl: './other-benefit.component.html',
  styleUrl: './other-benefit.component.css'
})
export class OtherBenefitComponent {
  otherBenefits: any;
  @Input() data: any;

  constructor(private payroll: PayrollService) { }

  ngOnInit() {
    this.otherBenefits = this.data.ctcTemplateOtherBenefitAllowance;
    console.log(this.otherBenefits);
    this.getOtherBenefits();
  }

  getOtherBenefits() {
    let payload = {
      next: '',
      skip: ''
    }
    this.payroll.getOtherBenefits(payload).subscribe((res: any) => {
      this.otherBenefits = res.data;
    });
  }

  getOtherBenefit(empContribution: string) {
    const matchingContribution = this.otherBenefits?.find(res => res._id === empContribution);
    return matchingContribution ? matchingContribution.label : '';
  }


}
