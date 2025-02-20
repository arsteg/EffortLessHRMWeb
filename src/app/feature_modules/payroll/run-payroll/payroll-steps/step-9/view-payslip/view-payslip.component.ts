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
  totalPayWithOvertime: string;

  constructor() { }
  ngOnInit() {
    this.calculateSalaryAfterLOP();
    this.netSalary =
    Number(this.viewPayroll?.totalFixedAllowance) + Number(this.viewPayroll?.totalOvertime + Number(this.viewPayroll?.totalFlexiBenefits)) -
    (Number(this.viewPayroll?.totalFixedDeduction) + Number(this.viewPayroll?.totalPfTax) + Number(this.viewPayroll?.totalIncomeTax));
  
    this.calculateTotalPayWithOvertime();
  }

  calculateSalaryAfterLOP() {
    const monthlySalary = this.viewPayroll.monthlySalary;
    const totalDays = this.viewPayroll?.attendanceSummary[0].totalDays;
    const payableDays = this.viewPayroll?.attendanceSummary[0]?.payableDays;
    const perDayPay = monthlySalary / totalDays;
    const lopSalary = perDayPay * payableDays;
    this.salaryAfterLOP = lopSalary.toFixed(2);
  }

  calculateTotalPayWithOvertime() {
    const lopSalary = parseFloat(this.salaryAfterLOP);
    const totalOvertime = parseFloat(this.viewPayroll?.totalOvertime);
    this.totalPayWithOvertime = (lopSalary + totalOvertime).toFixed(2);
  }
}