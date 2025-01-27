import { Component, OnInit, ViewChild, TemplateRef, Input } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { PayrollService } from 'src/app/_services/payroll.service';
import { ToastrService } from 'ngx-toastr';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-step5',
  templateUrl: './step5.component.html',
  styleUrl: './step5.component.css'
})
export class FNFStep5Component implements OnInit {
  displayedColumns: string[] = ['userName', 'loanAndAdvance', 'LoanAdvanceAmount', 'status', 'finalSettlementAmount', 'fnfClearanceStatus', 'fnfDate', 'actions'];
  loanAdvances = new MatTableDataSource<any>();
  loanAdvanceForm: FormGroup;
  selectedLoanAdvance: any;
  fnfUsers: any;
  isEdit: boolean = false;
  selectedFNFUser: any;
  @Input() settledUsers: any[];
  @Input() fnfPayrollRecord: any;
  @Input() isSteps: boolean;

  @ViewChild('dialogTemplate') dialogTemplate: TemplateRef<any>;

  constructor(private fb: FormBuilder,
    private payrollService: PayrollService,
    public dialog: MatDialog,
    private toast: ToastrService) {
    this.loanAdvanceForm = this.fb.group({
      payrollFNFUser: ['', Validators.required],
      loanAndAdvance: [null],
      LoanAdvanceAmount: [0],
      status: ['', Validators.required],
      finalSettlementAmount: [0, Validators.required],
      fnfClearanceStatus: ['', Validators.required],
      fnfDate: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.fetchLoanAdvances(this.fnfPayrollRecord);

  }

  onUserChange(fnfUserId: string): void {
    console.log('fnf payroll users: ', fnfUserId);
    this.selectedFNFUser = fnfUserId;
    this.selectedFNFUser = fnfUserId;
    const fnfUser = this.fnfPayrollRecord.userList[0].user;

      this.payrollService.getFnFLoanAdvanceByPayrollFnFUser(fnfUserId).subscribe((res: any) => {
        this.loanAdvances.data = res.data;
        this.loanAdvances.data.forEach((advance: any) => {
          const user = this.settledUsers.find(user => user._id === fnfUser);
          console.log(user);
          advance.userName = user ? `${user.firstName} ${user.lastName}` : 'Unknown User';
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
    this.loanAdvanceForm.patchValue({
      payrollFNFUser: advance.userName,
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
    const matchedUser = this.fnfPayrollRecord.userList.find((user: any) => user?.user === this.selectedFNFUser);
    const payrollFNFUserId = matchedUser ? matchedUser._id : null;

    this.loanAdvanceForm.patchValue({
      payrollFNFUser: payrollFNFUserId
    })
    if (this.loanAdvanceForm.valid) {
      this.loanAdvanceForm.get('payrollFNFUser').enable();
      if (this.selectedLoanAdvance || this.isEdit) {
        this.loanAdvanceForm.patchValue({
          payrollFNFUser: this.selectedLoanAdvance.payrollFNFUser,
        });

        this.payrollService.updateFnFLoanAdvance(this.selectedLoanAdvance._id, this.loanAdvanceForm.value).subscribe(
          (res: any) => {
            this.toast.success('Loan Advance updated successfully', 'Success');
            this.fetchLoanAdvances(this.selectedLoanAdvance.fnfPayrollId);
            this.loanAdvanceForm.reset({
              payrollFNFUser: '',
              loanAndAdvance: '',
              LoanAdvanceAmount: 0,
              status: '',
              finalSettlementAmount: 0,
              fnfClearanceStatus: '',
              fnfDate: ''
            });
            this.isEdit = false;
            this.dialog.closeAll();
          },
          (error: any) => {
            this.toast.error('Failed to update Loan Advance', 'Error');
          }
        );
      } else {
        const matchedUser = this.fnfPayrollRecord.userList.find((user: any) => user.user === this.selectedFNFUser);
        const payrollFNFUserId = matchedUser ? matchedUser._id : null;

        this.loanAdvanceForm.patchValue({
          payrollFNFUser: payrollFNFUserId
        });

        this.payrollService.addFnFLoanAdvance(this.loanAdvanceForm.value).subscribe(
          (res: any) => {
            this.toast.success('Loan Advance added successfully', 'Success');
            this.fetchLoanAdvances(this.fnfPayrollRecord);
            this.loanAdvanceForm.reset({
              payrollFNFUser: '',
              loanAndAdvance: '',
              LoanAdvanceAmount: 0,
              status: '',
              finalSettlementAmount: 0,
              fnfClearanceStatus: '',
              fnfDate: ''
            });
            this.dialog.closeAll();
          },
          (error: any) => {
            this.toast.error('Failed to add Loan Advance', 'Error');
          }
        );
      }
    } else {
      this.loanAdvanceForm.markAllAsTouched();
    }
  }

  onCancel(): void {
    if (this.isEdit && this.selectedLoanAdvance) {
      this.loanAdvanceForm.patchValue({
        payrollFNFUser: this.selectedLoanAdvance.payrollFNFUser,
        loanAndAdvance: this.selectedLoanAdvance.loanAndAdvance,
        LoanAdvanceAmount: this.selectedLoanAdvance.LoanAdvanceAmount,
        status: this.selectedLoanAdvance.status,
        finalSettlementAmount: this.selectedLoanAdvance.finalSettlementAmount,
        fnfClearanceStatus: this.selectedLoanAdvance.fnfClearanceStatus,
        fnfDate: this.selectedLoanAdvance.fnfDate
      });
    } else {
      this.loanAdvanceForm.reset();
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
  getMatchedSettledUser(userId: string) {
    const matchedUser = this.settledUsers?.find(user => user?._id == userId)
    return matchedUser ? `${matchedUser?.firstName}  ${matchedUser?.lastName}` : 'Not specified'
  }

  fetchLoanAdvances(fnfPayroll: any): void {
    this.payrollService.getFnFLoanAdvanceByPayrollFnF(fnfPayroll?._id).subscribe(
      (res: any) => {
        this.loanAdvances.data = res.data;

        
        this.loanAdvances.data.forEach((item: any) => {
          const matchedUser = this.fnfPayrollRecord.userList.find((user: any) => user._id === item.payrollFNFUser);
          item.userName = this.getMatchedSettledUser(matchedUser.user);
        });

        if (this.isEdit && this.selectedLoanAdvance) {
          this.loanAdvanceForm.patchValue({
            payrollFNFUser: this.selectedLoanAdvance.payrollFNFUser,
            ...this.selectedLoanAdvance
          });
        }
      },
      (error: any) => {
        this.toast.error('Failed to fetch Termination Compensation', 'Error');
      });
  }

  getUserName(userId: string): string {
    const user = this.settledUsers.find(user => user._id === userId);
    return user ? `${user.firstName} ${user.lastName}` : 'Unknown User';
  }
}

