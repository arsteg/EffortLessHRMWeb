import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
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
  displayedColumns: string[] = ['payrollUser', 'statutoryBenefit', 'benefitAmount', 'status', 'finalSettlementAmount', 'fnfClearanceStatus', 'fnfDate', 'actions'];
  statutoryBenefits = new MatTableDataSource<any>();
  fnfStep6Form: FormGroup;
  selectedStatutoryBenefit: any;
  userList: any[] = [];
  fnfUsers: any;
  isEdit: boolean = false;
  isStep: boolean;

  @ViewChild('dialogTemplate') dialogTemplate: TemplateRef<any>;

  constructor(private fb: FormBuilder,
    private payrollService: PayrollService,
    private commonService: CommonService,
    public dialog: MatDialog,
    private toast: ToastrService) {
    this.fnfStep6Form = this.fb.group({
      payrollFNFUser: ['', Validators.required],
      statutoryBenefit: ['', Validators.required],
      benefitAmount: [0, Validators.required],
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
      this.isStep = fnfPayroll?.isSteps;
      if (fnfPayroll) {
        setTimeout(() => {
          this.fetchStatutoryBenefits(fnfPayroll);
        }, 1000);
      }
    });
  }

  onUserChange(fnfUserId: string): void {
    console.log('fnf payroll users: ', fnfUserId);
    this.payrollService.selectedFnFPayroll.subscribe((fnfPayroll: any) => {
      const fnfUser = fnfPayroll.userList[0].user;

      this.payrollService.getFnFStatutoryBenefitByPayrollFnFUser(fnfUserId).subscribe((res: any) => {
        this.statutoryBenefits.data = res.data;
        this.statutoryBenefits.data.forEach((benefit: any) => {
          const user = this.userList.find(user => user._id === fnfUser);
          console.log(user);
          benefit.userName = user ? `${user.firstName} ${user.lastName}` : 'Unknown User';
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

  editStatutoryBenefit(benefit: any): void {
    this.isEdit = true;
    this.selectedStatutoryBenefit = benefit;
    this.fnfStep6Form.patchValue({
      payrollFNFUser: benefit.payrollFNFUser,
      statutoryBenefit: benefit.statutoryBenefit,
      benefitAmount: benefit.benefitAmount,
      status: benefit.status,
      finalSettlementAmount: benefit.finalSettlementAmount,
      fnfClearanceStatus: benefit.fnfClearanceStatus,
      fnfDate: benefit.fnfDate
    });

    this.openDialog(true);
  }

  onSubmit(): void {
    if (this.fnfStep6Form.valid) {
      const payload = this.fnfStep6Form.value;
      if (this.selectedStatutoryBenefit) {
        this.payrollService.updateFnFStatutoryBenefit(this.selectedStatutoryBenefit._id, payload).subscribe(
          (res: any) => {
            this.toast.success('Statutory Benefit updated successfully', 'Success');
            this.dialog.closeAll();
            this.fetchStatutoryBenefits(this.selectedStatutoryBenefit.fnfPayrollId);
          },
          (error: any) => {
            this.toast.error('Failed to update Statutory Benefit', 'Error');
          }
        );
      } else {
        this.payrollService.addFnFStatutoryBenefit(payload).subscribe(
          (res: any) => {
            this.toast.success('Statutory Benefit added successfully', 'Success');
            this.dialog.closeAll();
            this.fetchStatutoryBenefits(payload.fnfPayrollId);
          },
          (error: any) => {
            this.toast.error('Failed to add Statutory Benefit', 'Error');
          }
        );
      }
    } else {
      this.fnfStep6Form.markAllAsTouched();
    }
  }

  onCancel(): void {
    if (this.isEdit && this.selectedStatutoryBenefit) {
      this.fnfStep6Form.patchValue({
        payrollFNFUser: this.selectedStatutoryBenefit.payrollFNFUser,
        statutoryBenefit: this.selectedStatutoryBenefit.statutoryBenefit,
        benefitAmount: this.selectedStatutoryBenefit.benefitAmount,
        status: this.selectedStatutoryBenefit.status,
        finalSettlementAmount: this.selectedStatutoryBenefit.finalSettlementAmount,
        fnfClearanceStatus: this.selectedStatutoryBenefit.fnfClearanceStatus,
        fnfDate: this.selectedStatutoryBenefit.fnfDate
      });
    } else {
      this.fnfStep6Form.reset();
    }
  }

  deleteStatutoryBenefit(_id: string) {
    this.payrollService.deleteFnFStatutoryBenefit(_id).subscribe((res: any) => {
      this.toast.success('Statutory Benefit Deleted', 'Success');
      this.fetchStatutoryBenefits(this.selectedStatutoryBenefit.fnfPayrollId);
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

  fetchStatutoryBenefits(fnfPayroll: any): void {
    this.payrollService.getFnFStatutoryBenefitByPayrollFnF(fnfPayroll?._id).subscribe(
      (res: any) => {
        this.statutoryBenefits.data = res.data;
        this.statutoryBenefits.data.forEach((benefit: any, index: number) => {
          const user = this.userList.find(user => user._id === fnfPayroll.userList[index].user);
          benefit.userName = user ? `${user.firstName} ${user.lastName}` : 'Unknown User';
        });
      },
      (error: any) => {
        this.toast.error('Failed to fetch Statutory Benefits', 'Error');
      }
    );
  }

  getUserName(userId: string): string {
    const user = this.userList.find(user => user._id === userId);
    return user ? `${user.firstName} ${user.lastName}` : 'Unknown User';
  }
}

