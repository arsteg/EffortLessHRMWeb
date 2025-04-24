import { Component, OnInit, ViewChild, TemplateRef, Input } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { PayrollService } from 'src/app/_services/payroll.service';
import { ToastrService } from 'ngx-toastr';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';
import { CommonService } from 'src/app/_services/common.Service';
import { UserService } from 'src/app/_services/users.service';

@Component({
  selector: 'app-step4',
  templateUrl: './step4.component.html',
  styleUrl: './step4.component.css'
})
export class FNFStep4Component implements OnInit {
  displayedColumns: string[] = ['userName', 'terminationDate', 'noticePeriod', 'gratuityEligible', 'yearsOfService', 'gratuityAmount', 'severancePay', 'outplacementServices', 'status', 'actions'];
  terminationCompensation = new MatTableDataSource<any>();
  terminationCompensationForm: FormGroup;
  selectedTerminationCompensation: any;
  userList: any[] = [];
  fnfUsers: any;
  selectedFNFUser: any;
  isEdit: boolean = false;
  @Input() settledUsers: any[];
  @Input() isSteps: boolean;
  @Input() selectedFnF: any;

  @ViewChild('dialogTemplate') dialogTemplate: TemplateRef<any>;

  constructor(private fb: FormBuilder,
    private payrollService: PayrollService,
    public dialog: MatDialog,
    private toast: ToastrService,
    private userService: UserService) {
    this.terminationCompensationForm = this.fb.group({
      payrollFNFUser: ['', Validators.required],
      terminationDate: [Date, Validators.required],
      noticePeriod: [null, Validators.required],
      gratuityEligible: [0, Validators.required],
      yearsOfService: [0, Validators.required],
      gratuityAmount: [0, Validators.required],
      severancePay: [0, Validators.required],
      outplacementServices: [0, Validators.required],
      status: ['pending', Validators.required]
    });
  }

  ngOnInit(): void {
    console.log(this.settledUsers)
    this.fetchTerminationCompensation(this.selectedFnF);
  }
  jobInformation: any;
  onUserChange(fnfUserId: string): void {
    this.selectedFNFUser = fnfUserId;
    this.userService.getJobInformationByUserId(fnfUserId).subscribe((res: any) => {
      this.jobInformation = res.data;
      this.selectedFNFUser = this.fnfUsers[0]._id;
      this.terminationCompensationForm.patchValue({
        noticePeriod: this.fnfUsers[0].noticePeriod,
      });
    });
    // const fnfUser = this.selectedFnF.userList[0].user;

    // this.payrollService.getFnFTerminationCompensationByPayrollFnFUser(fnfUserId).subscribe((res: any) => {
    //   this.terminationCompensation.data = res.data;
    //   this.terminationCompensation.data.forEach((compensation: any) => {
    //     const user = this.userList.find(user => user._id === fnfUser);
    //     console.log(user);
    //     compensation.userName = user ? `${user.firstName} ${user.lastName}` : 'Unknown User';
    //   });
    // });
  }

  openDialog(isEdit: boolean): void {
    this.isEdit = isEdit;
    if (!this.isEdit) {
      this.terminationCompensationForm.reset({
        payrollFNFUser: '',
        terminationDate: '',
        noticePeriod: 0,
        gratuityEligible: 0,
        yearsOfService: 0,
        gratuityAmount: 0,
        severancePay: 0,
        outplacementServices: 0,
        status: 'pending'
      });
    }
    this.dialog.open(this.dialogTemplate, {
      width: '50%',
      panelClass: 'custom-dialog-container',
      disableClose: true
    });
  }

  editTerminationCompensation(compensation: any): void {
    this.isEdit = true;
    this.selectedTerminationCompensation = compensation;
    this.terminationCompensationForm.patchValue({
      payrollFNFUser: compensation.userName,
      terminationDate: compensation.terminationDate,
      noticePeriod: compensation.noticePeriod,
      gratuityEligible: compensation.gratuityEligible,
      yearsOfService: compensation.yearsOfService,
      gratuityAmount: compensation.gratuityAmount,
      severancePay: compensation.severancePay,
      outplacementServices: compensation.outplacementServices,
      status: compensation.status
    });
    this.terminationCompensationForm.get('payrollFNFUser').disable();
    this.openDialog(true);
  }

