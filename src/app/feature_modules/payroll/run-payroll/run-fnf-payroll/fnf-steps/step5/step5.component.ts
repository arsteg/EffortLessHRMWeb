import { Component, OnInit, ViewChild, TemplateRef, Input } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { PayrollService } from 'src/app/_services/payroll.service';
import { ToastrService } from 'ngx-toastr';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';
import { UserService } from 'src/app/_services/users.service';
import { catchError, forkJoin, map } from 'rxjs';
import { ActionVisibility, TableColumn } from 'src/app/models/table-column';

@Component({
  selector: 'app-step5',
  templateUrl: './step5.component.html',
  styleUrls: ['./step5.component.css']
})
export class FNFStep5Component implements OnInit {
  loanAdvances = new MatTableDataSource<any>();
  userLoanAdvances: any[] = [];
  loanAdvanceForm: FormGroup;
  selectedLoanAdvance: any;
  isEdit: boolean = false;
  selectedFNFUser: any;
  loanCategories: any;
  @Input() settledUsers: any[];
  @Input() isSteps: boolean;
  @Input() selectedFnF: any;
  @ViewChild('dialogTemplate') dialogTemplate: TemplateRef<any>;

  columns: TableColumn[] = [
    {
      key: 'userName',
      name: 'Payroll User',
      valueFn: (row) => row.userName || 'Not specified'
    },
    {
      key: 'loanAndAdvance',
      name: 'Loan and Advance',
      valueFn: (row) => row.loanAdvanceCategory || 'Unknown Category'
    },
    {
      key: 'LoanAdvanceAmount',
      name: 'Loan Advance Amount',
      valueFn: (row) => row.LoanAdvanceAmount
    },
    {
      key: 'finalSettlementAmount',
      name: 'Final Settlement Amount',
      valueFn: (row) => row.finalSettlementAmount
    },
    {
      key: 'fnfClearanceStatus',
      name: 'FnF Clearance Status',
      valueFn: (row) => row.fnfClearanceStatus
    },
    {
      key: 'actions',
      name: 'Actions',
      isAction: true,
      options: [
        { label: 'Delete', visibility: ActionVisibility.BOTH, icon: 'delete', hideCondition: (row) => false }
      ]
    }
  ];

