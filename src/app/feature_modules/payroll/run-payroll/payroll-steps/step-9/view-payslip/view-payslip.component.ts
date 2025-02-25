import { Component, Input } from '@angular/core';
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
  totalPayWithOvertime: any;

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
    this.totalPayWithOvertime -= (this.viewPayroll?.totalLoanAdvance);
  }
}