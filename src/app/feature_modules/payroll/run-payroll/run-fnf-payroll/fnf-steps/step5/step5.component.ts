import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { PayrollService } from 'src/app/_services/payroll.service';
import { ToastrService } from 'ngx-toastr';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';
import { CommonService } from 'src/app/_services/common.Service';

@Component({
  selector: 'app-step5',
  templateUrl: './step5.component.html',
  styleUrl: './step5.component.css'
})
export class FNFStep5Component implements OnInit {
  displayedColumns: string[] = ['payrollUser', 'loanAndAdvance', 'LoanAdvanceAmount', 'status', 'finalSettlementAmount', 'fnfClearanceStatus', 'fnfDate', 'actions'];
  loanAdvances = new MatTableDataSource<any>();
  fnfStep5Form: FormGroup;
  selectedLoanAdvance: any;
  userList: any[] = [];
  fnfUsers: any;
  isEdit: boolean = false;

  @ViewChild('dialogTemplate') dialogTemplate: TemplateRef<any>;

  constructor(private fb: FormBuilder,
    private payrollService: PayrollService,
    private commonService: CommonService,
    public dialog: MatDialog,
    private toast: ToastrService) {
    this.fnfStep5Form = this.fb.group({
      payrollFNFUser: ['', Validators.required],
      loanAndAdvance: ['', Validators.required],
      LoanAdvanceAmount: [0, Validators.required],
      status: ['', Validators.required],
      finalSettlementAmount: [0, Validators.required],
      fnfClearanceStatus: ['', Validators.required],
      fnfDate: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.commonService.populateUsers().subscribe((res: any) => {
      this.userList = res.data['data'];
    });

    this.payrollService.selectedFnFPayroll.subscribe((fnfPayroll: any) => {
      if (fnfPayroll) {
        setTimeout(() => {
          this.fetchLoanAdvances(fnfPayroll);
        }, 1000);
      }
    });
  }

  onUserChange(fnfUserId: string): void {
    console.log('fnf payroll users: ', fnfUserId);
    this.payrollService.selectedFnFPayroll.subscribe((fnfPayroll: any) => {
      const fnfUser = fnfPayroll.userList[0].user;

      this.payrollService.getFnFLoanAdvanceByPayrollFnFUser(fnfUserId).subscribe((res: any) => {
        this.loanAdvances.data = res.data;
        this.loanAdvances.data.forEach((advance: any) => {
          const user = this.userList.find(user => user._id === fnfUser);
          console.log(user);
          advance.userName = user ? `${user.firstName} ${user.lastName}` : 'Unknown User';
        });
      });
    });
  }

  openDialog(isEdit: boolean): void {
    this.isEdit = isEdit;
    this.dialog.open(this.dialogTemplate, {
      width: '50%',
      panelClass: 'custom-dialog-container',
      disableClose: true
    });
  }

  editLoanAdvance(advance: any): void {
    this.isEdit = true;
    this.selectedLoanAdvance = advance;
    this.fnfStep5Form.patchValue({
      payrollFNFUser: advance.payrollFNFUser,
      loanAndAdvance: advance.loanAndAdvance,
      LoanAdvanceAmount: advance.LoanAdvanceAmount,
      status: advance.status,
      finalSettlementAmount: advance.finalSettlementAmount,
      fnfClearanceStatus: advance.fnfClearanceStatus,
      fnfDate: advance.fnfDate
    });

    this.openDialog(true);
  }

  onSubmit(): void {
    if (this.fnfStep5Form.valid) {
      const payload = this.fnfStep5Form.value;
      if (this.selectedLoanAdvance) {
        this.payrollService.updateFnFLoanAdvance(this.selectedLoanAdvance._id, payload).subscribe(
          (res: any) => {
            this.toast.success('Loan Advance updated successfully', 'Success');
            this.dialog.closeAll();
            this.fetchLoanAdvances(this.selectedLoanAdvance.fnfPayrollId);
          },
          (error: any) => {
            this.toast.error('Failed to update Loan Advance', 'Error');
          }
        );
      } else {
        this.payrollService.addFnFLoanAdvance(payload).subscribe(
          (res: any) => {
            this.toast.success('Loan Advance added successfully', 'Success');
            this.dialog.closeAll();
            this.fetchLoanAdvances(payload.fnfPayrollId);
          },
          (error: any) => {
            this.toast.error('Failed to add Loan Advance', 'Error');
          }
        );
      }
    } else {
      this.fnfStep5Form.markAllAsTouched();
    }
  }

  onCancel(): void {
    if (this.isEdit && this.selectedLoanAdvance) {
      this.fnfStep5Form.patchValue({
        payrollFNFUser: this.selectedLoanAdvance.payrollFNFUser,
        loanAndAdvance: this.selectedLoanAdvance.loanAndAdvance,
        LoanAdvanceAmount: this.selectedLoanAdvance.LoanAdvanceAmount,
        status: this.selectedLoanAdvance.status,
        finalSettlementAmount: this.selectedLoanAdvance.finalSettlementAmount,
        fnfClearanceStatus: this.selectedLoanAdvance.fnfClearanceStatus,
        fnfDate: this.selectedLoanAdvance.fnfDate
      });
    } else {
      this.fnfStep5Form.reset();
    }
  }

  deleteLoanAdvance(_id: string) {
    this.payrollService.deleteFnFLoanAdvance(_id).subscribe((res: any) => {
      this.toast.success('Loan Advance Deleted', 'Success');
      this.fetchLoanAdvances(this.selectedLoanAdvance.fnfPayrollId);
    }, error => {
      this.toast.error('Failed to delete Loan Advance', 'Error');
    });
  }

  deleteFnF(id: string): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, { width: '400px', });
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'delete') { this.deleteLoanAdvance(id); }
    });
  }

  fetchLoanAdvances(fnfPayroll: any): void {
    this.payrollService.getFnFLoanAdvanceByPayrollFnF(fnfPayroll?._id).subscribe(
      (res: any) => {
        this.loanAdvances.data = res.data;
        this.loanAdvances.data.forEach((advance: any, index: number) => {
          const user = this.userList.find(user => user._id === fnfPayroll.userList[index].user);
          advance.userName = user ? `${user.firstName} ${user.lastName}` : 'Unknown User';
        });
      },
      (error: any) => {
        this.toast.error('Failed to fetch Loan Advances', 'Error');
      }
    );
  }

  getUserName(userId: string): string {
    const user = this.userList.find(user => user._id === userId);
    return user ? `${user.firstName} ${user.lastName}` : 'Unknown User';
  }
}

