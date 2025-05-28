import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import * as jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-generate-payslips',
  templateUrl: './generate-payslips.component.html',
  styleUrl: './generate-payslips.component.css'
})
export class GeneratePayslipsComponent {
  @Output() close = new EventEmitter<void>();
  totalPayWithOvertime: any;
  salaryAfterLOP: string;
  totalEarnings: number = 0;
  totalDeductions: number = 0;
  @Input() payslip: any;
  userJobInformation: any;
  statutoryDeductions: any;
  employerContributions: any;
  @ViewChild('payslipContainer') payslipContainer: ElementRef;

  constructor() { }

  ngOnInit(): void {
    this.calculateTotals();
  }

  calculateTotals(): void {
    const ps = this.payslip;

    // Calculate total earnings
    const fixed = ps?.PayrollUser?.totalFixedAllowance || 0;
    const flexi = ps?.PayrollUser?.totalFlexiBenefits || 0;
    const variable = ps?.PayrollUser?.totalVariableAllowance || 0;
    const finalOvertime = ps?.latestOvertime?.OvertimeAmount || 0;

    // Sum amounts for Disbursement loans
    const loanDisbursement = Array.isArray(ps?.allLoanAdvances)
      ? ps.allLoanAdvances.reduce((sum: number, loan: any) => {
        return loan.type === 'Disbursement' ? sum + (loan.amount || 0) : sum;
      }, 0)
      : 0;
    const totalArrears = Array.isArray(ps?.manualArrears)
      ? ps.manualArrears.reduce((sum: number, arrears: any) => {
        return sum + (arrears.amount || 0);
      }, 0)
      : 0;

    this.totalEarnings = fixed + flexi + variable + finalOvertime + loanDisbursement + totalArrears;

    // Calculate total deductions
    const fixedDeduction = ps?.PayrollUser?.totalFixedDeduction || 0;
    const variableDeduction = ps?.PayrollUser?.totalVariableDeduction || 0;
    const incomeTax = ps?.tdsCalculated || 0;

    // Sum amounts for Repayment loans
    const loanRepayment = Array.isArray(ps?.allLoanAdvances)
      ? ps.allLoanAdvances.reduce((sum: number, loan: any) => {
        return loan.type === 'Repayment' ? sum + (loan.amount || 0) : sum;
      }, 0)
      : 0;

    console.log(fixedDeduction, variableDeduction, incomeTax, loanRepayment);
    this.totalDeductions = fixedDeduction + variableDeduction + incomeTax + loanRepayment;
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
    html2canvas(element).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF.default('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('payslip.pdf');
    });
  }
}