import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import * as jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { CompanyService } from 'src/app/_services/company.service';

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
  companyInfo: any;

  constructor(
    private companyService: CompanyService
  ) {
    this.companyService.getCompanies().subscribe((res: any) => {
      this.companyInfo = res.data.find((item)=> item._id === this.payslip.PayrollUser.company._id)
    })
  }

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
    const fixedDeduction = ps?.totalFixedDeduction || 0;
    const variableDeduction = ps?.totalVariableDeduction || 0;
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

    html2canvas(element, { scale: 2, useCORS: true, allowTaint: true }).then((canvas) => {
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