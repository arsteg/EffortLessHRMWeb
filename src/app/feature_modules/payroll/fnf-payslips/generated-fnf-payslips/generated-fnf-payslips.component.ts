import { Component, ElementRef, EventEmitter, Output, ViewChild, Input } from '@angular/core';
import * as jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { CompanyService } from 'src/app/_services/company.service';

@Component({
  selector: 'app-generated-fnf-payslips',
  templateUrl: './generated-fnf-payslips.component.html',
  styleUrls: ['./generated-fnf-payslips.component.css']
})

export class GeneratedFnfPayslipsComponent {
  @Output() close = new EventEmitter<void>();
  @Input() payslip: any;
  totalPayWithOvertime: any;
  salaryAfterLOP: string;
  totalEarnings: number = 0;
  totalDeductions: number = 0;
  netSalary: number = 0;
  amountInWords: string = '';
  payDate: Date = new Date();
  earningsArray: any[] = [];
  deductionsArray: any[] = [];
  companyName: string = '';
  companyLocation: string = '';
  employeeStatutoryTotal: number = 0;
  employerStatutoryTotal: number = 0;

  @ViewChild('payslipContainer') payslipContainer: ElementRef;
  companyInfo: any;

  constructor(
    private companyService: CompanyService
  ) {
    this.companyService.getCompanies().subscribe((res: any) => {
      this.companyInfo = res.data.find((item) => item._id === this.payslip.payroll.company);
    })
  }

  ngOnInit(): void {
    this.getCompanyDetails();
    this.calculateTotals();
    this.prepareEarningsAndDeductions();
    this.calculateNetSalary();
    this.convertAmountToWords();
   }

  getCompanyDetails() {
    this.companyName = this.getCompanyNameFromCookies() || 'Company Name';
    this.companyLocation = 'India';
  }

  calculateTotals(): void {
    const ps = this.payslip;

    // Calculate earnings - using same field names as view-fnf-payslip
    const fixed = ps?.totalFixedAllowance || 0;
    const variable = ps?.totalVariableAllowance || 0;
    const overtime = ps?.totalOvertime || 0;  // Changed from latestOvertime.OvertimeAmount
    const flexi = ps?.totalFlexiBenefits || 0;
    const other = ps?.totalOtherBenefit || 0;
    const manualArrears = ps?.manualArrears?.totalArrears || 0;
    const compensationPay = ps?.compensation?.outplacementServicePay || 0;
    const pfAmount = ps?.statutoryBenefits?.ProvidentFundAmount || 0;

    this.totalEarnings = fixed + variable + overtime + flexi + other + manualArrears + compensationPay + pfAmount;

    // Calculate deductions - using same field names as view-fnf-payslip
    const fixedDeduction = ps?.totalFixedDeduction || 0;
    const variableDeduction = ps?.totalVariableDeduction || 0;
    const incomeTax = ps?.totalIncomeTax || ps?.incomeTax?.TaxCalculated || 0;
    const tds = ps?.incomeTax?.TDSCalculated || 0;
    const loanAdvance = ps?.totalLoanAdvance || 0;
    const lopAmount = ps?.totalLopAmount || ps?.lopAmount || 0;  // Try multiple field names

    this.totalDeductions = fixedDeduction + variableDeduction + incomeTax + tds + loanAdvance + lopAmount;

    // Add statutory deductions (Employee contributions)
    if (ps?.statutoryDetails?.length) {
      this.employeeStatutoryTotal = ps.statutoryDetails
        .filter(s => s.ContributorType === 'Employee')
        .reduce((sum, s) => sum + (s.amount || 0), 0);

      this.employerStatutoryTotal = ps.statutoryDetails
        .filter(s => s.ContributorType === 'Employer')
        .reduce((sum, s) => sum + (s.amount || 0), 0);

      this.totalDeductions += this.employeeStatutoryTotal;
    }
  }

