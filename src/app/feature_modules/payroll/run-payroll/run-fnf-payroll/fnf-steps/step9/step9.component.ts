import { Component, Input, TemplateRef, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
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
  payrollStatusArray: any;
  selectedStatus: string = '';
  selectedPayrollUser: any;
  statusKeys: string[] = [];
  @ViewChild('updateStatus') updateStatus: TemplateRef<any>;
  @ViewChild('dialogTemplate') dialogTemplate: TemplateRef<any>;
  @ViewChild('updateStatusResignation') updateStatusResignation: TemplateRef<any>;
  isEditMode: boolean = false;

  payrollForm: FormGroup;
  changedStatus: string;
  dialogRef: any;
  displayedColumns = [
    'PayrollUsers',
    'totalOvertime',
    'totalFixedAllowance',
    'totalFixedDeduction',
    'totalLoanAdvance',   
    'totalIncomeTax',
    'yearlySalary',
    'monthlySalary',
    'totalEmployerStatutoryContribution',
    'totalEmployeeStatutoryDeduction',
    'payroll_status',
    'actions'
  ];

  constructor(
    private dialog: MatDialog,
    private payrollService: PayrollService,
    private toast: ToastrService
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
    this.payrollService.getFNFPayrollStatus().subscribe((res: any) => {
      this.payrollStatus = res.data;
      this.payrollStatusArray = Object.values(this.payrollStatus).filter(status => status);
    });
  }

  openUpdateStatusDialog(status: string) {
    this.selectedStatus = status;
    const dialogRef = this.dialog.open(this.updateStatus, {
      width: '600px',
      disableClose: true,
      data: status
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) { }
    });
  }

   updatePayrollStatus() {
    const id = this.selectedPayrollUser?.PayrollUser?.id;
    const payload = {
      updatedOnDate: new Date(),
      status: this.selectedStatus
    };
    this.payrollService.updateFnFUserStatus(id, payload).subscribe((res: any) => {
      this.toast.success('Payroll status updated successfully', 'Success');
      this.getGeneratedPayroll();
      this.closeDialog();
    })
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
