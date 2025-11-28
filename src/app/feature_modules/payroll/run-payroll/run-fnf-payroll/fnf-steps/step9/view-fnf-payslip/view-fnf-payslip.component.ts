import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { PayrollService } from 'src/app/_services/payroll.service';
import { UserService } from 'src/app/_services/users.service';

@Component({
  selector: 'app-view-fnf-payslip',
  templateUrl: './view-fnf-payslip.component.html',
  styleUrl: './view-fnf-payslip.component.css'
})
export class ViewFnfPayslipComponent {
  @Output() close = new EventEmitter<void>();
  payslip: any;
  @Input() viewPayroll: any;
  @Input() selectedPayroll: any;
  totalPayWithOvertime: any;
  salaryAfterLOP: string;
  totalEarnings: number = 0;
  totalDeductions: number = 0;

  @ViewChild('payslipContainer') payslipContainer: ElementRef;

  constructor(private userService: UserService) { }

  ngOnInit(): void {
    console.log(this.selectedPayroll);
    this.getUserDetails();
    this.calculateSalaryAfterLOP();
    this.calculateTotalPayWithOvertime();
    this.calculateTotals();
  }

  calculateTotals(): void {
    const ps = this.viewPayroll;
    const fixed = ps?.totalFixedAllowance || 0;
    const variable = ps?.totalVariableAllowance || 0;
    const overtime = ps?.totalOvertime || 0;
    const flexi = ps?.totalFlexiBenefits || 0;
    const other = ps?.totalOtherBenefit || 0;
    const totalArrears = ps?.manualArrears?.totalArrears || 0;

    const fixedDeduction = ps?.totalFixedDeduction || 0;
    const incomeTax = ps?.totalIncomeTax || 0;
    const loanAdvance = ps?.totalLoanAdvance || 0;
    const variableDeduction = ps?.totalVariableDeduction || 0;

    this.totalEarnings = fixed + variable + overtime + flexi + other + totalArrears;
    this.totalDeductions = fixedDeduction + incomeTax + loanAdvance + variableDeduction;

    if (ps?.statutoryDetails?.length) {
      const employeeContribs = ps.statutoryDetails
        .filter(s => s.ContributorType === 'Employee')
        .reduce((sum, s) => sum + (s.amount || 0), 0);
      this.totalDeductions += employeeContribs;
    }
  }

  calculateSalaryAfterLOP() {
    const monthlySalary = this.viewPayroll?.monthlySalary;
    const totalDays = this.viewPayroll?.attendanceSummary[0]?.totalDays;
    const payableDays = this.viewPayroll?.attendanceSummary[0]?.payableDays;
    const perDayPay = monthlySalary / totalDays;
    const lopSalary = perDayPay * payableDays;
    this.salaryAfterLOP = lopSalary.toFixed(2);
  }

  calculateTotalPayWithOvertime() {
    const lopSalary = parseFloat(this.salaryAfterLOP);
    const totalOvertime = parseFloat(this.viewPayroll?.totalOvertime);
    this.totalPayWithOvertime = (lopSalary + totalOvertime).toFixed(2);
    this.totalPayWithOvertime -= this.viewPayroll?.totalLoanAdvance;
  }

  getUserDetails() {
    // this.userService.getJobInformationByUserId(this.viewPayroll?.PayrollUser?.user?.id).subscribe((res: any) => {
    //   this.viewPayroll.user = res;
    // });
  }

  getCompanyNameFromCookies(): string | null {
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [key, value] = cookie.split('=').map(c => c.trim());
      if (key === 'companyName') {
        return decodeURIComponent(value);
      }
    }
    return null;
  }


}