import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { PayrollService } from 'src/app/_services/payroll.service';
import * as jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { UserService } from 'src/app/_services/users.service';

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

  constructor(private userService: UserService) { }

  ngOnInit(): void {
    this.calculateTotalPayWithOvertime();
    this.calculateTotals();
  }

  calculateTotals(): void {
    const ps = this.payslip;

    const fixed = ps?.PayrollUser?.totalFixedAllowance || 0;
    const flexi = ps?.PayrollUser?.totalFlexiBenefits || 0;

    this.totalEarnings = fixed + flexi;

    const fixedDeduction = ps?.PayrollUser?.totalFixedDeduction || 0;
    const incomeTax = ps?.PayrollUser?.totalIncomeTax || 0;
    const loanAdvance = ps?.PayrollUser?.totalLoanRepayment || 0;
    this.totalDeductions = fixedDeduction + incomeTax + loanAdvance;
  }

  calculateTotalPayWithOvertime() {
    const lopSalary = parseFloat(this.salaryAfterLOP);
    const totalOvertime = parseFloat(this.payslip?.totalOvertime);
    this.totalPayWithOvertime = (lopSalary + totalOvertime).toFixed(2);
    this.totalPayWithOvertime -= this.payslip?.totalLoanAdvance;
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