import { Component, Input } from '@angular/core';
import { PayrollService } from 'src/app/_services/payroll.service';

@Component({
  selector: 'app-employee-deduction',
  templateUrl: './employee-deduction.component.html',
  styleUrl: './employee-deduction.component.css'
})
export class EmployeeDeductionComponent {
  employeeDeduction: any;
  @Input() data: any;

  constructor(private payroll: PayrollService) { }

  ngOnInit() {
    this.employeeDeduction = this.data.ctcTemplateEmployeeDeduction;
    this.getEmployeeDeduction();
  }

  getEmployeeDeduction() {
    let payload = {
      next: '',
      skip: ''
    }
    this.payroll.getFixedContribution(payload).subscribe((res: any) => {
      this.employeeDeduction = res.data;
    });
  }

  getEmpDeduction(empContribution: string) {
    const matchingContribution = this.employeeDeduction?.find(res => res._id === empContribution);
    return matchingContribution ? matchingContribution.label : '';
  }
}
