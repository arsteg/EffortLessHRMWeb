import { Component, OnInit, ViewChild, TemplateRef, Input } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { PayrollService } from 'src/app/_services/payroll.service';
import { ToastrService } from 'ngx-toastr';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';
import { UserService } from 'src/app/_services/users.service';
import { catchError, forkJoin, map } from 'rxjs';
import { ActionVisibility, TableColumn } from 'src/app/models/table-column';

@Component({
  selector: 'app-step3',
  templateUrl: './step3.component.html',
  styleUrls: ['./step3.component.css']
})
export class FNFStep3Component implements OnInit {
  manualArrears = new MatTableDataSource<any>();
  manualArrearForm: FormGroup;
  selectedManualArrear: any;
  salaryPerDay: any;
  isEdit: boolean = false;
  selectedFNFUser: any;
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
      key: 'manualArrears',
      name: 'Manual Arrears',
      valueFn: (row) => row.manualArrears
    },
    {
      key: 'arrearDays',
      name: 'Arrear Days',
      valueFn: (row) => row.arrearDays
    },
    {
      key: 'lopReversalDays',
      name: 'LOP Reversal Days',
      valueFn: (row) => row.lopReversalDays
    },
    {
      key: 'salaryRevisionDays',
      name: 'Salary Revision Days',
      valueFn: (row) => row.salaryRevisionDays
    },
    {
      key: 'lopReversalArrears',
      name: 'LOP Reversal Arrears',
      valueFn: (row) => row.lopReversalArrears
    },
    {
      key: 'totalArrears',
      name: 'Total Arrears',
      valueFn: (row) => row.totalArrears
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
    public dialog: MatDialog,
    private toast: ToastrService
  ) {
    this.manualArrearForm = this.fb.group({
      payrollFNFUser: ['', Validators.required],
      manualArrears: [0, Validators.required],
      arrearDays: [0, Validators.required],
      lopReversalDays: [0, Validators.required],
      salaryRevisionDays: [0, Validators.required],
      lopReversalArrears: [{ value: 0, disabled: true }, Validators.required],
      totalArrears: [{ value: 0, disabled: true }, Validators.required]
    });
  }

  ngOnInit(): void {
    forkJoin({
      manualArrears: this.fetchManualArrears(this.selectedFnF)
    }).subscribe({
      next: (results) => {
        this.manualArrears.data = results.manualArrears;
      },
      error: (error) => {
        console.error('Error while loading manual arrears:', error);
      }
    });

    this.manualArrearForm.valueChanges.subscribe(() => {
      this.recalculateFields();
    });
  }

  getDailySalaryByUserId(userId: string): void {
    this.userService.getDailySalaryByUserId(userId).subscribe(
      (res: any) => {
        this.salaryPerDay = res.data;
      },
      (error: any) => {
        this.toast.error('Failed to Load Daily Salary', 'Error');
      }
    );
  }

  recalculateFields(): void {
    const manualArrears = this.manualArrearForm.get('manualArrears')?.value || 0;
    const arrearDays = this.manualArrearForm.get('arrearDays')?.value || 0;
    const lopReversalDays = this.manualArrearForm.get('lopReversalDays')?.value || 0;
    const salaryRevisionDays = this.manualArrearForm.get('salaryRevisionDays')?.value || 0;

    const lopReversalArrears = lopReversalDays * (this.salaryPerDay || 0);
    const totalArrears = manualArrears + ((arrearDays + salaryRevisionDays) * (this.salaryPerDay || 0)) + lopReversalArrears;

    this.manualArrearForm.patchValue({
      lopReversalArrears: lopReversalArrears.toFixed(0),
      totalArrears: totalArrears.toFixed(0)
    }, { emitEvent: false });
  }

  onUserChange(fnfUserId: string): void {
    this.selectedFNFUser = fnfUserId;
    const matchedUser = this.selectedFnF.userList.find((user: any) => user.user === fnfUserId);
    const payrollFNFUserId = matchedUser ? matchedUser._id : null;

    if (payrollFNFUserId) {
      this.payrollService.getFnFUserById(payrollFNFUserId).subscribe((res: any) => {
        this.getDailySalaryByUserId(res.data.user);
        this.manualArrearForm.patchValue({
          payrollFNFUser: this.getMatchedSettledUser(res.data.user)
        });
      });
    }
  }

  onPayrollUserChange(fnfUserId: string): void {
    this.selectedFNFUser = fnfUserId;
    const matchedUser = this.selectedFnF.userList.find((user: any) => user.user === fnfUserId);
    const payrollFNFUserId = matchedUser ? matchedUser._id : null;

    if (payrollFNFUserId) {
      this.payrollService.getFnFManualArrearsByPayrollFnFUser(payrollFNFUserId).subscribe((res: any) => {
        this.manualArrears.data = res.data.map((item: any) => {
          const matchedUser = this.selectedFnF.userList.find((user: any) => user._id === item.payrollFNFUser);
          item.userName = this.getMatchedSettledUser(matchedUser.user);
          return item;
        });
        if (this.isEdit && this.selectedManualArrear) {
          this.manualArrearForm.patchValue({
            payrollFNFUser: this.selectedManualArrear.userName,
            ...this.selectedManualArrear
          });
        }
      });
    }
  }

  fetchManualArrears(fnfPayroll: any) {
    return this.payrollService.getFnFManualArrearsByPayrollFnF(fnfPayroll?._id).pipe(
      map((res: any) => {
        return res.data.map((item: any) => {
          const matchedUser = this.selectedFnF.userList.find((user: any) => user._id === item.payrollFNFUser);
          item.userName = this.getMatchedSettledUser(matchedUser?.user || '');
          return item;
        });
      }),
      catchError((error) => {
        this.toast.error('Failed to fetch Manual Arrears', 'Error');
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

  editManualArrear(manualArrear: any): void {
    this.isEdit = true;
    this.selectedManualArrear = manualArrear;
    this.selectedFNFUser = manualArrear.payrollFNFUser; // Store for submission
    this.manualArrearForm.patchValue({
      payrollFNFUser: manualArrear.userName,
      manualArrears: manualArrear.manualArrears,
      arrearDays: manualArrear.arrearDays,
      lopReversalDays: manualArrear.lopReversalDays,
      salaryRevisionDays: manualArrear.salaryRevisionDays,
      lopReversalArrears: manualArrear.lopReversalArrears,
      totalArrears: manualArrear.totalArrears
    });
    this.manualArrearForm.get('payrollFNFUser').disable();
    this.openDialog(true);
  }

  onSubmit(): void {
    this.manualArrearForm.get('lopReversalArrears')?.enable();
    this.manualArrearForm.get('totalArrears')?.enable();
    this.manualArrearForm.get('payrollFNFUser')?.enable();

    const matchedUser = this.selectedFnF.userList.find((user: any) => user._id === this.selectedFNFUser);
    const payrollFNFUserId = matchedUser ? matchedUser._id : this.selectedManualArrear?.payrollFNFUser;

    const payload = {
      ...this.manualArrearForm.getRawValue(),
      payrollFNFUser: payrollFNFUserId
    };

    if (this.manualArrearForm.valid) {
      const request$ = this.isEdit
        ? this.payrollService.updateFnFManualArrear(this.selectedManualArrear._id, payload)
        : this.payrollService.addFnFManualArrear(payload);

      request$.subscribe({
        next: () => {
          this.fetchManualArrears(this.selectedFnF).subscribe((data) => {
            this.manualArrears.data = data;
          });
          this.resetForm();
          this.toast.success(`Manual Arrear ${this.isEdit ? 'updated' : 'added'} successfully`, 'Success');
          this.isEdit = false;
          this.dialog.closeAll();
        },
        error: () => {
          this.toast.error(`Failed to ${this.isEdit ? 'update' : 'add'} Manual Arrear`, 'Error');
        }
      });
    } else {
      this.manualArrearForm.markAllAsTouched();
    }
  }

  resetForm(): void {
    this.manualArrearForm.reset({
      payrollFNFUser: '',
      manualArrears: 0,
      arrearDays: 0,
      lopReversalDays: 0,
      salaryRevisionDays: 0,
      lopReversalArrears: 0,
      totalArrears: 0
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
        this.editManualArrear(event.row);
        break;
      case 'Delete':
        this.deleteDialog(event.row._id);
        break;
    }
  }

  deleteRecord(_id: string) {
    this.payrollService.deleteFnFManualArrear(_id).subscribe({
      next: () => {
        this.fetchManualArrears(this.selectedFnF).subscribe((data) => {
          this.manualArrears.data = data;
        });
        this.toast.success('Manual Arrear Deleted', 'Success');
      },
      error: () => {
        this.toast.error('Failed to delete Manual Arrear', 'Error');
      }
  });
  }

  deleteDialog(id: string): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'delete') {
        this.deleteRecord(id);
      }
    });
  }

  getMatchedSettledUser(userId: string) {
    const matchedUser = this.settledUsers?.find(user => user?._id === userId);
    return matchedUser ? `${matchedUser?.firstName} ${matchedUser?.lastName}` : 'Not specified';
  }
}