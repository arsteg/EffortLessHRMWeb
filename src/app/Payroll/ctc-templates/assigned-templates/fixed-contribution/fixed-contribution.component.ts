import { Component, Input } from '@angular/core';
import { PayrollService } from 'src/app/_services/payroll.service';

@Component({
  selector: 'app-assigned-fixed-contribution',
  templateUrl: './fixed-contribution.component.html',
  styleUrl: './fixed-contribution.component.css'
})
export class AssignedFixedContributionComponent {
  employerContributions: any;
  @Input() data: any;

  constructor(private payroll: PayrollService) { }

  ngOnInit() {
    this.employerContributions = this.data.ctcTemplateEmployerContribution;
    this.getEmployerContribution();
  }

  getEmployerContribution() {
    let payload = {
      next: '',
      skip: ''
    }
    this.payroll.getFixedContribution(payload).subscribe((res: any) => {
      this.employerContributions = res.data;
    });
  }

  getContribution(empContribution: string) {
    const matchingContribution = this.employerContributions?.find(res => res._id === empContribution);
    return matchingContribution ? matchingContribution.label : '';
  }


}
