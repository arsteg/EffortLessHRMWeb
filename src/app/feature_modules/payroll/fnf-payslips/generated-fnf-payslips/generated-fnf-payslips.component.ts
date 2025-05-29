import { Component, ElementRef, EventEmitter, Output, ViewChild, Input } from '@angular/core';
import * as jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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

  @ViewChild('payslipContainer') payslipContainer: ElementRef;

  constructor() { }

  ngOnInit(): void { }

  calculateTotals(): void {
    const ps = this.payslip;

    // Ensure all values are numbers, defaulting to 0
    const fixed = ps?.totalFixedAllowance || 0;
    const variable = ps?.totalVariableAllowance || 0;
    const overtime = ps?.totalOvertime || 0;
    const flexi = ps?.totalFlexiBenefits || 0;
    const other = ps?.totalOtherBenefit || 0;

    const fixedDeduction = ps?.totalFixedDeduction || 0;

    const incomeTax = ps?.totalIncomeTax || 0;
    const loanRepayment = ps?.totalLoanRepayment || 0;

    this.totalEarnings = fixed + variable + overtime + flexi + other;
    this.totalDeductions = fixedDeduction + incomeTax + loanRepayment;

    // Optionally, add statutory deductions (ContributorType === 'Employee')
    if (ps?.statutoryDetails?.length) {
      const employeeContribs = ps.statutoryDetails
        .filter(s => s.ContributorType === 'Employee')
        .reduce((sum, s) => sum + (s.amount || 0), 0);
      this.totalDeductions += employeeContribs;
    }
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