import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { AuthenticationService } from 'src/app/_services/authentication.service';
import { PayrollService } from 'src/app/_services/payroll.service';

@Component({
  selector: 'app-view-payslip',
  templateUrl: './view-payslip.component.html',
  styleUrl: './view-payslip.component.css'
})
export class ViewPayslipComponent {
  @Input() viewPayroll: any;
  @Input() selectedPayroll: any;
  userProfile: any;
  attendanceSummary: any;
  salaryAfterLOP: string;
  netSalary: any;


  constructor() { }
  ngOnInit() {
    this.calculateSalaryAfterLOP();
    this.netSalary =
    Number(this.viewPayroll?.totalFixedAllowance) + Number(this.viewPayroll?.totalOvertime + Number(this.viewPayroll?.totalFlexiBenefits)) -
    (Number(this.viewPayroll?.totalFixedDeduction) + Number(this.viewPayroll?.totalPfTax) + Number(this.viewPayroll?.totalIncomeTax));
  
    console.log(this.netSalary)
  }

  calculateSalaryAfterLOP() {
    const monthlySalary = this.viewPayroll.monthlySalary;
    const totalDays = this.viewPayroll?.attendanceSummary[0].totalDays;
    const payableDays = this.viewPayroll?.attendanceSummary[0]?.payableDays;
    const perDayPay = monthlySalary / totalDays;
    const lopSalary = perDayPay * payableDays;
    this.salaryAfterLOP = lopSalary.toFixed(2);
  }
}