  onSubmit(): void {
    const matchedUser = this.selectedFnF.userList.find((user: any) => user?.user === this.selectedFNFUser);
    const payrollFNFUserId = matchedUser ? matchedUser._id : null;

    this.terminationCompensationForm.patchValue({
      payrollFNFUser: payrollFNFUserId
    })
    if (this.terminationCompensationForm.valid) {
      this.terminationCompensationForm.get('payrollFNFUser').enable();
      if (this.selectedTerminationCompensation || this.isEdit) {
        this.terminationCompensationForm.patchValue({
          payrollFNFUser: this.selectedTerminationCompensation.payrollFNFUser,
        });

        this.payrollService.updateFnFTerminationCompensation(this.selectedTerminationCompensation._id, this.terminationCompensationForm.value).subscribe(
          (res: any) => {
            this.toast.success('Termination Compensation updated successfully', 'Success');
            this.fetchTerminationCompensation(this.selectedFnF);
            this.terminationCompensationForm.reset({
              payrollFNFUser: '',
              terminationDate: '',
              noticePeriod: 0,
              gratuityEligible: 0,
              yearsOfService: 0,
              gratuityAmount: 0,
              severancePay: 0,
              outplacementServices: 0,
              status: 'pending'
            });
            this.isEdit = false;
            this.dialog.closeAll();
          },
          (error: any) => {
            this.toast.error('Failed to update Termination Compensation', 'Error');
          }
        );
      } else {
        const matchedUser = this.selectedFnF.userList.find((user: any) => user.user === this.selectedFNFUser);
        const payrollFNFUserId = matchedUser ? matchedUser._id : null;

        this.terminationCompensationForm.patchValue({
          payrollFNFUser: payrollFNFUserId
        });

        console.log(this.terminationCompensationForm.value);
        this.payrollService.addFnFTerminationCompensation(this.terminationCompensationForm.value).subscribe(
          (res: any) => {
            this.toast.success('Termination Compensation added successfully', 'Success');
            this.fetchTerminationCompensation(this.selectedFnF);
            this.dialog.closeAll();
          },
          (error: any) => {
            this.toast.error('Failed to add Termination Compensation', 'Error');
          }
        );
      }
    } else {
      this.terminationCompensationForm.markAllAsTouched();
    }
  }

  onCancel(): void {
    if (this.isEdit && this.selectedTerminationCompensation) {
      this.terminationCompensationForm.patchValue({
        payrollFNFUser: this.selectedTerminationCompensation.payrollFNFUser,
        terminationDate: this.selectedTerminationCompensation.terminationDate,
        noticePeriod: this.selectedTerminationCompensation.noticePeriod,
        gratuityEligible: this.selectedTerminationCompensation.gratuityEligible,
        yearsOfService: this.selectedTerminationCompensation.yearsOfService,
        gratuityAmount: this.selectedTerminationCompensation.gratuityAmount,
        severancePay: this.selectedTerminationCompensation.severancePay,
        outplacementServices: this.selectedTerminationCompensation.outplacementServices,
        status: this.selectedTerminationCompensation.status
      });
    } else {
      this.terminationCompensationForm.reset();
    }
  }

  deleteTerminationCompensation(_id: string) {
    this.payrollService.deleteFnFTerminationCompensation(_id).subscribe((res: any) => {
      this.toast.success('Termination Compensation Deleted', 'Success');
      this.fetchTerminationCompensation(this.selectedFnF);
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

  getMatchedSettledUser(userId: string) {
    const matchedUser = this.settledUsers?.find(user => user?._id == userId)
    return matchedUser ? `${matchedUser?.firstName}  ${matchedUser?.lastName}` : 'Not specified'
  }

  fetchTerminationCompensation(fnfPayroll: any): void {
    this.payrollService.getFnFTerminationCompensationByPayrollFnF(fnfPayroll?._id).subscribe(
      (res: any) => {
        this.terminationCompensation.data = res.data;


        this.terminationCompensation.data.forEach((item: any) => {
          const matchedUser = this.selectedFnF.userList.find((user: any) => user._id === item.payrollFNFUser);
          item.userName = this.getMatchedSettledUser(matchedUser.user);
        });
        console.log(this.terminationCompensation.data)

        if (this.isEdit && this.selectedTerminationCompensation) {
          this.terminationCompensationForm.patchValue({
            payrollFNFUser: this.selectedTerminationCompensation.payrollFNFUser,
            ...this.selectedTerminationCompensation
          });
        }
      },
      (error: any) => {
        this.toast.error('Failed to fetch Termination Compensation', 'Error');
      }
    );
  }
}