import { Component, OnInit, ViewChild, TemplateRef, Input } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { PayrollService } from 'src/app/_services/payroll.service';
import { ToastrService } from 'ngx-toastr';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';
import { UserService } from 'src/app/_services/users.service';
import { SeparationService } from 'src/app/_services/separation.service';
import { catchError, forkJoin, map } from 'rxjs';
import { ActionVisibility, TableColumn } from 'src/app/models/table-column';

@Component({
  selector: 'app-step4',
  templateUrl: './step4.component.html',
  styleUrls: ['./step4.component.css']
})
export class FNFStep4Component implements OnInit {
  terminationCompensation = new MatTableDataSource<any>();
  terminationCompensationForm: FormGroup;
  selectedTerminationCompensation: any;
  userList: any[] = [];
  selectedFNFUser: any;
  isEdit: boolean = false;
  jobInformation: any;
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
      key: 'terminationDate',
      name: 'Termination/Resigned Date',
      valueFn: (row) => new Date(row.terminationDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    },
    {
      key: 'noticePeriod',
      name: 'Notice Period',
      valueFn: (row) => row.noticePeriod
    },
    {
      key: 'yearsOfService',
      name: 'Years of Service',
      valueFn: (row) => row.yearsOfService
    },
    {
      key: 'severancePay',
      name: 'Severance Pay',
      valueFn: (row) => row.severancePay
    },
    {
      key: 'outplacementServices',
      name: 'Outplacement Services',
      valueFn: (row) => row.outplacementServices
    },
    {
      key: 'outplacementServicePay',
      name: 'Outplacement Services Pay',
      valueFn: (row) => row.outplacementServicePay
    },
    {
      key: 'status',
      name: 'Status',
      valueFn: (row) => row.status
    },
    {
      key: 'actions',
      name: 'Actions',
      isAction: true,
      options: [
        { label: 'Edit', visibility: ActionVisibility.BOTH, icon: 'edit', hideCondition: (row) => false },
        { label: 'Delete', visibility: ActionVisibility.BOTH, icon: 'delete', hideCondition: (row) => false }
      ]
    }
  ];

  constructor(
    private fb: FormBuilder,
    private payrollService: PayrollService,
    private userService: UserService,
    private separationService: SeparationService,
    public dialog: MatDialog,
    private toast: ToastrService
  ) {
    this.terminationCompensationForm = this.fb.group({
      payrollFNFUser: ['', Validators.required],
      terminationDate: [null, Validators.required],
      noticePeriod: [null, Validators.required],
      yearsOfService: [0, Validators.required],
      severancePay: [0, Validators.required],
      outplacementServices: ['', Validators.required],
      outplacementServicePay: [0, Validators.required]
    });
  }

  ngOnInit(): void {
    forkJoin({
      terminationCompensation: this.fetchTerminationCompensation(this.selectedFnF)
    }).subscribe({
      next: (results) => {
        this.terminationCompensation.data = results.terminationCompensation;
      },
      error: (error) => {
        console.error('Error while loading termination compensation:', error);
      }
    });
  }

  getJobInformationByUserId(userId: string): void {
    this.userService.getJobInformationByUserId(userId).subscribe(
      (res: any) => {
        this.jobInformation = res.data;
        this.terminationCompensationForm.patchValue({
          noticePeriod: res.data[0]?.noticePeriod,
          payrollFNFUser: this.getMatchedSettledUser(userId)
        });
        this.tryCalculateYearsOfService();
      },
      (error: any) => {
        this.toast.error('Failed to fetch Job Information', 'Error');
      }
    );

    this.separationService.getFNFDateRangeByUser(userId).subscribe(
      (res: any) => {
        this.terminationCompensationForm.patchValue({
          terminationDate: res.data.endDate ? new Date(res.data.endDate) : null
        });
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
      const diffInMs = end.getTime() - start.getTime();
      const yearsOfService = +(diffInMs / (1000 * 60 * 60 * 24 * 365.25)).toFixed(2);
      this.terminationCompensationForm.patchValue({
        yearsOfService
      });
    }
  }

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

  onPayrollUserChange(fnfUserId: string): void {
    this.selectedFNFUser = fnfUserId;
    const matchedUser = this.selectedFnF.userList.find((user: any) => user.user === fnfUserId);
    const payrollFNFUserId = matchedUser ? matchedUser._id : null;

    if (payrollFNFUserId) {
      this.payrollService.getFnFTerminationCompensationByPayrollFnFUser(payrollFNFUserId).subscribe((res: any) => {
        this.terminationCompensation.data = res.data.map((item: any) => {
          const matchedUser = this.selectedFnF.userList.find((user: any) => user._id === item.payrollFNFUser);
          item.userName = this.getMatchedSettledUser(matchedUser?.user || '');
          return item;
        });
      });
    }
  }

  fetchTerminationCompensation(fnfPayroll: any) {
    return this.payrollService.getFnFTerminationCompensationByPayrollFnF(fnfPayroll?._id).pipe(
      map((res: any) => {
        return res.data.map((item: any) => {
          const matchedUser = this.selectedFnF.userList.find((user: any) => user._id === item.payrollFNFUser);
          item.userName = this.getMatchedSettledUser(matchedUser?.user || '');
          return item;
        });
      }),
      catchError((error) => {
        this.toast.error('Failed to fetch Termination Compensation', 'Error');
        throw error;
      })
    );
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

  editTerminationCompensation(compensation: any): void {
    this.isEdit = true;
    this.selectedTerminationCompensation = compensation;
    this.selectedFNFUser = compensation.payrollFNFUser; // Store for submission
    this.terminationCompensationForm.patchValue({
      payrollFNFUser: compensation.userName,
      terminationDate: compensation.terminationDate ? new Date(compensation.terminationDate) : null,
      noticePeriod: compensation.noticePeriod,
      yearsOfService: compensation.yearsOfService,
      severancePay: compensation.severancePay,
      outplacementServices: compensation.outplacementServices,
      outplacementServicePay: compensation.outplacementServicePay
    });
    this.terminationCompensationForm.get('payrollFNFUser').disable();
    this.openDialog(true);
  }

  onSubmit(): void {
    this.terminationCompensationForm.get('payrollFNFUser')?.enable();

    const matchedUser = this.selectedFnF.userList.find((user: any) => user.user === this.selectedFNFUser);
    const payrollFNFUserId = matchedUser ? matchedUser._id : this.selectedTerminationCompensation?.payrollFNFUser;

    const payload = {
      ...this.terminationCompensationForm.getRawValue(),
      payrollFNFUser: payrollFNFUserId
    };

    if (this.terminationCompensationForm.valid) {
      const request$ = this.isEdit
        ? this.payrollService.updateFnFTerminationCompensation(this.selectedTerminationCompensation._id, payload)
        : this.payrollService.addFnFTerminationCompensation(payload);

      request$.subscribe({
        next: () => {
          this.fetchTerminationCompensation(this.selectedFnF).subscribe((data) => {
            this.terminationCompensation.data = data;
          });
          this.resetForm();
          this.toast.success(`Termination Compensation ${this.isEdit ? 'updated' : 'added'} successfully`, 'Success');
          this.isEdit = false;
          this.dialog.closeAll();
        },
        error: () => {
          this.toast.error(`Failed to ${this.isEdit ? 'update' : 'add'} Termination Compensation`, 'Error');
        }
      });
    } else {
      this.terminationCompensationForm.markAllAsTouched();
    }
  }

  resetForm(): void {
    this.terminationCompensationForm.reset({
      payrollFNFUser: '',
      terminationDate: null,
      noticePeriod: null,
      yearsOfService: 0,
      severancePay: 0,
      outplacementServices: '',
      outplacementServicePay: 0
    });
  }

  onCancel(): void {
    this.isEdit = false;
    this.resetForm();
    this.dialog.closeAll();
  }

  onAction(event: any): void {
    switch (event.action.label) {
      case 'Edit':
        this.editTerminationCompensation(event.row);
        break;
      case 'Delete':
        this.deleteFnF(event.row._id);
        break;
    }
  }

  deleteTerminationCompensation(_id: string) {
    this.payrollService.deleteFnFTerminationCompensation(_id).subscribe({
      next: () => {
        this.fetchTerminationCompensation(this.selectedFnF).subscribe((data) => {
          this.terminationCompensation.data = data;
        });
        this.toast.success('Termination Compensation Deleted', 'Success');
      },
      error: () => {
        this.toast.error('Failed to delete Termination Compensation', 'Error');
      }
    });
  }

  deleteFnF(id: string): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, { width: '400px' });
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'delete') {
        this.deleteTerminationCompensation(id);
      }
    });
  }

  getMatchedSettledUser(userId: string) {
    const matchedUser = this.settledUsers?.find(user => user?._id === userId);
    return matchedUser ? `${matchedUser?.firstName} ${matchedUser?.lastName}` : 'Not specified';
  }
}