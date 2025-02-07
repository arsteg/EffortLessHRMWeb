import { Component, Input, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { CommonService } from 'src/app/_services/common.Service';
import { PayrollService } from 'src/app/_services/payroll.service';
import { UserService } from 'src/app/_services/users.service';

@Component({
  selector: 'app-step-9',
  templateUrl: './step-9.component.html',
  styleUrl: './step-9.component.css'
})
export class Step9Component {
  searchText: string = '';
  closeResult: string = '';
  allUsers: any;

  selectedRecord: any;
  payrollUser: any;
  @Input() selectedPayroll: any;
  generatedPayroll: any;
  @ViewChild('dialogTemplate') dialogTemplate: TemplateRef<any>;

  displayedColumns = [
    'PayrollUsers',
    'totalOvertime',
    'totalFixedAllowance',
    'totalOtherBenefit',
    'totalFixedDeduction',
    'totalLoanAdvance',
    'totalFlexiBenefits',
    'totalPfTax',
    'totalIncomeTax',
    'yearlySalary',
    'monthlySalary',
    'actions'
  ];

  constructor(
    private dialog: MatDialog,
    private payrollService: PayrollService
  ) { }

  ngOnInit() {
    this.payrollService.allUsers.subscribe(res => {
      this.allUsers = res;
    });
    this.payrollService.payrollUsers.subscribe(res => {
      this.payrollUser = res;
    });
    this.getGeneratedPayroll();
  }

  getGeneratedPayroll() {
    this.payrollService.generatedPayrollByPayroll(this.selectedPayroll?._id).subscribe((res: any) => {
      this.generatedPayroll = res.data.map((record) => {
        return {
          ...record,
          totalOvertime: parseFloat(record?.totalOvertime).toFixed(2),
          totalFixedAllowance: parseFloat(record?.totalFixedAllowance).toFixed(2),
          totalOtherBenefit: parseFloat(record?.totalOtherBenefit).toFixed(2),
          totalFixedDeduction: parseFloat(record?.totalFixedDeduction).toFixed(2),
          totalLoanAdvance: parseFloat(record?.totalLoanAdvance).toFixed(2),
          totalFlexiBenefits: parseFloat(record?.totalFlexiBenefits).toFixed(2),
          totalPfTax: parseFloat(record?.totalPfTax).toFixed(2),
          totalIncomeTax: parseFloat(record?.totalIncomeTax).toFixed(2),
          yearlySalary: parseFloat(record?.yearlySalary).toFixed(2),
          monthlySalary: parseFloat(record?.monthlySalary).toFixed(2),
        }
      });
    })
  }

  getUser(employeeId: string) {
    const matchingUser = this.allUsers?.find(user => user._id === employeeId);
    return matchingUser ? `${matchingUser.firstName} ${matchingUser.lastName}` : 'N/A';
  }

  openDialog() {
    this.dialog.open(this.dialogTemplate, {
      width: '80%',
      height: '80%',
      disableClose: true
    });
  }

  closeDialog() {
    this.dialog.closeAll();
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

}