  constructor(
    private fb: FormBuilder,
    private payrollService: PayrollService,
    private userService: UserService,
    public dialog: MatDialog,
    private toast: ToastrService
  ) {
    this.loanAdvanceForm = this.fb.group({
      payrollFNFUser: ['', Validators.required],
      loanAndAdvance: ['', Validators.required],
      LoanAdvanceAmount: [{ value: 0, disabled: true }, Validators.required],
      finalSettlementAmount: [0, Validators.required],
      fnfClearanceStatus: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    forkJoin({
      loanCategories: this.getLoanAdvanceCategory(),
      loanAdvances: this.fetchLoanAdvances(this.selectedFnF)
    }).subscribe({
      next: (results) => {
        this.loanCategories = results.loanCategories;
        this.loanAdvances.data = results.loanAdvances;
      },
      error: (error) => {
        console.error('Error while loading loan advances:', error);
      }
    });

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
  }

  getLoanAdvanceCategory() {
    return this.payrollService.getLoans({ skip: '', next: '' }).pipe(
      map((res: any) => res.data),
      catchError((error) => {
        this.toast.error('Failed to fetch Loan Categories', 'Error');
        throw error;
      })
    );
  }

  getMatchingCategory(loanAdvanceCategory: string) {
    const matchedCategory = this.loanCategories?.find((category: any) => category._id === loanAdvanceCategory);
    return matchedCategory ? matchedCategory.name : 'Unknown Category';
  }

  getMatchedSettledUser(userId: string) {
    const matchedUser = this.settledUsers?.find(user => user?._id === userId);
    return matchedUser ? `${matchedUser?.firstName} ${matchedUser?.lastName}` : 'Not specified';
  }

  fetchLoanAdvances(fnfPayroll: any) {
    return this.payrollService.getFnFLoanAdvanceByPayrollFnF(fnfPayroll?._id).pipe(
      map((res: any) => {
        return res.data.map((item: any) => {
          const matchedUser = this.selectedFnF.userList.find((user: any) => user._id === item.payrollFNFUser);
          return {
            ...item,
            userName: this.getMatchedSettledUser(matchedUser?.user || ''),
            loanAdvanceCategory: this.getMatchingCategory(item.loanAndAdvance)
          };
        });
      }),
      catchError((error) => {
        this.toast.error('Failed to fetch Loan Advances', 'Error');
        throw error;
      })
    );
  }

  onUserChange(fnfUserId: string): void {
    this.selectedFNFUser = fnfUserId;
    const matchedUser = this.selectedFnF.userList.find((user: any) => user.user === fnfUserId);
    const payrollFNFUserId = matchedUser ? matchedUser._id : null;

    if (payrollFNFUserId) {
      this.userService.getLoansAdvancesByUserId(fnfUserId, { skip: '', next: '' }).subscribe({
        next: (res: any) => {
          this.userLoanAdvances = res.data;
          if (this.userLoanAdvances.length > 0) {
            this.userLoanAdvances.unshift({ _id: '', loanAdvancesCategory: { name: 'Select Loan/Advance' } });
          } else {
            this.userLoanAdvances.unshift({ _id: '', loanAdvancesCategory: { name: 'Loans/Advances not Assigned to the Selected User' } });
          }
          this.loanAdvanceForm.patchValue({
            payrollFNFUser: this.getMatchedSettledUser(fnfUserId)
          });
        },
        error: () => {
          this.toast.error('Failed to fetch User Loan Advances', 'Error');
        }
      });

      this.payrollService.getFnFLoanAdvanceByPayrollFnFUser(fnfUserId).subscribe({
        next: (res: any) => {
          this.loanAdvances.data = res.data.map((item: any) => {
            const matchedUser = this.selectedFnF.userList.find((user: any) => user._id === item.payrollFNFUser);
            return {
              ...item,
              userName: this.getMatchedSettledUser(matchedUser?.user || ''),
              loanAdvanceCategory: this.getMatchingCategory(item.loanAndAdvance)
            };
          });
        },
        error: () => {
          this.toast.error('Failed to fetch Loan Advances for User', 'Error');
        }
      });
    }
  }

  openDialog(isEdit: boolean): void {
    this.isEdit = isEdit;
    if (!isEdit) {
      this.resetForm();
    }
    this.dialog.open(this.dialogTemplate, {
      width: '50%',
      panelClass: 'custom-dialog-container',
      disableClose: true
    });
  }

  editLoanAdvance(advance: any): void {
    this.isEdit = true;
    this.selectedLoanAdvance = advance;
    this.selectedFNFUser = advance.payrollFNFUser; // Store for submission

    const user = this.selectedFnF.userList.find((u: any) => u._id === advance.payrollFNFUser);
    const payrollFNFUserId = user ? user.user : null;

    this.userService.getLoansAdvancesByUserId(payrollFNFUserId, { skip: '', next: '' }).subscribe({
      next: (res: any) => {
        this.userLoanAdvances = res.data;
        if (this.userLoanAdvances.length > 0) {
          this.userLoanAdvances.unshift({ _id: '', loanAdvancesCategory: { name: 'Select Loan/Advance' } });
        } else {
          this.userLoanAdvances.unshift({ _id: '', loanAdvancesCategory: { name: 'Loans/Advances not Assigned to the Selected User' } });
        }

        this.loanAdvanceForm.patchValue({
          payrollFNFUser: advance.userName,
          loanAndAdvance: advance.loanAndAdvance,
          LoanAdvanceAmount: advance.LoanAdvanceAmount,
          finalSettlementAmount: advance.finalSettlementAmount,
          fnfClearanceStatus: advance.fnfClearanceStatus
        });
        this.loanAdvanceForm.get('payrollFNFUser').disable();
        this.openDialog(true);
      },
      error: () => {
        this.toast.error('Failed to fetch User Loan Advances', 'Error');
      }
    });
  }

  onSubmit(): void {
    this.loanAdvanceForm.get('LoanAdvanceAmount')?.enable();
    this.loanAdvanceForm.get('payrollFNFUser')?.enable();

    const matchedUser = this.selectedFnF.userList.find((user: any) => user.user === this.selectedFNFUser);
    const payrollFNFUserId = matchedUser ? matchedUser._id : this.selectedLoanAdvance?.payrollFNFUser;

    const payload = {
      ...this.loanAdvanceForm.getRawValue(),
      payrollFNFUser: payrollFNFUserId
    };

    if (this.loanAdvanceForm.valid) {
      const request$ = this.isEdit
        ? this.payrollService.updateFnFLoanAdvance(this.selectedLoanAdvance._id, payload)
        : this.payrollService.addFnFLoanAdvance(payload);

      request$.subscribe({
        next: () => {
          this.fetchLoanAdvances(this.selectedFnF).subscribe((data) => {
            this.loanAdvances.data = data;
          });
          this.resetForm();
          this.toast.success(`Loan Advance ${this.isEdit ? 'updated' : 'added'} successfully`, 'Success');
          this.isEdit = false;
          this.dialog.closeAll();
        },
        error: (error) => {
          this.toast.error(`Failed to ${this.isEdit ? 'update' : 'add'} Loan Advance`, 'Error');
        }
      });
    } else {
      this.loanAdvanceForm.markAllAsTouched();
    }
  }

  resetForm(): void {
    this.loanAdvanceForm.reset({
      payrollFNFUser: '',
      loanAndAdvance: '',
      LoanAdvanceAmount: 0,
      finalSettlementAmount: 0,
      fnfClearanceStatus: ''
    });
    this.loanAdvanceForm.get('LoanAdvanceAmount')?.disable();
  }

  onCancel(): void {
    this.isEdit = false;
    this.resetForm();
    this.dialog.closeAll();
  }

  onAction(event: any): void {
    if (event.action.label === 'Delete') {
      this.deleteFnF(event.row._id);
    }
  }

  deleteLoanAdvance(_id: string) {
    this.payrollService.deleteFnFLoanAdvance(_id).subscribe({
      next: () => {
        this.fetchLoanAdvances(this.selectedFnF).subscribe((data) => {
          this.loanAdvances.data = data;
        });
        this.toast.success('Loan Advance Deleted', 'Success');
      },
      error: () => {
        this.toast.error('Failed to delete Loan Advance', 'Error');
      }
    });
  }

  deleteFnF(id: string): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, { width: '400px' });
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'delete') {
        this.deleteLoanAdvance(id);
      }
    });
  }
}