import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import * as jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { CompanyService } from 'src/app/_services/company.service';
import { LeaveService } from 'src/app/_services/leave.service';

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
  totalDeductionsWithStatutory: number = 0;
  @Input() payslip: any;
  userJobInformation: any;
  statutoryDeductions: any;
  employerContributions: any;
  @ViewChild('payslipContainer') payslipContainer: ElementRef;
  companyInfo: any;
  netSalary: number = 0;
  amountInWords: string = '';
  payDate: Date = new Date();
  earningsArray: any[] = [];
  deductionsArray: any[] = [];

  displayLeaveBalanceInPayslip: boolean;
  isLeaveBalanceAllowedToShow: boolean;


  constructor(
    private companyService: CompanyService,
    private leaveService: LeaveService
  ) {
    this.companyService.getCompanies().subscribe((res: any) => {
      this.companyInfo = res.data.find((item) => item._id === this.payslip.PayrollUser.company._id)
    })
  }

  ngOnInit(): void {
    this.getLeaveBalance();
    this.calculateTotals();
    this.prepareEarningsAndDeductions();
    this.calculateNetSalary();
    this.convertAmountToWords();
  }

  getLeaveBalance() {
    let payload = {
      skip: '',
      next: ''
    };

    this.leaveService.getLeaveBalanceByCompany(payload).subscribe((res: any) => {
      const fetchDetailsByUserId = res.data.find((item: any) => item?.employee === this.payslip?.PayrollUser?.user?._id);
      this.leaveService.getLeaveCategorById(fetchDetailsByUserId?.category).subscribe((categoryRes: any) => {
        this.isLeaveBalanceAllowedToShow = categoryRes.data?.displayLeaveBalanceInPayslip;
      });
      if (fetchDetailsByUserId && fetchDetailsByUserId.leaveRemaining) {
        this.payslip.leaveBalances = fetchDetailsByUserId.leaveRemaining;
      } else {
        this.payslip.leaveBalances = [];
      }
    });
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

    // Get LOP amount from attendance
    const lopAmount = ps?.totallopDaysAmount || 0;

    this.totalDeductions = fixedDeduction + variableDeduction + incomeTax + loanRepayment;

    // Add statutory deductions
    const employeeStatutory = ps?.PayrollUser?.totalEmployeeStatutoryDeduction || 0;
    this.totalDeductionsWithStatutory = this.totalDeductions + employeeStatutory + lopAmount;
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
          ytd: item.amount*12 || 0
        });
      });
    }

    if (ps?.variableAllowancesList?.length) {
      ps.variableAllowancesList.forEach((item: any) => {
        this.earningsArray.push({
          label: item.variableAllowance?.label,
          amount: item.amount || 0
          //ytd: item.amount*12 || 0
        });
      });
    }

    if (ps?.PayrollUser?.totalFlexiBenefits) {
      this.earningsArray.push({
        label: 'Flexi Benefits',
        amount: ps.PayrollUser.totalFlexiBenefits || 0
        //ytd: ps.PayrollUser.totalFlexiBenefits*12 || 0
      });
    }

    // Always show overtime even if 0
    this.earningsArray.push({
      label: 'Overtime',
      amount: ps?.latestOvertime?.OvertimeAmount || 0
      //ytd: 0
    });

    // Add loan disbursements to earnings
    if (ps?.allLoanAdvances?.length) {
      ps.allLoanAdvances.forEach((loan: any) => {
        if (loan.type === 'Disbursement') {
          this.earningsArray.push({
            label: loan.loanAndAdvance?.loanAdvancesCategory?.name || 'Loan Disbursement',
            amount: loan.disbursementAmount || loan.amount || 0
            //ytd: loan.disbursementAmountYTD || loan.amountYTD || 0
          });
        }
      });
    }

    // Add arrears to earnings
    if (ps?.manualArrears?.length) {
      ps.manualArrears.forEach((arrear: any) => {
        this.earningsArray.push({
          label: `Arrears (${arrear.arrearDays} days)`,
          amount: arrear.totalArrears || arrear.amount || 0
          //ytd: arrear.totalArrearsYTD || 0
        });
      });
    }

    // Prepare deductions
    if (ps?.fixedDeductionsList?.length) {
      ps.fixedDeductionsList.forEach((item: any) => {
        this.deductionsArray.push({
          label: item.fixedDeduction?.label,
          amount: item.amount || 0,
          ytd: item.amount*12 || 0
        });
      });
    }

    if (ps?.variableDeductionsList?.length) {
      ps.variableDeductionsList.forEach((item: any) => {
        this.deductionsArray.push({
          label: item.variableDeduction?.label,
          amount: item.amount || 0
          //ytd: item.amount*12 || 0
        });
      });
    }

    if (ps?.tdsCalculated) {
      this.deductionsArray.push({
        label: 'Income Tax',
        amount: ps.tdsCalculated || 0
        //ytd: ps.tdsCalculated*12 || 0
      });
    }

    // Add loan repayments
    if (ps?.allLoanAdvances?.length) {
      ps.allLoanAdvances.forEach((loan: any) => {
        if (loan.type === 'Repayment') {
          this.deductionsArray.push({
            label: loan.loanAndAdvance?.loanAdvancesCategory?.name || 'Loan Repayment',
            amount: loan.amount || 0
            //ytd: 0
          });
        }
      });
    }

    // Add statutory deductions
    if (ps?.PayrollUser?.totalEmployeeStatutoryDeduction) {
      this.deductionsArray.push({
        label: 'Employee Statutory',
        amount: ps.PayrollUser.totalEmployeeStatutoryDeduction || 0
        //ytd: ps.PayrollUser.totalEmployeeStatutoryDeductionYTD || 0
      });
    }

    // Always show LOP deduction even if 0
    this.deductionsArray.push({
      label: 'LOP Deduction',
      amount: ps?.totallopDaysAmount || 0
      //ytd: ps?.latestAttendanceSummary?.lopAmountYTD || 0
    });

    // Balance arrays if needed
    const maxLength = Math.max(this.earningsArray.length, this.deductionsArray.length);
    while (this.earningsArray.length < maxLength) {
      this.earningsArray.push({ label: ''});
    }
    while (this.deductionsArray.length < maxLength) {
      this.deductionsArray.push({ label: '' });
    }
  }

  calculateNetSalary(): void {
    // Calculate net salary from earnings minus deductions
    this.netSalary = this.totalEarnings - this.totalDeductionsWithStatutory;
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