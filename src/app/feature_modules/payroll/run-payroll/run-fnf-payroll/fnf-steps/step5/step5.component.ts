import { Component, OnInit, ViewChild, TemplateRef, Input } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { PayrollService } from 'src/app/_services/payroll.service';
import { ToastrService } from 'ngx-toastr';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';
import { UserService } from 'src/app/_services/users.service';
import { catchError, forkJoin, map } from 'rxjs';

@Component({
  selector: 'app-step5',
  templateUrl: './step5.component.html',
  styleUrl: './step5.component.css'
})
export class FNFStep5Component implements OnInit {
  displayedColumns: string[] = ['userName', 'loanAndAdvance', 'LoanAdvanceAmount', 'finalSettlementAmount', 'fnfClearanceStatus', 'actions'];
  loanAdvances = new MatTableDataSource<any>();
  userLoanAdvances: any[] = [];
  loanAdvanceForm: FormGroup;
  selectedLoanAdvance: any;
  fnfUsers: any;
  isEdit: boolean = false;
  selectedFNFUser: any;
  @Input() settledUsers: any[];
  @Input() isSteps: boolean;
  @Input() selectedFnF: any;
  loanCategories: any;

  @ViewChild('dialogTemplate') dialogTemplate: TemplateRef<any>;

  constructor(private fb: FormBuilder,
    private payrollService: PayrollService,
    private userService: UserService,
    public dialog: MatDialog,
    private toast: ToastrService) {
    this.loanAdvanceForm = this.fb.group({
      payrollFNFUser: ['', Validators.required],
      loanAndAdvance: ['', Validators.required],      
      LoanAdvanceAmount: [0],
      finalSettlementAmount: [0, Validators.required],
      fnfClearanceStatus: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    forkJoin({
      loanCategories: this.getLoanAdvanceCategory(),
      loanAdvances: this.fetchLoanAdvances(this.selectedFnF)
    }).subscribe((results) => {
      this.loanCategories = results.loanCategories;
      this.loanAdvances.data = results.loanAdvances;
    },
      (error) => {
        console.error('An error occurred:', error);
      }
    );
    this.loanAdvanceForm.get('loanAndAdvance')?.valueChanges.subscribe((selectedLoanId: string) => {
      const selectedLoan = this.userLoanAdvances.find(loan => loan._id === selectedLoanId);
      if (selectedLoan) {
        const amount = selectedLoan.amount || 0;
        const monthly = selectedLoan.monthlyInstallment || 0;
        const remaining = selectedLoan.remainingInstallment || 0;  
        const calculatedFinalSettlement = monthly * remaining;  
        this.loanAdvanceForm.patchValue({
          LoanAdvanceAmount: amount,
          finalSettlementAmount: calculatedFinalSettlement
        });
      } else {
        this.loanAdvanceForm.patchValue({
          LoanAdvanceAmount: 0,
          finalSettlementAmount: 0
        });
      }
    });
    this.loanAdvanceForm.get('LoanAdvanceAmount')?.disable();
  }

  onUserChange(fnfUserId: string): void {
    this.selectedFNFUser = fnfUserId;
    const matchedUser = this.selectedFnF.userList.find((user: any) => user.user === fnfUserId);
    const payrollFNFUserId = matchedUser ? matchedUser._id : null;

    if (payrollFNFUserId) {
      this.payrollService.getFnFLoanAdvanceByPayrollFnFUser(fnfUserId).subscribe((res: any) => {
        this.loanAdvances.data = res.data;
        this.loanAdvances.data.forEach((advance: any) => {
          const user = this.settledUsers.find(user => user._id === fnfUserId);
          advance.userName = user ? `${user.firstName} ${user.lastName}` : 'Unknown User';
        });
      });
    }
    if (!this.isEdit) {
      this.userService.getLoansAdvancesByUserId(fnfUserId, { skip: '', next: '' }).subscribe((res: any) => {
        this.userLoanAdvances = res.data;
      if (this.userLoanAdvances.length > 0) {
        this.userLoanAdvances.unshift({ loanAdvancesCategory: { name: 'Select Loan/Advance' } });
      } else {
        this.userLoanAdvances.unshift({ loanAdvancesCategory: { name: 'Loans/Advances not Assigned to the Selected User' } });
      }
      })
    }
  }

  getLoanAdvanceCategory() {
    return this.payrollService.getLoans({ skip: '', next: '' }).pipe(
      map((res: any) => {
        this.loanCategories = res.data;
        return res.data;
      })
    );
  }

  getMatchingCategory(loanAdvanceCategory: string) {
    const matchedCategory = this.loanCategories?.find((category: any) => category._id === loanAdvanceCategory);
    return matchedCategory ? matchedCategory.name : 'Unknown Category';
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

    // Ensure the form control is enabled
    const user = this.selectedFnF.userList.find(user => user._id === advance.payrollFNFUser);
    const payrollFNFUserId = user ? user.user : null;

    this.userService.getLoansAdvancesByUserId(payrollFNFUserId, { skip: '', next: '' }).subscribe((res: any) => {
      this.userLoanAdvances = res.data.map((res: any) => {
        return {
          ...res,
          loanAdvanceCategory: this.getMatchingCategory(res.loanAdvancesCategory)
        }
      });


        // Patch the form with other values
        this.loanAdvanceForm.patchValue({
          payrollFNFUser: advance.userName,
          loanAndAdvance: advance.loanAndAdvance,
          LoanAdvanceAmount: advance.LoanAdvanceAmount,
          finalSettlementAmount: advance.finalSettlementAmount,
          fnfClearanceStatus: advance.fnfClearanceStatus
        });
        this.loanAdvanceForm.get('payrollFNFUser').disable();
        this.openDialog(true);
      
      });
  }

  onSubmit(): void {
    const matchedUser = this.selectedFnF.userList.find((user: any) => user?.user === this.selectedFNFUser);
    const payrollFNFUserId = matchedUser ? matchedUser._id : null;
    this.loanAdvanceForm.get('LoanAdvanceAmount')?.enable();
    this.loanAdvanceForm.patchValue({
      payrollFNFUser: payrollFNFUserId,
      loanAndAdvance: this.loanAdvanceForm.get('loanAndAdvance').value
    });
    if (this.loanAdvanceForm.valid) {
      this.loanAdvanceForm.get('payrollFNFUser').enable();
      if (this.isEdit) {
        this.loanAdvanceForm.patchValue({
          payrollFNFUser: this.selectedLoanAdvance.payrollFNFUser,
        });

        this.payrollService.updateFnFLoanAdvance(this.selectedLoanAdvance._id, this.loanAdvanceForm.value).subscribe(
          (res: any) => {
            this.toast.success('Loan Advance updated successfully', 'Success');
            this.fetchLoanAdvances(this.selectedFnF).subscribe((data) => {
              this.loanAdvances.data = data;
            });

            this.loanAdvanceForm.reset({
              payrollFNFUser: '',
              loanAndAdvance: '',
              LoanAdvanceAmount: 0,
              finalSettlementAmount: 0,
              fnfClearanceStatus: ''
            });
            this.isEdit = false;
            this.dialog.closeAll();
          },
          (error: any) => {
            this.toast.error('Failed to update Loan Advance', 'Error');
          }
        );
      } else {
        const matchedUser = this.selectedFnF.userList.find((user: any) => user.user === this.selectedFNFUser);
        const payrollFNFUserId = matchedUser ? matchedUser._id : null;

        this.loanAdvanceForm.patchValue({
          payrollFNFUser: payrollFNFUserId
        });

        this.payrollService.addFnFLoanAdvance(this.loanAdvanceForm.value).subscribe(
          (res: any) => {
            this.toast.success('Loan Advance added successfully', 'Success');
            this.fetchLoanAdvances(this.selectedFnF).subscribe((data) => {
              this.loanAdvances.data = data;
            });
            this.loanAdvanceForm.reset({
              payrollFNFUser: '',
              loanAndAdvance: '',
              LoanAdvanceAmount: 0,
              finalSettlementAmount: 0,
              fnfClearanceStatus: ''
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
        finalSettlementAmount: this.selectedLoanAdvance.finalSettlementAmount,
        fnfClearanceStatus: this.selectedLoanAdvance.fnfClearanceStatus
      });
    } else {
      this.loanAdvanceForm.reset();
    }
  }

  deleteLoanAdvance(_id: string) {
    this.payrollService.deleteFnFLoanAdvance(_id).subscribe((res: any) => {
      this.toast.success('Loan Advance Deleted', 'Success');
      this.fetchLoanAdvances(this.selectedFnF).subscribe((data) => {
        this.loanAdvances.data = data;
      });
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

  fetchLoanAdvances(fnfPayroll: any) {
    return this.payrollService.getFnFLoanAdvanceByPayrollFnF(fnfPayroll?._id).pipe(
      map((res: any) => {
        const loanAdvancesData = res.data.map((res: any) => {
          return {
            ...res,
            loanAdvanceCategory: this.getMatchingCategory(res.loanAndAdvance)
          };
        });

        loanAdvancesData.forEach((item: any) => {
          const matchedUser = this.selectedFnF.userList.find((user: any) => user._id === item.payrollFNFUser);
          item.userName = this.getMatchedSettledUser(matchedUser.user);
        });

        if (this.isEdit && this.selectedLoanAdvance) {
          this.loanAdvanceForm.patchValue({
            payrollFNFUser: this.selectedLoanAdvance.payrollFNFUser,
            ...this.selectedLoanAdvance
          });
        }

        return loanAdvancesData; // Return the data for forkJoin
      }),
      catchError((error) => {
        this.toast.error('Failed to fetch Termination Compensation', 'Error');
        throw error; // Propagate the error to forkJoin
      })
    );
  }

  getUserName(userId: string): string {
    const user = this.settledUsers.find(user => user._id === userId);
    return user ? `${user.firstName} ${user.lastName}` : 'Unknown User';
  }
}

