import { Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';
import { PayrollService } from 'src/app/_services/payroll.service';
import * as jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-generate-payslips',
  templateUrl: './generate-payslips.component.html',
  styleUrl: './generate-payslips.component.css'
})
export class GeneratePayslipsComponent {
  @Output() close = new EventEmitter<void>();
  payslip: any;
  totalPayWithOvertime: any;
  salaryAfterLOP: string;

  @ViewChild('payslipContainer') payslipContainer: ElementRef;

  constructor(private payrollService: PayrollService) {
    this.payrollService.payslip.subscribe((data: any) => {
      this.payslip = data;
      this.calculateSalaryAfterLOP();
      this.calculateTotalPayWithOvertime();
    });
  }

  calculateSalaryAfterLOP() {
    const monthlySalary = this.payslip.monthlySalary;
    const totalDays = this.payslip?.attendanceSummary[0].totalDays;
    const payableDays = this.payslip?.attendanceSummary[0]?.payableDays;
    const perDayPay = monthlySalary / totalDays;
    const lopSalary = perDayPay * payableDays;
    this.salaryAfterLOP = lopSalary.toFixed(2);
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