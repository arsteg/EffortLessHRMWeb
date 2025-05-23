import { Component, OnInit, ViewChild, TemplateRef, Input } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { PayrollService } from 'src/app/_services/payroll.service';
import { ToastrService } from 'ngx-toastr';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';
import { CommonService } from 'src/app/_services/common.Service';

@Component({
  selector: 'app-step6',
  templateUrl: './step6.component.html',
  styleUrl: './step6.component.css'
})
export class FNFStep6Component implements OnInit {
  displayedColumns: string[] = ['userName', 'GratuityAmount', 'ProvidentFundAmount', 'ProvidentFundPaymentProcess', 'IsProvidentFundWithdrawFormSubmitted', 'actions'];
  statutoryBenefits = new MatTableDataSource<any>();
  statutoryBenefitForm: FormGroup;
  selectedStatutoryBenefit: any;
  fnfUsers: any;
  isEdit: boolean = false;
  @Input() settledUsers: any[];
  // @Input() fnfPayrollRecord: any;
  @Input() isSteps: boolean;
  selectedFNFUser: any;
  @Input() selectedFnF: any;

  @ViewChild('dialogTemplate') dialogTemplate: TemplateRef<any>;

  constructor(private fb: FormBuilder,
    private payrollService: PayrollService,
    public dialog: MatDialog,
    private toast: ToastrService) {
    this.statutoryBenefitForm = this.fb.group({
      payrollFNFUser: ['', Validators.required],
      GratuityAmount: [0, Validators.required],
      ProvidentFundAmount: [0, Validators.required],
      ProvidentFundPaymentProcess: ['', Validators.required],
      IsProvidentFundWithdrawFormSubmitted: [true],
    });
  }

