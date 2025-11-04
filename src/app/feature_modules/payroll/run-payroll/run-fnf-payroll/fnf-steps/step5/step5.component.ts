import { Component, OnInit, ViewChild, TemplateRef, Input, inject } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { PayrollService } from 'src/app/_services/payroll.service';
import { ToastrService } from 'ngx-toastr';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';
import { UserService } from 'src/app/_services/users.service';
import { catchError, forkJoin, map } from 'rxjs';
import { ActionVisibility, TableColumn } from 'src/app/models/table-column';
import { TranslateService } from '@ngx-translate/core';

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
  private readonly translate = inject(TranslateService);

  columns: TableColumn[] = [
    {
      key: 'userName',
      name: this.translate.instant('payroll.payroll_user_label'),
      valueFn: (row) => row.userName || ''
    },
    {
      key: 'loanAndAdvance',
      name: this.translate.instant('payroll.loan_and_advance'),
      valueFn: (row) => row.loanAdvanceCategory || ''
    },
    {
      key: 'LoanAdvanceAmount',
      name: this.translate.instant('payroll.loan_advance_amount'),
      valueFn: (row) => row.LoanAdvanceAmount
    },
    {
      key: 'finalSettlementAmount',
      name: this.translate.instant('payroll.final_settlement_amount'),
      valueFn: (row) => row.finalSettlementAmount
    },
    {
      key: 'fnfClearanceStatus',
      name: this.translate.instant('payroll.fnf_clearance_status'),
      valueFn: (row) => row.fnfClearanceStatus
    },
    {
      key: 'actions',
      name: this.translate.instant('payroll.actions'),
      isAction: true,
      options: [
        { label: this.translate.instant('payroll.delete'), visibility: ActionVisibility.BOTH, icon: 'delete', hideCondition: (row) => false }
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
        this.toast.error(this.translate.instant('payroll.failed_fetch_loan_and_advance'), this.translate.instant('payroll.error'));
        throw error;
      })
    );
  }

  getMatchingCategory(loanAdvanceCategory: string) {
    const matchedCategory = this.loanCategories?.find((category: any) => category._id === loanAdvanceCategory);
    return matchedCategory ? matchedCategory.name : '';
  }

  getMatchedSettledUser(userId: string) {
    const matchedUser = this.settledUsers?.find(user => user?._id === userId);
    return matchedUser ? `${matchedUser?.firstName} ${matchedUser?.lastName}` : '';
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
        this.toast.error(this.translate.instant('payroll.failed_fetch_loan_and_advance'), this.translate.instant('payroll.error'));
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
            this.userLoanAdvances.unshift({ _id: '', loanAdvancesCategory: { name: this.translate.instant('payroll.select_loan_and_advance') } });
          } else {
            this.userLoanAdvances.unshift({ _id: '', loanAdvancesCategory: { name: this.translate.instant('payroll.loans_and_advances_not_assigned') } });
          }
          this.loanAdvanceForm.patchValue({
            payrollFNFUser: this.getMatchedSettledUser(fnfUserId)
          });
        },
        error: () => {
          this.toast.error(this.translate.instant('payroll.failed_fetch_loan_and_advance'), this.translate.instant('payroll.error'));
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
          this.toast.error(this.translate.instant('payroll.failed_fetch_loan_and_advance'), this.translate.instant('payroll.error'));
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
          this.userLoanAdvances.unshift({ _id: '', loanAdvancesCategory: { name: this.translate.instant('payroll.select_loan_and_advance') } });
        } else {
          this.userLoanAdvances.unshift({ _id: '', loanAdvancesCategory: { name: this.translate.instant('payroll.loans_and_advances_not_assigned') } });
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
        this.toast.error(this.translate.instant('payroll.failed_fetch_loan_and_advance'), this.translate.instant('payroll.error'));
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
          if (this.isEdit) {
            this.toast.success(this.translate.instant('payroll.messages.loan_Advance_updated'), this.translate.instant('payroll.success'));
          } else {
            this.toast.success(this.translate.instant('payroll.messages.loan_advances'), this.translate.instant('payroll.success'));
          }
          this.isEdit = false;
          this.dialog.closeAll();
        },
        error: (error) => {
          if (this.isEdit) {
            this.toast.error(this.translate.instant('payroll.messages.loan_advance_update_error'), this.translate.instant('payroll.error'));
          }
          else {
            this.toast.error(this.translate.instant('payroll.messages.loan_advances_error'), this.translate.instant('payroll.error'));
          }
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
    if (event.action.label === this.translate.instant('payroll.delete')) {
      this.deleteFnF(event.row._id);
    }
  }

  deleteLoanAdvance(_id: string) {
    this.payrollService.deleteFnFLoanAdvance(_id).subscribe({
      next: () => {
        this.fetchLoanAdvances(this.selectedFnF).subscribe((data) => {
          this.loanAdvances.data = data;
        });
        this.toast.success(this.translate.instant('payroll.messages.loan_advance_delete'), this.translate.instant('payroll.successfully'));
      },
      error: () => {
        this.toast.error(this.translate.instant('payroll.messages.loan_advance_delete_error'), this.translate.instant('payroll.error'));
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