import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { PayrollService } from 'src/app/_services/payroll.service';
import { ToastrService } from 'ngx-toastr';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';
import { CommonService } from 'src/app/_services/common.Service';

@Component({
  selector: 'app-step4',
  templateUrl: './step4.component.html',
  styleUrl: './step4.component.css'
})
export class FNFStep4Component implements OnInit {
  displayedColumns: string[] = ['payrollUser', 'terminationDate', 'noticePeriod', 'gratuityEligible', 'yearsOfService', 'gratuityAmount', 'severancePay', 'retirementBenefits', 'redeploymentCompensation', 'outplacementServices', 'status', 'actions'];
  terminationCompensation = new MatTableDataSource<any>();
  fnfStep3Form: FormGroup;
  selectedTerminationCompensation: any;
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
    this.fnfStep3Form = this.fb.group({
      payrollFNFUser: ['', Validators.required],
      terminationDate: ['2024-12-31', Validators.required],
      noticePeriod: [0, Validators.required],
      gratuityEligible: [0, Validators.required],
      yearsOfService: [0, Validators.required],
      gratuityAmount: [0, Validators.required],
      severancePay: [0, Validators.required],
      retirementBenefits: [0, Validators.required],
      redeploymentCompensation: [0, Validators.required],
      outplacementServices: [0, Validators.required],
      status: ['pending', Validators.required]
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
          this.fetchTerminationCompensation(fnfPayroll);
        }, 1000);
      }
    });
  }

  onUserChange(fnfUserId: string): void {
    console.log('fnf payroll users: ', fnfUserId);
    this.payrollService.selectedFnFPayroll.subscribe((fnfPayroll: any) => {
      const fnfUser = fnfPayroll.userList[0].user;

      this.payrollService.getFnFTerminationCompensationByPayrollFnFUser(fnfUserId).subscribe((res: any) => {
        this.terminationCompensation.data = res.data;
        this.terminationCompensation.data.forEach((compensation: any) => {
          const user = this.userList.find(user => user._id === fnfUser);
          console.log(user);
          compensation.userName = user ? `${user.firstName} ${user.lastName}` : 'Unknown User';
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

  editTerminationCompensation(compensation: any): void {
    this.isEdit = true;
    this.selectedTerminationCompensation = compensation;
    console.log(compensation)
    this.fnfStep3Form.patchValue({
      payrollFNFUser: compensation.payrollFNFUser,
      terminationDate: compensation.terminationDate,
      noticePeriod: compensation.noticePeriod,
      gratuityEligible: compensation.gratuityEligible,
      yearsOfService: compensation.yearsOfService,
      gratuityAmount: compensation.gratuityAmount,
      severancePay: compensation.severancePay,
      retirementBenefits: compensation.retirementBenefits,
      redeploymentCompensation: compensation.redeploymentCompensation,
      outplacementServices: compensation.outplacementServices,
      status: compensation.status
    });

    this.openDialog(true);
  }

  onSubmit(): void {
    if (this.fnfStep3Form.valid) {
      const payload = this.fnfStep3Form.value;
      if (this.selectedTerminationCompensation) {
        this.payrollService.updateFnFTerminationCompensation(this.selectedTerminationCompensation._id, payload).subscribe(
          (res: any) => {
            this.toast.success('Termination Compensation updated successfully', 'Success');
            this.dialog.closeAll();
            this.fetchTerminationCompensation(this.selectedTerminationCompensation.fnfPayrollId);
          },
          (error: any) => {
            this.toast.error('Failed to update Termination Compensation', 'Error');
          }
        );
      } else {
        this.payrollService.addFnFTerminationCompensation(payload).subscribe(
          (res: any) => {
            this.toast.success('Termination Compensation added successfully', 'Success');
            this.dialog.closeAll();
            this.fetchTerminationCompensation(payload.fnfPayrollId);
          },
          (error: any) => {
            this.toast.error('Failed to add Termination Compensation', 'Error');
          }
        );
      }
    } else {
      this.fnfStep3Form.markAllAsTouched();
    }
  }

  onCancel(): void {
    if (this.isEdit && this.selectedTerminationCompensation) {
      this.fnfStep3Form.patchValue({
        payrollFNFUser: this.selectedTerminationCompensation.payrollFNFUser,
        terminationDate: this.selectedTerminationCompensation.terminationDate,
        noticePeriod: this.selectedTerminationCompensation.noticePeriod,
        gratuityEligible: this.selectedTerminationCompensation.gratuityEligible,
        yearsOfService: this.selectedTerminationCompensation.yearsOfService,
        gratuityAmount: this.selectedTerminationCompensation.gratuityAmount,
        severancePay: this.selectedTerminationCompensation.severancePay,
        retirementBenefits: this.selectedTerminationCompensation.retirementBenefits,
        redeploymentCompensation: this.selectedTerminationCompensation.redeploymentCompensation,
        outplacementServices: this.selectedTerminationCompensation.outplacementServices,
        status: this.selectedTerminationCompensation.status
      });
    } else {
      this.fnfStep3Form.reset();
    }
  }

  deleteTerminationCompensation(_id: string) {
    this.payrollService.deleteFnFTerminationCompensation(_id).subscribe((res: any) => {
      this.toast.success('Termination Compensation Deleted', 'Success');
      this.fetchTerminationCompensation(this.selectedTerminationCompensation.fnfPayrollId);
    }, error => {
      this.toast.error('Failed to delete Termination Compensation', 'Error');
    });
  }

  deleteFnF(id: string): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, { width: '400px', });
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'delete') { this.deleteTerminationCompensation(id); }
    });
  }

  fetchTerminationCompensation(fnfPayroll: any): void {
    this.payrollService.getFnFTerminationCompensationByPayrollFnF(fnfPayroll?._id).subscribe(
      (res: any) => {
        this.terminationCompensation.data = res.data;
        this.terminationCompensation.data.forEach((compensation: any, index: number) => {
          const user = this.userList.find(user => user._id === fnfPayroll.userList[index].user);
          compensation.userName = user ? `${user.firstName} ${user.lastName}` : 'Unknown User';
        });
      },
      (error: any) => {
        this.toast.error('Failed to fetch Termination Compensation', 'Error');
      }
    );
  }

  getUserName(userId: string): string {
    const user = this.userList.find(user => user._id === userId);
    return user ? `${user.firstName} ${user.lastName}` : 'Unknown User';
  }
}