  ngOnInit(): void {
    console.log(this.selectedFnF)
    this.fetchStatutoryBenefits(this.selectedFnF);

  }
  getTotalPFAmountByUser(userId: string) {
    return this.payrollService.getTotalPFAmountByUser(userId).subscribe((res: any) => {
      this.statutoryBenefitForm.patchValue({
        ProvidentFundAmount: res.data
      });
      });
  }
  getTotalGratuityAmountByUser(userId: string) {
    return this.payrollService.getTotalGratuityAmountByUser(userId).subscribe((res: any) => {
      this.statutoryBenefitForm.patchValue({
        GratuityAmount: res.data
      });
      });
  }
  onUserChange(fnfUserId: string): void {  
    this.selectedFNFUser = fnfUserId; 
     this.getTotalPFAmountByUser(this.selectedFNFUser);    
     this.getTotalGratuityAmountByUser(this.selectedFNFUser);    
  }
onPayrollUserChange(fnfUserId: string): void {
    this.selectedFNFUser = fnfUserId;
    const fnfUser = this.selectedFnF.userList[0].user;
    this.payrollService.getFnFStatutoryBenefitByPayrollFnFUser(fnfUserId).subscribe((res: any) => {
      this.statutoryBenefits.data = res.data;
      this.statutoryBenefits.data.forEach((benefit: any) => {
        const user = this.settledUsers.find(user => user._id === fnfUser);
      });
    });
  }
  openDialog(isEdit: boolean): void {
    this.isEdit = isEdit;
    if (!this.isEdit) {
      this.statutoryBenefitForm.reset({
        payrollFNFUser: '',
        GratuityAmount: 0,
        ProvidentFundAmount: 0,
        ProvidentFundPaymentProcess: '',
        IsProvidentFundWithdrawFormSubmitted: false,
      });
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
      IsProvidentFundWithdrawFormSubmitted: benefit.IsProvidentFundWithdrawFormSubmitted,
    });
    this.statutoryBenefitForm.get('payrollFNFUser').disable();
    this.openDialog(true);
  }

  onSubmit(): void {
    this.statutoryBenefitForm.get('payrollFNFUser').enable();

    const matchedUser = this.selectedFnF.userList.find((user: any) => user?.user === this.selectedFNFUser);
    const payrollFNFUserId = matchedUser ? matchedUser._id : null;

    this.statutoryBenefitForm.patchValue({
      payrollFNFUser: payrollFNFUserId
    });

    // if (this.statutoryBenefitForm.valid) {
    // this.statutoryBenefitForm.get('payrollFNFUser').enable();
    if (this.isEdit) {
      this.statutoryBenefitForm.patchValue({ payrollFNFUser: this.selectedStatutoryBenefit.payrollFNFUser });
      this.payrollService.updateFnFStatutoryBenefit(this.selectedStatutoryBenefit._id, this.statutoryBenefitForm.value).subscribe(
        (res: any) => {
          this.toast.success('Statutory Benefit updated successfully', 'Success');
          this.fetchStatutoryBenefits(this.selectedFnF);
          this.statutoryBenefitForm.reset({
            payrollFNFUser: '',
            statutoryBenefit: '',
            benefitAmount: 0,
            status: '',
            finalSettlementAmount: 0,
            fnfClearanceStatus: '',
            fnfDate: ''
          });
          this.isEdit = false;
          this.dialog.closeAll();
        },
        (error: any) => {
          this.toast.error('Failed to update Statutory Benefit', 'Error');
        }
      );
    } else {
      const matchedUser = this.selectedFnF.userList.find((user: any) => user.user === this.selectedFNFUser);
      const payrollFNFUserId = matchedUser ? matchedUser._id : null;

      this.statutoryBenefitForm.patchValue({
        payrollFNFUser: payrollFNFUserId
      });

      this.payrollService.addFnFStatutoryBenefit(this.statutoryBenefitForm.value).subscribe(
        (res: any) => {
          this.toast.success('Statutory Benefit added successfully', 'Success');
          this.fetchStatutoryBenefits(this.selectedFnF);
          this.statutoryBenefitForm.reset({
            payrollFNFUser: '',
            statutoryBenefit: '',
            benefitAmount: 0,
            status: '',
            finalSettlementAmount: 0,
            fnfClearanceStatus: '',
            fnfDate: ''
          });
          this.dialog.closeAll();
        },
        (error: any) => {
          this.toast.error('Failed to add Statutory Benefit', 'Error');
        }
      );
    }
    // } else {
    //   this.statutoryBenefitForm.markAllAsTouched();
    // }
  }

  onCancel(): void {
    if (this.isEdit && this.selectedStatutoryBenefit) {
      this.statutoryBenefitForm.patchValue({
        payrollFNFUser: this.selectedStatutoryBenefit.payrollFNFUser,
        statutoryBenefit: this.selectedStatutoryBenefit.statutoryBenefit,
        benefitAmount: this.selectedStatutoryBenefit.benefitAmount,
        status: this.selectedStatutoryBenefit.status,
        finalSettlementAmount: this.selectedStatutoryBenefit.finalSettlementAmount,
        fnfClearanceStatus: this.selectedStatutoryBenefit.fnfClearanceStatus,
        fnfDate: this.selectedStatutoryBenefit.fnfDate
      });
    } else {
      this.statutoryBenefitForm.reset();
    }
  }

  deleteStatutoryBenefit(_id: string) {
    this.payrollService.deleteFnFStatutoryBenefit(_id).subscribe((res: any) => {
      this.toast.success('Statutory Benefit Deleted', 'Success');
      this.fetchStatutoryBenefits(this.selectedFnF);
    }, error => {
      this.toast.error('Failed to delete Statutory Benefit', 'Error');
    });
  }

  deleteFnF(id: string): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, { width: '400px', });
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'delete') { this.deleteStatutoryBenefit(id); }
    });
  }

  getMatchedSettledUser(userId: string) {
    const matchedUser = this.settledUsers?.find(user => user?._id == userId)
    return matchedUser ? `${matchedUser?.firstName}  ${matchedUser?.lastName}` : 'Not specified'
  }

  fetchStatutoryBenefits(fnfPayroll: any): void {
    this.payrollService.getFnFStatutoryBenefitByPayrollFnF(fnfPayroll?._id).subscribe(
      (res: any) => {
        this.statutoryBenefits.data = res.data;

        this.statutoryBenefits.data.forEach((item: any) => {
          const matchedUser = this.selectedFnF.userList.find((user: any) => user._id === item.payrollFNFUser);
          item.userName = this.getMatchedSettledUser(matchedUser.user);
        });

        if (this.isEdit && this.selectedStatutoryBenefit) {
          this.statutoryBenefitForm.patchValue({
            payrollFNFUser: this.selectedStatutoryBenefit.payrollFNFUser,
            ...this.selectedStatutoryBenefit
          });
        }
      },
      (error: any) => {
        this.toast.error('Failed to fetch Termination Compensation', 'Error');
      }
    );
  }

  getUserName(userId: string): string {
    const user = this.settledUsers.find(user => user._id === userId);
    return user ? `${user.firstName} ${user.lastName}` : 'Unknown User';
  }
}