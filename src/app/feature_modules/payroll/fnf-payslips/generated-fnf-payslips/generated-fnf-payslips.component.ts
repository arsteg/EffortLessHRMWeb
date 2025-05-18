import { Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';
import { PayrollService } from 'src/app/_services/payroll.service';
import * as jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { UserService } from 'src/app/_services/users.service';

@Component({
  selector: 'app-generated-fnf-payslips',
  templateUrl: './generated-fnf-payslips.component.html',
  styleUrl: './generated-fnf-payslips.component.css'
})
export class GeneratedFnfPayslipsComponent {
  @Output() close = new EventEmitter<void>();
  payslip: any;
  totalPayWithOvertime: any;
  salaryAfterLOP: string;
  totalEarnings: number = 0;
  totalDeductions: number = 0;

  @ViewChild('payslipContainer') payslipContainer: ElementRef;

  constructor(private payrollService: PayrollService,
    private userService: UserService) {
    this.payrollService.payslip.subscribe((data: any) => {
      this.payslip = data;
      console.log(this.payslip)
      this.calculateSalaryAfterLOP();
      this.calculateTotalPayWithOvertime();
      this.calculateTotals();
    });
  }


  ngOnInit(): void {
    this.getUserDetails();
  }

  calculateTotals(): void {
    const ps = this.payslip;

    // Ensure all values are numbers, defaulting to 0
    const fixed = ps?.totalFixedAllowance || 0;
    const variable = ps?.totalVariableAllowance || 0;
    const overtime = ps?.totalOvertime || 0;
    const flexi = ps?.totalFlexiBenefits || 0;
    const other = ps?.totalOtherBenefit || 0;

    const fixedDeduction = ps?.totalFixedDeduction || 0;
    const pfTax = ps?.totalPfTax || 0;
    const incomeTax = ps?.totalIncomeTax || 0;
    const loanAdvance = ps?.totalLoanAdvance || 0;

    this.totalEarnings = fixed + variable + overtime + flexi + other;
    this.totalDeductions = fixedDeduction + pfTax + incomeTax + loanAdvance;

    // Optionally, add statutory deductions (ContributorType === 'Employee')
    if (ps?.statutoryDetails?.length) {
      const employeeContribs = ps.statutoryDetails
        .filter(s => s.ContributorType === 'Employee')
        .reduce((sum, s) => sum + (s.amount || 0), 0);
      this.totalDeductions += employeeContribs;
    }
  }

  calculateSalaryAfterLOP() {
    const monthlySalary = this.payslip.monthlySalary;
    const totalDays = this.payslip?.attendanceSummary[0]?.totalDays;
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

  getUserDetails() {
    this.userService.getJobInformationByUserId(this.payslip?.PayrollUser?._id).subscribe((res: any) => {
      this.payslip.user = res;
    });
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