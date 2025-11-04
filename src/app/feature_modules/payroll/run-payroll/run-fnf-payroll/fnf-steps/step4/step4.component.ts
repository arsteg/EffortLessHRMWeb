import { Component, OnInit, ViewChild, TemplateRef, Input, inject } from '@angular/core';
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
import { TranslateService } from '@ngx-translate/core';
import { th } from 'date-fns/locale';

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
  private readonly translate = inject(TranslateService);

  columns: TableColumn[] = [
    {
      key: 'userName',
      name: this.translate.instant('payroll.payroll_user_label'),
      valueFn: (row) => row.userName || 'Not specified'
    },
    {
      key: 'terminationDate',
      name: this.translate.instant('payroll.termination_date'),
      valueFn: (row) => new Date(row.terminationDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    },
    {
      key: 'noticePeriod',
      name: this.translate.instant('payroll.notice_period'),
      valueFn: (row) => row.noticePeriod
    },
    {
      key: 'yearsOfService',
      name: this.translate.instant('payroll.years_of_services'),
      valueFn: (row) => row.yearsOfService
    },
    {
      key: 'severancePay',
      name: this.translate.instant('payroll.severance_pay'),
      valueFn: (row) => row.severancePay
    },
    {
      key: 'outplacementServices',
      name: this.translate.instant('payroll.outplacement_services'),
      valueFn: (row) => row.outplacementServices
    },
    {
      key: 'outplacementServicePay',
      name: this.translate.instant('payroll.outplacement_service_pay'),
      valueFn: (row) => row.outplacementServicePay
    },
    {
      key: 'status',
      name: this.translate.instant('payroll.status'),
      valueFn: (row) => row.status
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
        this.toast.error(this.translate.instant('payroll.failed_fetch_job_information'), this.translate.instant('payroll.error'));
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
        this.toast.error(this.translate.instant('payroll.failed_fetched_date_range'), this.translate.instant('payroll.error'));
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
        this.toast.error(this.translate.instant('payroll.failed_fetch_termination_compensation'), this.translate.instant('payroll.error'));
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
    this.selectedFNFUser = compensation.payrollFNFUser;
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
          if(this.isEdit) {
            this.toast.success(this.translate.instant('payroll.termination_compensation_updated'), this.translate.instant('payroll.successfully'));
          } else {
            this.toast.success(this.translate.instant('payroll.termination_compensation_added'), this.translate.instant('payroll.successfully'));
          }
          this.isEdit = false;
          this.dialog.closeAll();
        },
        error: () => {
          if(this.isEdit) {
            this.toast.error(this.translate.instant('payroll.termination_compensation_update_failed'), this.translate.instant('payroll.error'));
          }
          else {
            this.toast.error(this.translate.instant('payroll.termination_compensation_add_failed'), this.translate.instant('payroll.error'));
          }
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
      case this.translate.instant('payroll.edit'):
        this.editTerminationCompensation(event.row);
        break;
      case this.translate.instant('payroll.delete'):
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
        this.toast.success(this.translate.instant('payroll.termination_compensation_deleted'), this.translate.instant('payroll.successfully'));
      },
      error: () => {
        this.toast.error(this.translate.instant('payroll.termination_compensation_delete_failed'), this.translate.instant('payroll.error'));
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
    return matchedUser ? `${matchedUser?.firstName} ${matchedUser?.lastName}` : '';
  }
}