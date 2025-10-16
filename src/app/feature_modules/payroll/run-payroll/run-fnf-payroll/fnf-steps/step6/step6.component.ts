import { Component, OnInit, ViewChild, TemplateRef, Input } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { PayrollService } from 'src/app/_services/payroll.service';
import { ToastrService } from 'ngx-toastr';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';
import { forkJoin, map, catchError } from 'rxjs';

@Component({
  selector: 'app-step6',
  templateUrl: './step6.component.html',
  styleUrls: ['./step6.component.css']
})
export class FNFStep6Component implements OnInit {
  displayedColumns: string[] = [
    'userName',
    'GratuityAmount',
    'ProvidentFundAmount',
    'ProvidentFundPaymentProcess',
    'IsProvidentFundWithdrawFormSubmitted',
    'actions'
  ];

  statutoryBenefits = new MatTableDataSource<any>();
  statutoryBenefitForm: FormGroup;
  selectedStatutoryBenefit: any;
  isEdit: boolean = false;
  selectedFNFUser: any;

  @Input() settledUsers: any[] = [];
  @Input() isSteps: boolean = false;
  @Input() selectedFnF: any;

  @ViewChild('dialogTemplate') dialogTemplate: TemplateRef<any>;

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
    // 👇 Auto fetch on load
    forkJoin({
      statutoryBenefits: this.fetchStatutoryBenefits(this.selectedFnF)
    }).subscribe({
      next: (results) => {
        this.statutoryBenefits.data = results.statutoryBenefits;
      },
      error: (error) => {
        console.error('Error while loading statutory benefits:', error);
      }
    });

    // Reset form on init (like step 2)
    this.resetForm();
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

  fetchStatutoryBenefits(fnfPayroll: any) {
    return this.payrollService.getFnFStatutoryBenefitByPayrollFnF(fnfPayroll?._id).pipe(
      map((res: any) => {
        const data = res.data.map((item: any) => {
          const matchedUser = this.selectedFnF.userList.find(
            (user: any) => user._id === item.payrollFNFUser
          );
          item.userName = this.getMatchedSettledUser(matchedUser.user);
          return item;
        });
        return data;
      }),
      catchError((error) => {
        this.toast.error('Failed to fetch Statutory Benefits', 'Error');
        throw error;
      })
    );
  }

  onUserChange(fnfUserId: string): void {
    this.selectedFNFUser = fnfUserId;
    this.getTotalPFAmountByUser(fnfUserId);
    this.getTotalGratuityAmountByUser(fnfUserId);
  }

  getTotalPFAmountByUser(userId: string): void {
    this.payrollService.getTotalPFAmountByUser(userId).subscribe((res: any) => {
      this.statutoryBenefitForm.patchValue({ ProvidentFundAmount: res.data });
    });
  }

  getTotalGratuityAmountByUser(userId: string): void {
    this.payrollService.getTotalGratuityAmountByUser(userId).subscribe((res: any) => {
      this.statutoryBenefitForm.patchValue({ GratuityAmount: res.data });
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

    this.statutoryBenefitForm.patchValue({
      payrollFNFUser: benefit.userName,
      GratuityAmount: benefit.GratuityAmount,
      ProvidentFundAmount: benefit.ProvidentFundAmount,
      ProvidentFundPaymentProcess: benefit.ProvidentFundPaymentProcess,
      IsProvidentFundWithdrawFormSubmitted: benefit.IsProvidentFundWithdrawFormSubmitted
    });

    this.statutoryBenefitForm.get('payrollFNFUser')?.disable();
    this.openDialog(true);
  }

  onSubmit(): void {
    this.statutoryBenefitForm.get('payrollFNFUser')?.enable();

    const matchedUser = this.selectedFnF.userList.find(
      (user: any) => user.user === this.selectedFNFUser
    );
    const payrollFNFUserId = matchedUser ? matchedUser._id : null;

    this.statutoryBenefitForm.patchValue({
      payrollFNFUser: payrollFNFUserId
    });

    const formValue = this.statutoryBenefitForm.value;
    if (this.isEdit) {
      formValue.payrollFNFUser = this.selectedStatutoryBenefit.payrollFNFUser;
    }
    const request$ = this.isEdit
      ? this.payrollService.updateFnFStatutoryBenefit(this.selectedStatutoryBenefit._id, formValue)
      : this.payrollService.addFnFStatutoryBenefit(formValue);

    request$.subscribe({
      next: () => {

        // 🔁 Refresh and reset form just like step 2
        this.fetchStatutoryBenefits(this.selectedFnF).subscribe((data) => {
          this.statutoryBenefits.data = data;
        });
        this.toast.success(
          `Statutory Benefit ${this.isEdit ? 'updated' : 'added'} successfully`,
          'Success'
        );
        this.statutoryBenefitForm.reset();
        this.resetForm();
        this.isEdit = false;
        this.dialog.closeAll();
      },
      error: () => {
        this.toast.error(
          `Failed to ${this.isEdit ? 'update' : 'add'} Statutory Benefit`,
          'Error'
        );
      }
    });
  }

  onCancel(): void {
    this.isEdit = false;
    this.resetForm();
    this.dialog.closeAll();
  }

  deleteFnF(id: string): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, { width: '400px' });
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'delete') {
        this.payrollService.deleteFnFStatutoryBenefit(id).subscribe({
          next: () => {
            this.toast.success('Statutory Benefit Deleted', 'Success');
            this.fetchStatutoryBenefits(this.selectedFnF).subscribe((data) => {
              this.statutoryBenefits.data = data;
            });
          },
          error: () => {
            this.toast.error('Failed to delete Statutory Benefit', 'Error');
          }
        });
      }
    });
  }

  getMatchedSettledUser(userId: string) {
    const matchedUser = this.settledUsers?.find((user) => user?._id === userId);
    return matchedUser ? `${matchedUser.firstName} ${matchedUser.lastName}` : 'Not specified';
  }
}
