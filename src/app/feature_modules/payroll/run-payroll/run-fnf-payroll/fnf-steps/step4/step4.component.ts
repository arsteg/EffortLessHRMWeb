import { Component, OnInit, ViewChild, TemplateRef, Input } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { PayrollService } from 'src/app/_services/payroll.service';
import { ToastrService } from 'ngx-toastr';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';
import { CommonService } from 'src/app/_services/common.Service';
import { UserService } from 'src/app/_services/users.service';
import { SeparationService } from 'src/app/_services/separation.service';

@Component({
  selector: 'app-step4',
  templateUrl: './step4.component.html',
  styleUrl: './step4.component.css'
})
export class FNFStep4Component implements OnInit {
  displayedColumns: string[] = ['userName', 'terminationDate', 'noticePeriod', 'yearsOfService', 'severancePay', 'outplacementServices', 'outplacementServicePay', 'status', 'actions'];
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
    private userService: UserService,
    private separationService: SeparationService ) {
    this.terminationCompensationForm = this.fb.group({
      payrollFNFUser: ['', Validators.required],
      terminationDate: [Date, Validators.required],
      noticePeriod: [null, Validators.required],
      yearsOfService: [0, Validators.required],
      severancePay: [0, Validators.required],
      outplacementServices: ['', Validators.required],
      outplacementServicePay: [0, Validators.required]
    });
  }

  ngOnInit(): void {
    console.log(this.settledUsers)
    this.fetchTerminationCompensation(this.selectedFnF);
  }
  jobInformation: any;
  onUserChange(fnfUserId: string): void {
    this.selectedFNFUser = fnfUserId;
    const matchedUser = this.selectedFnF.userList.find((user: any) => user.user === fnfUserId);
    const payrollFNFUserId = matchedUser ? matchedUser._id : null;

    if (payrollFNFUserId) {
      this.payrollService.getFnFUserById(payrollFNFUserId).subscribe((res: any) => {
         this.getJobInformationByUserId(res.data.user);
        });
    }   
  }
  getJobInformationByUserId(userId: string): void {
    this.userService.getJobInformationByUserId(userId).subscribe(
      (res: any) => {
        this.jobInformation = res.data;
        
        this.terminationCompensationForm.patchValue({
          noticePeriod: res.data[0].noticePeriod,
        });
  
        // Try to calculate years of service if termination date already loaded
        this.tryCalculateYearsOfService();
      },
      (error: any) => {
        this.toast.error('Failed to fetch Job Information', 'Error');
      }
    );
  
    this.separationService.getFNFDateRangeByUser(userId).subscribe(
      (res: any) => {
        this.terminationCompensationForm.patchValue({
          terminationDate: res.data.endDate,
        });
  
        // Try to calculate years of service if job info already loaded
        this.tryCalculateYearsOfService();
      },
      (error: any) => {
        this.toast.error('Failed to fetch FNF Date Range', 'Error');
      }
    );
  }
  tryCalculateYearsOfService(): void {
    const effectiveFrom = this.jobInformation?.[0]?.effectiveFrom;
    const terminationDate = this.terminationCompensationForm.get('terminationDate')?.value;
  
    if (effectiveFrom && terminationDate) {
      const start = new Date(effectiveFrom);
      const end = new Date(terminationDate);
      console.log(end); console.log(start);
      // Calculate total difference in years (rounded down)
      const diffInMs = end.getTime() - start.getTime();
      const yearsOfService = +(diffInMs / (1000 * 60 * 60 * 24 * 365.25)).toFixed(2);
      this.terminationCompensationForm.patchValue({
        yearsOfService
      });
    }
  }
  
  onPayrollUserChange(fnfUserId: string): void {

    const fnfUser = this.selectedFnF.userList[0].user;

     this.payrollService.getFnFTerminationCompensationByPayrollFnFUser(fnfUserId).subscribe((res: any) => {
       this.terminationCompensation.data = res.data;
       this.terminationCompensation.data.forEach((compensation: any) => {
         const user = this.userList.find(user => user._id === fnfUser);
        console.log(user);
         compensation.userName = user ? `${user.firstName} ${user.lastName}` : 'Unknown User';
     });
   });
  }

  openDialog(isEdit: boolean): void {
    this.isEdit = isEdit;
    if (!this.isEdit) {
      this.terminationCompensationForm.reset({
        payrollFNFUser: '',
        terminationDate: '',
        noticePeriod: 0,
        yearsOfService: 0,
        severancePay: 0,
        outplacementServices: '',
        outplacementServicePay: 0
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
      yearsOfService: compensation.yearsOfService,
      severancePay: compensation.severancePay,
      outplacementServices: compensation.outplacementServices,
      outplacementServicePay: compensation.outplacementServicePay});
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
              yearsOfService: 0,
              severancePay: 0,
              outplacementServices: '',
              outplacementServicePay: 0});
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
        yearsOfService: this.selectedTerminationCompensation.yearsOfService,
        severancePay: this.selectedTerminationCompensation.severancePay,
        outplacementServices: this.selectedTerminationCompensation.outplacementServices,
        outplacementServicePay: this.selectedTerminationCompensation.outplacementServicePay
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