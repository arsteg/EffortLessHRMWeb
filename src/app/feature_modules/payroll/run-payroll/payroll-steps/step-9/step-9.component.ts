import { Component, Input, TemplateRef, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { PayrollService } from 'src/app/_services/payroll.service';

interface PayrollStatus {
  InProgress: string,
  Pending: string,
  OnHold: string,
  Processed: string,
  Approved: string,
  Paid: string,
  Cleared: string,
  Rejected: string,
  Finilized: string,
  Exit_Interview_Completed: string
}

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
  generatedPayroll: any[] = [];
  @ViewChild('dialogTemplate') dialogTemplate: TemplateRef<any>;
  @ViewChild('updateStatusResignation') updateStatusResignation: TemplateRef<any>;
  isEditMode: boolean = false;
  payrollStatus: PayrollStatus;
  payrollForm: FormGroup;
  changedStatus: string;
  selectedStatus: string;
  dialogRef: any;
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
    'totalEmployeeStatutoryContribution',
    'totalEmployeeStatutoryDeduction',
    'payroll_status',
    'actions'
  ];

  constructor(
    private dialog: MatDialog,
    private payrollService: PayrollService
  ) { }

  ngOnInit() {
    this.getPayrollStatus();
    this.payrollService.allUsers.subscribe(res => {
      this.allUsers = res;
    });
    this.payrollService.payrollUsers.subscribe(res => {
      this.payrollUser = res;
    });
    this.getGeneratedPayroll();
  }

  getPayrollStatus() {
    this.payrollService.getPayrollStatus().subscribe((res: any) => {
      this.payrollStatus = res.data.statusList;
    },
      (error) => {
        console.error('Error fetching payroll status:', error);
      }
    );
  }

  getGeneratedPayroll() {
    if (!this.selectedPayroll?._id) {
      this.generatedPayroll = [];
      return;
    }
    this.payrollService.generatedPayrollByPayroll(this.selectedPayroll?._id).subscribe(
      (res: any) => {
        this.generatedPayroll = res.data.map((record) => {
          return {
            ...record,
            totalOvertime: parseFloat(record?.totalOvertime || 0).toFixed(2),
            totalFixedAllowance: parseFloat(record?.totalFixedAllowance || 0).toFixed(2),
            totalOtherBenefit: parseFloat(record?.totalOtherBenefit || 0).toFixed(2),
            totalFixedDeduction: parseFloat(record?.totalFixedDeduction || 0).toFixed(2),
            totalLoanAdvance: record?.totalLoanAdvance,
            totalFlexiBenefits: parseFloat(record?.totalFlexiBenefits || 0).toFixed(2),
            totalPfTax: parseFloat(record?.totalPfTax || 0).toFixed(2),
            totalIncomeTax: parseFloat(record?.totalIncomeTax || 0).toFixed(2),
            yearlySalary: parseFloat(record?.yearlySalary || 0).toFixed(2),
            monthlySalary: parseFloat(record?.monthlySalary || 0).toFixed(2),
            payroll_status: record?.payroll_status || 'Pending'
          };
        });
      },
      (error) => {
        console.error('Error fetching generated payroll:', error);
        this.generatedPayroll = [];
      }
    );
  }

  getUser(employeeId: string) {
    const matchingUser = this.allUsers?.find(user => user._id === employeeId);
    return matchingUser ? `${matchingUser.firstName} ${matchingUser.lastName}` : 'N/A';
  }

  openDialog(data?: any): void {
    this.isEditMode = !!data;
    if (this.isEditMode) {
      this.payrollForm?.patchValue(data);
    } else {
      this.payrollForm?.reset();
    }
    this.dialog.open(this.dialogTemplate, {
      width: '80%',
      height: '80%',
      disableClose: true
    });
  }

  closeDialog() {
    this.dialog.closeAll();
  }

  openUpdateStatusDialog(): void {
    this.dialogRef = this.dialog.open(this.updateStatusResignation, {
      disableClose: true
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

  changeStatus(recordId: string, status: string): void {
    if (!recordId || !status) {
      return;
    }
    const updatedRecord = { _id: recordId, payroll_status: status };
    // this.payrollService.updatePayrollRecord(updatedRecord).subscribe(
    //   (response) => {
    //     this.getGeneratedPayroll(); // Refresh table data
    //   },
    //   (error) => {
    //   }
    // );
  }
}