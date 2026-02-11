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
  companyName: string = '';
  companyLocation: string = '';
  payDate: Date = new Date();
  netSalary: number = 0;
  amountInWords: string = '';
  employeeStatutoryTotal: number = 0;
  employerStatutoryTotal: number = 0;
  employeeStatutoryTotalYTD: number = 0;
  employerStatutoryTotalYTD: number = 0;

  @ViewChild('payslipContainer') payslipContainer: ElementRef;

  constructor(private userService: UserService) { }

  ngOnInit(): void {
    this.getCompanyDetails();
    this.getUserDetails();
    this.calculateSalaryAfterLOP();
    this.calculateTotalPayWithOvertime();
    this.calculateTotals();
    this.calculateStatutoryTotals();
    this.calculateNetSalary();
    this.convertAmountToWords();
  }

  getCompanyDetails() {
    this.companyName = this.getCompanyNameFromCookies() || 'Company Name';
    this.companyLocation = 'India';
  }

  calculateStatutoryTotals(): void {
    if (this.viewPayroll?.statutoryDetails?.length) {
      this.employeeStatutoryTotal = this.viewPayroll.statutoryDetails
        .filter(s => s.ContributorType === 'Employee')
        .reduce((sum, s) => sum + (s.amount || 0), 0);

      this.employerStatutoryTotal = this.viewPayroll.statutoryDetails
        .filter(s => s.ContributorType === 'Employer')
        .reduce((sum, s) => sum + (s.amount || 0), 0);

      this.employeeStatutoryTotalYTD = this.employeeStatutoryTotal;
      this.employerStatutoryTotalYTD = this.employerStatutoryTotal;
    }
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

  calculateNetSalary(): void {
    // Calculate net salary from earnings minus deductions
    this.netSalary = this.totalEarnings - this.totalDeductions;
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

  convertAmountToWords() {
    const amount = Math.floor(this.netSalary);
    this.amountInWords = this.numberToWords(amount) + ' Only';
  }

  numberToWords(num: number): string {
    if (num === 0) return 'Zero';

    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    const convert = (n: number): string => {
      if (n < 10) return ones[n];
      if (n >= 10 && n < 20) return teens[n - 10];
      if (n >= 20 && n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : '');
      if (n >= 100 && n < 1000) return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' ' + convert(n % 100) : '');
      return '';
    };

    if (num < 1000) {
      return convert(num);
    }

    const crore = Math.floor(num / 10000000);
    const lakh = Math.floor((num % 10000000) / 100000);
    const thousand = Math.floor((num % 100000) / 1000);
    const remainder = num % 1000;

    let result = '';

    if (crore > 0) {
      result += convert(crore) + ' Crore ';
    }
    if (lakh > 0) {
      result += convert(lakh) + ' Lakh ';
    }
    if (thousand > 0) {
      result += convert(thousand) + ' Thousand ';
    }
    if (remainder > 0) {
      result += convert(remainder);
    }

    return result.trim();
  }

}