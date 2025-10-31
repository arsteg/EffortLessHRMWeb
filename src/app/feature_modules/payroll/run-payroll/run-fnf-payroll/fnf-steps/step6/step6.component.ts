import { Component, OnInit, ViewChild, TemplateRef, Input, inject } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { PayrollService } from 'src/app/_services/payroll.service';
import { ToastrService } from 'ngx-toastr';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';
import { forkJoin, map, catchError } from 'rxjs';
import { ActionVisibility, TableColumn } from 'src/app/models/table-column';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-step6',
  templateUrl: './step6.component.html',
  styleUrls: ['./step6.component.css']
})
export class FNFStep6Component implements OnInit {
  statutoryBenefits = new MatTableDataSource<any>();
  statutoryBenefitForm: FormGroup;
  selectedStatutoryBenefit: any;
  isEdit: boolean = false;
  selectedFNFUser: any;
  @Input() settledUsers: any[] = [];
  @Input() isSteps: boolean = false;
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
      key: 'GratuityAmount',
      name: this.translate.instant('payroll.gratuity_amount'),
      valueFn: (row) => row.GratuityAmount
    },
    {
      key: 'ProvidentFundAmount',
      name: this.translate.instant('payroll.provident_fund_amount'),
      valueFn: (row) => row.ProvidentFundAmount
    },
    {
      key: 'ProvidentFundPaymentProcess',
      name: this.translate.instant('payroll.provident_fund_payment_process'),
      valueFn: (row) => row.ProvidentFundPaymentProcess
    },
    {
      key: 'IsProvidentFundWithdrawFormSubmitted',
      name: 'Provident Fund Withdraw Form',
      valueFn: (row) => row.IsProvidentFundWithdrawFormSubmitted ? this.translate.instant('payroll.yes') : this.translate.instant('payroll.no')
    },
    {
      key: 'actions',
      name: this.translate.instant('payroll.actions'),
      isAction: true,
      options: [
        { label: this.translate.instant('payroll.edit'), visibility: ActionVisibility.BOTH, icon: 'edit', hideCondition: (row) => false },
        { label: this.translate.instant('payroll.delete'), visibility: ActionVisibility.BOTH, icon: 'delete', hideCondition: (row) => false }
      ]
    }
  ];

  constructor(
    private fb: FormBuilder,
    private payrollService: PayrollService,
    public dialog: MatDialog,
    private toast: ToastrService
  ) {
    this.statutoryBenefitForm = this.fb.group({
      payrollFNFUser: ['', Validators.required],
      GratuityAmount: [0, Validators.required],
      ProvidentFundAmount: [0, Validators.required],
      ProvidentFundPaymentProcess: ['', Validators.required],
      IsProvidentFundWithdrawFormSubmitted: [false]
    });
  }

  ngOnInit(): void {
    forkJoin({
      statutoryBenefits: this.fetchStatutoryBenefits(this.selectedFnF)
    }).subscribe({
      next: (results) => {
        this.statutoryBenefits.data = results.statutoryBenefits;
      },
      error: (error) => {
      }
    });
  }

  fetchStatutoryBenefits(fnfPayroll: any) {
    return this.payrollService.getFnFStatutoryBenefitByPayrollFnF(fnfPayroll?._id).pipe(
      map((res: any) => {
        return res.data.map((item: any) => {
          const matchedUser = this.selectedFnF.userList.find(
            (user: any) => user._id === item.payrollFNFUser
          );
          return {
            ...item,
            userName: this.getMatchedSettledUser(matchedUser?.user || '')
          };
        });
      }),
      catchError((error) => {
        this.toast.error(this.translate.instant('payroll.failed_fetch_statutory_benefits'), this.translate.instant('payroll.error'));
        throw error;
      })
    );
  }

  getMatchedSettledUser(userId: string) {
    const matchedUser = this.settledUsers?.find((user) => user?._id === userId);
    return matchedUser ? `${matchedUser.firstName} ${matchedUser.lastName}` : '';
  }

  onUserChange(fnfUserId: string): void {
    this.selectedFNFUser = fnfUserId;
    this.statutoryBenefitForm.patchValue({
      payrollFNFUser: this.getMatchedSettledUser(fnfUserId)
    });
    this.getTotalPFAmountByUser(fnfUserId);
    this.getTotalGratuityAmountByUser(fnfUserId);
  }

  getTotalPFAmountByUser(userId: string): void {
    this.payrollService.getTotalPFAmountByUser(userId).subscribe({
      next: (res: any) => {
        this.statutoryBenefitForm.patchValue({ ProvidentFundAmount: res.data });
      },
      error: () => {
        this.toast.error(this.translate.instant('payroll.failed_fetch_provident_fund_amount'), this.translate.instant('payroll.error'));
      }
    });
  }

  getTotalGratuityAmountByUser(userId: string): void {
    this.payrollService.getTotalGratuityAmountByUser(userId).subscribe({
      next: (res: any) => {
        this.statutoryBenefitForm.patchValue({ GratuityAmount: res.data });
      },
      error: () => {
        this.toast.error(this.translate.instant('payroll.failed_to_fetch_gratuity_amount'), this.translate.instant('payroll.error'));
      }
    });
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

  editStatutoryBenefit(benefit: any): void {
    this.isEdit = true;
    this.selectedStatutoryBenefit = benefit;
    this.selectedFNFUser = benefit.payrollFNFUser; // Store for submission

    this.statutoryBenefitForm.patchValue({
      payrollFNFUser: benefit.userName,
      GratuityAmount: benefit.GratuityAmount,
      ProvidentFundAmount: benefit.ProvidentFundAmount,
      ProvidentFundPaymentProcess: benefit.ProvidentFundPaymentProcess,
      IsProvidentFundWithdrawFormSubmitted: benefit.IsProvidentFundWithdrawFormSubmitted
    });

    this.statutoryBenefitForm.get('payrollFNFUser')?.disable();
    this.getTotalPFAmountByUser(benefit.payrollFNFUser);
    this.getTotalGratuityAmountByUser(benefit.payrollFNFUser);
    this.openDialog(true);
  }

  onSubmit(): void {
    this.statutoryBenefitForm.get('payrollFNFUser')?.enable();

    const matchedUser = this.selectedFnF.userList.find(
      (user: any) => user.user === this.selectedFNFUser
    );
    const payrollFNFUserId = matchedUser ? matchedUser._id : this.selectedStatutoryBenefit?.payrollFNFUser;

    const payload = {
      ...this.statutoryBenefitForm.getRawValue(),
      payrollFNFUser: payrollFNFUserId
    };

    if (this.statutoryBenefitForm.valid) {
      const request$ = this.isEdit
        ? this.payrollService.updateFnFStatutoryBenefit(this.selectedStatutoryBenefit._id, payload)
        : this.payrollService.addFnFStatutoryBenefit(payload);

      request$.subscribe({
        next: () => {
          this.fetchStatutoryBenefits(this.selectedFnF).subscribe((data) => {
            this.statutoryBenefits.data = data;
          });
          this.resetForm();
          if (this.isEdit) {
            this.toast.success(this.translate.instant('payroll.statutory_updated'), this.translate.instant('payroll.successfully'));
          }
          else {
            this.toast.success(this.translate.instant('payroll.statutory_added'), this.translate.instant('payroll.successfully'));
          }
          this.isEdit = false;
          this.dialog.closeAll();
        },
        error: () => {
          if (this.isEdit) {
            this.toast.error(this.translate.instant('payroll.failed_update_statutory'), this.translate.instant('payroll.error'));
          }
          else {
            this.toast.error(this.translate.instant('payroll.failed_add_statutory'), this.translate.instant('payroll.error'));
          }
        }
      });
    } else {
      this.statutoryBenefitForm.markAllAsTouched();
    }
  }

  resetForm(): void {
    this.statutoryBenefitForm.reset({
      payrollFNFUser: '',
      GratuityAmount: 0,
      ProvidentFundAmount: 0,
      ProvidentFundPaymentProcess: '',
      IsProvidentFundWithdrawFormSubmitted: false
    });
  }

  onCancel(): void {
    this.isEdit = false;
    this.resetForm();
    this.dialog.closeAll();
  }

  onAction(event: any): void {
    switch (event.action.label) {
      case this.translate.instant('payroll.edit'):
        this.editStatutoryBenefit(event.row);
        break;
      case this.translate.instant('payroll.delete'):
        this.deleteFnF(event.row._id);
        break;
    }
  }

  deleteFnF(id: string): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, { width: '400px' });
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'delete') {
        this.payrollService.deleteFnFStatutoryBenefit(id).subscribe({
          next: () => {
            this.fetchStatutoryBenefits(this.selectedFnF).subscribe((data) => {
              this.statutoryBenefits.data = data;
            });
            this.toast.success(this.translate.instant('payroll.statutory_deleted'), this.translate.instant('payroll.successfully'));
          },
          error: () => {
            this.toast.error(this.translate.instant('payroll.failed_statutory_delete'), this.translate.instant('payroll.error'));
          }
        });
      }
    });
  }
}