  prepareEarningsAndDeductions(): void {
    const ps = this.payslip;
    this.earningsArray = [];
    this.deductionsArray = [];

    // Prepare earnings
    if (ps?.fixedAllowancesList?.length) {
      ps.fixedAllowancesList.forEach((item: any) => {
        this.earningsArray.push({
          label: item.fixedAllowance?.label,
          amount: item.amount || 0,
          ytd: item.amountYTD || 0
        });
      });
    }

    if (ps?.variableAllowancesList?.length) {
      ps.variableAllowancesList.forEach((item: any) => {
        this.earningsArray.push({
          label: item.variableAllowance?.label,
          amount: item.amount || 0,
          ytd: item.amountYTD || 0
        });
      });
    }

    // Always show overtime even if 0 - using totalOvertime field
    this.earningsArray.push({
      label: 'Overtime',
      amount: ps?.totalOvertime || 0,
      ytd: ps?.totalOvertimeYTD || 0
    });

    if (ps?.manualArrears?.totalArrears) {
      this.earningsArray.push({
        label: 'Manual Arrears',
        amount: ps.manualArrears.totalArrears || 0,
        ytd: ps.manualArrears.totalArrearsYTD || 0
      });
    }

    if (ps?.compensation?.outplacementServicePay) {
      this.earningsArray.push({
        label: ps.compensation.outplacementServices || 'Compensation',
        amount: ps.compensation.outplacementServicePay || 0,
        ytd: 0
      });
    }

    if (ps?.statutoryBenefits?.ProvidentFundAmount) {
      this.earningsArray.push({
        label: ps.statutoryBenefits.ProvidentFundPaymentProcess || 'PF Payment',
        amount: ps.statutoryBenefits.ProvidentFundAmount || 0,
        ytd: 0
      });
    }

    // Prepare deductions
    if (ps?.fixedDeductionsList?.length) {
      ps.fixedDeductionsList.forEach((item: any) => {
        this.deductionsArray.push({
          label: item.fixedDeduction?.label,
          amount: item.amount || 0,
          ytd: item.amountYTD || 0
        });
      });
    }

    if (ps?.variableDeductionsList?.length) {
      ps.variableDeductionsList.forEach((item: any) => {
        this.deductionsArray.push({
          label: item.variableDeduction?.label,
          amount: item.amount || 0,
          ytd: item.amountYTD || 0
        });
      });
    }

    if (ps?.incomeTax?.TaxCalculated) {
      this.deductionsArray.push({
        label: 'Income Tax',
        amount: ps.incomeTax.TaxCalculated || 0,
        ytd: 0
      });
    }

    if (ps?.incomeTax?.TDSCalculated) {
      this.deductionsArray.push({
        label: 'TDS',
        amount: ps.incomeTax.TDSCalculated || 0,
        ytd: 0
      });
    }

    if (ps?.totalLoanAdvance) {
      this.deductionsArray.push({
        label: 'Loan/Advance',
        amount: ps.totalLoanAdvance || 0,
        ytd: 0
      });
    }

    if (ps?.statutoryDetails?.length) {
      ps.statutoryDetails.forEach((statutory: any) => {
        if (statutory.ContributorType === 'Employee') {
          this.deductionsArray.push({
            label: statutory.StautoryName,
            amount: statutory.amount || 0,
            ytd: 0
          });
        }
      });
    }

    // Always show LOP deduction - try multiple field names
    this.deductionsArray.push({
      label: 'LOP Deduction',
      amount: ps?.totalLopAmount || ps?.lopAmount || 0,
      ytd: ps?.totalLopAmountYTD || ps?.lopAmountYTD || 0
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

  calculateNetSalary(): void {
    this.netSalary = this.totalEarnings - this.totalDeductions;
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

  downloadPDF() {
    const element = this.payslipContainer.nativeElement;

    html2canvas(element, { scale: 2, }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF.default('p', 'mm', 'a4');

      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      const pageHeight = pdf.internal.pageSize.getHeight();
      let position = 0;

      // Handle multi-page logic
      if (pdfHeight <= pageHeight) {
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      } else {
        let heightLeft = pdfHeight;

        while (heightLeft > 0) {
          pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
          heightLeft -= pageHeight;
          position -= pageHeight;

          if (heightLeft > 0) {
            pdf.addPage();
          }
        }
      }

      pdf.save('payslip.pdf');
    });
  }

}