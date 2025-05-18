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
  selector: 'app-step9',
  templateUrl: './step9.component.html',
  styleUrl: './step9.component.css'
})

export class FNFStep9Component {
  searchText: string = '';
  closeResult: string = '';
  allUsers: any;
  selectedRecord: any;
  payrollUser: any;
  @Input() selectedPayroll: any;
  @Input() selectedFnF: any;

  generatedPayroll: any;
  payrollStatus: any;
  statusKeys: string[] = [];

  @ViewChild('dialogTemplate') dialogTemplate: TemplateRef<any>;
  @ViewChild('updateStatusResignation') updateStatusResignation: TemplateRef<any>;
  isEditMode: boolean = false;

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
    console.log(this.selectedPayroll);
    this.getFNFPayrollStatus();
    this.getGeneratedPayroll();
    this.payrollService.allUsers.subscribe(res => {
      this.allUsers = res;
    });
    this.payrollService.payrollUsers.subscribe(res => {
      this.payrollUser = res;
    });
  }

  getFNFPayrollStatus() {
    this.payrollService.getFnFPayrollStatus().subscribe((res: any) => {
      this.payrollStatus = res.data;
    },
      (error) => {
        console.error('Error fetching payroll status:', error);
      }
    );
  }

  getGeneratedPayroll() {
    this.payrollService.getGeneratedFnFPayrollByFNFPayroll(this.selectedFnF?._id).subscribe((res: any) => {
      this.generatedPayroll = res.data;
    });
  }

  getUser(employeeId: string) {
    const matchingUser = this.allUsers?.find(user => user?._id === employeeId);
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
