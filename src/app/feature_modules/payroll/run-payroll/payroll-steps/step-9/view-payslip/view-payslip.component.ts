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
  companyName: string = '';
  companyLocation: string = '';
  payDate: Date = new Date();
  grossEarnings: number = 0;
  totalDeductions: number = 0;
  amountInWords: string = '';
  earningsArray: any[] = [];
  deductionsArray: any[] = [];

  constructor() { }

  ngOnInit() {
    console.log(this.viewPayroll);
    this.getCompanyDetails();
    this.calculateSalaryAfterLOP();
    this.calculateGrossEarnings();
    this.calculateTotalDeductions();
    this.prepareEarningsAndDeductions();
    this.calculateNetSalary();
    this.calculateTotalPayWithOvertime();
    this.convertAmountToWords();
  }

  getCompanyDetails() {
    this.companyName = this.getCompanyNameFromCookies() || 'Company Name';
    this.companyLocation = 'India';
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

  calculateGrossEarnings() {
    this.grossEarnings =
      Number(this.viewPayroll?.totalFixedAllowance || 0) +
      Number(this.viewPayroll?.totalVariableAllowance || 0) +
      Number(this.viewPayroll?.totalFlexiBenefits || 0) +
      Number(this.viewPayroll?.totalOtherBenefit || 0) +
      Number(this.viewPayroll?.totalOvertime || 0);
  }

  calculateTotalDeductions() {
    this.totalDeductions =
      Number(this.viewPayroll?.totalFixedDeduction || 0) +
      Number(this.viewPayroll?.totalVariableDeduction || 0) +
      Number(this.viewPayroll?.totalEmployeeStatutoryDeduction || 0) +
      Number(this.viewPayroll?.totalIncomeTax || 0) +
      Number(this.viewPayroll?.totalLoanRepayment || 0) +
      Number(this.viewPayroll?.totallopDaysAmount || 0);
  }

  prepareEarningsAndDeductions(): void {
    this.earningsArray = [];
    this.deductionsArray = [];

    // Prepare earnings - use aggregate values since viewPayroll doesn't have itemized lists
    if (this.viewPayroll?.totalFixedAllowance) {
      this.earningsArray.push({
        label: 'Fixed Allowance + Basic',
        amount: this.viewPayroll.totalFixedAllowance || 0,
        ytd: this.viewPayroll.totalFixedAllowanceYTD || 0
      });
    }

    if (this.viewPayroll?.totalVariableAllowance) {
      this.earningsArray.push({
        label: 'Variable Allowance',
        amount: this.viewPayroll.totalVariableAllowance || 0,
        ytd: this.viewPayroll.totalVariableAllowanceYTD || 0
      });
    }

    if (this.viewPayroll?.totalFlexiBenefits) {
      this.earningsArray.push({
        label: 'Flexi Benefits',
        amount: this.viewPayroll.totalFlexiBenefits || 0,
        ytd: this.viewPayroll.totalFlexiBenefitsYTD || 0
      });
    }

    if (this.viewPayroll?.totalOtherBenefit) {
      this.earningsArray.push({
        label: 'Other Benefits',
        amount: this.viewPayroll.totalOtherBenefit || 0,
        ytd: this.viewPayroll.totalOtherBenefitYTD || 0
      });
    }

    // Always show overtime even if 0
    this.earningsArray.push({
      label: 'Overtime',
      amount: this.viewPayroll?.totalOvertime || 0,
      ytd: this.viewPayroll?.totalOvertimeYTD || 0
    });

    // Prepare deductions
    if (this.viewPayroll?.totalFixedDeduction) {
      this.deductionsArray.push({
        label: 'Fixed Deductions',
        amount: this.viewPayroll.totalFixedDeduction || 0,
        ytd: this.viewPayroll.totalFixedDeductionYTD || 0
      });
    }

    if (this.viewPayroll?.totalVariableDeduction) {
      this.deductionsArray.push({
        label: 'Variable Deductions',
        amount: this.viewPayroll.totalVariableDeduction || 0,
        ytd: this.viewPayroll.totalVariableDeductionYTD || 0
      });
    }

    if (this.viewPayroll?.totalEmployeeStatutoryDeduction) {
      this.deductionsArray.push({
        label: 'Employee Statutory',
        amount: this.viewPayroll.totalEmployeeStatutoryDeduction || 0,
        ytd: this.viewPayroll.totalEmployeeStatutoryDeductionYTD || 0
      });
    }

    if (this.viewPayroll?.totalIncomeTax) {
      this.deductionsArray.push({
        label: 'Income Tax / TDS',
        amount: this.viewPayroll.totalIncomeTax || 0,
        ytd: this.viewPayroll.totalIncomeTaxYTD || 0
      });
    }

    if (this.viewPayroll?.totalLoanRepayment) {
      this.deductionsArray.push({
        label: 'Loan Repayment',
        amount: this.viewPayroll.totalLoanRepayment || 0,
        ytd: this.viewPayroll.totalLoanRepaymentYTD || 0
      });
    }

    // Always show LOP even if 0
    this.deductionsArray.push({
      label: 'LOP Deduction',
      amount: this.viewPayroll?.totallopDaysAmount || 0,
      ytd: this.viewPayroll?.totallopDaysAmountYTD || 0
    });

    // Balance arrays if needed
    const maxLength = Math.max(this.earningsArray.length, this.deductionsArray.length);
    while (this.earningsArray.length < maxLength) {
      this.earningsArray.push({ label: '', amount: 0, ytd: 0 });
    }
    while (this.deductionsArray.length < maxLength) {
      this.deductionsArray.push({ label: '', amount: 0, ytd: 0 });
    }
  }

  calculateNetSalary() {
    // Calculate net salary from earnings minus deductions
    this.netSalary = this.grossEarnings - this.totalDeductions;
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
    this.totalPayWithOvertime -= (this.viewPayroll?.totalLoanRepayment || 0);
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