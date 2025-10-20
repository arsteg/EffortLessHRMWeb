import { Component, OnInit, ViewChild, TemplateRef, Input } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { PayrollService } from 'src/app/_services/payroll.service';
import { ToastrService } from 'ngx-toastr';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';
import { UserService } from 'src/app/_services/users.service';
import { catchError, forkJoin, map } from 'rxjs';
import { SeparationService } from 'src/app/_services/separation.service';
import { ActionVisibility, TableColumn } from 'src/app/models/table-column';

@Component({
  selector: 'app-step2',
  templateUrl: './step2.component.html',
  styleUrls: ['./step2.component.css']
})
export class FNFStep2Component implements OnInit {
  variablePaySummary = new MatTableDataSource<any>();
  variablePayForm: FormGroup;
  selectedVariablePay: any;
  varAllowances: any;
  varDeductions: any;
  isEdit: boolean = false;

  variableAllowance: any;
  variableDeduction: any;
  selectedFnFUserId: any;
  salary: any;
  months: string[] = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  @Input() settledUsers: any[];
  @Input() isSteps: boolean;
  @Input() selectedFnF: any;
  terminationDetails: any;

  @ViewChild('dialogTemplate') dialogTemplate: TemplateRef<any>;

  columns: TableColumn[] = [
    {
      key: 'userName',
      name: 'Payroll User',
      valueFn: (row) => row.userName
    },
    {
      key: 'variableDeduction',
      name: 'Variable Deduction',
      valueFn: (row) => row.variableDeduction?.label || 'not specified'
    },
    {
      key: 'variableAllowance',
      name: 'Variable Allowance',
      valueFn: (row) => row.variableAllowance?.label || 'not specified'
    },
    {
      key: 'amount',
      name: 'Amount',
      valueFn: (row) => row.amount
    },
    {
      key: 'month',
      name: 'Month',
      valueFn: (row) => row.month
    },
    {
      key: 'year',
      name: 'Year',
      valueFn: (row) => row.year
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

  constructor(private fb: FormBuilder,
    private payrollService: PayrollService,
    public dialog: MatDialog,
    private toast: ToastrService,
    private userService: UserService,
    private separationService: SeparationService) {
    this.variablePayForm = this.fb.group({
      payrollFNFUser: ['', Validators.required],
      variableDeduction: [null],
      variableAllowance: [null],
      amount: [0, Validators.required],
      month: ['', Validators.required],
      year: [0, Validators.required]
    });
  }

  ngOnInit(): void {
    this.getLists();
    forkJoin({
      variablePaySummary: this.fetchVariablePaySummary(this.selectedFnF)
    }).subscribe({
      next: (results) => {
        this.variablePaySummary.data = results.variablePaySummary;
      },
      error: (error) => {
        console.error('An error occurred:', error);
      }
    });

    this.variablePayForm.patchValue({
      month: this.selectedFnF?.month,
      year: this.selectedFnF?.year
    });

    this.variablePayForm.get('variableAllowance')?.valueChanges.subscribe((val) => {
      if (val) {
        this.variablePayForm.get('variableDeduction')?.disable({ emitEvent: false });
      } else {
        this.variablePayForm.get('variableDeduction')?.enable({ emitEvent: false });
      }
      this.triggerProRatedCalculation();
    });

    this.variablePayForm.get('variableDeduction')?.valueChanges.subscribe((val) => {
      if (val) {
        this.variablePayForm.get('variableAllowance')?.disable({ emitEvent: false });
      } else {
        this.variablePayForm.get('variableAllowance')?.enable({ emitEvent: false });
      }
      this.triggerProRatedCalculation();
    });
  }

  getTerminationdetailsByUser() {
    this.separationService.getTerminationByUserId(this.selectedFnFUserId).subscribe((res: any) => {
      this.terminationDetails = res.data[res.data.length - 1];
      const terminationDate = new Date(this.terminationDetails.termination_date);
      const dayOfTermination = terminationDate.getDate();
      this.calculateProRatedAmount(dayOfTermination);
    });
  }

  triggerProRatedCalculation(): void {
    if (this.terminationDetails?.termination_date) {
      const day = new Date(this.terminationDetails.termination_date).getDate();
      this.calculateProRatedAmount(day);
    }
  }

  calculateProRatedAmount(terminationDay: number) {
    const selectedAllowanceKey = this.variablePayForm.get('variableAllowance').value;
    const selectedDeductionKey = this.variablePayForm.get('variableDeduction')?.value;

    const selectedAllowance = this.variableAllowance?.find(a => a.variableAllowance?._id === selectedAllowanceKey);
    const selectedDeduction = this.variableDeduction?.find(d => d.variableDeduction?._id === selectedDeductionKey);
    const allowanceAmount = selectedAllowance?.monthlyAmount || 0;
    const deductionAmount = selectedDeduction?.monthlyAmount || 0;
    const totalVariablePay = allowanceAmount - deductionAmount;
    const terminationDate = new Date(this.terminationDetails.termination_date);
    const totalDaysInMonth = new Date(terminationDate.getFullYear(), terminationDate.getMonth() + 1, 0).getDate();
    const perDayAmount = totalVariablePay / totalDaysInMonth;
    const calculatedProRatedAmount = perDayAmount * terminationDay;
    this.variablePayForm.patchValue({
      amount: Math.round(calculatedProRatedAmount)
    });
  }

  fetchVariablePaySummary(fnfPayroll: any) {
    return this.payrollService.getFnFVariablePaySummary(fnfPayroll?._id).pipe(
      map((res: any) => {
        const variablePayData = res.data.map((item: any) => {
          const matchedUser = this.selectedFnF.userList.find((user: any) => user._id === item.payrollFNFUser);
          item.userName = this.getMatchedSettledUser(matchedUser.user);
          item.userId = matchedUser.user;
          return item;
        });
        return variablePayData;
      }),
      catchError((error) => {
        this.toast.error('Failed to fetch Variable Pay Summary', 'Error');
        throw error;
      })
    );
  }

  onUserChange(fnfUserId: string): void {
    this.variablePayForm.patchValue({
      month: this.selectedFnF.month,
      year: this.selectedFnF.year
    });
    this.variablePayForm.get('year').disable();
    this.variablePayForm.get('month').disable();

    this.selectedFnFUserId = fnfUserId;
    this.getTerminationdetailsByUser();
    this.getSalarydetailsByUser();

    const matchedUser = this.selectedFnF.userList.find((user: any) => user.user === fnfUserId);
    const payrollFNFUserId = matchedUser ? matchedUser._id : null;

    this.payrollService.getFnFVariablePayFnFUserId(payrollFNFUserId).subscribe((res: any) => {
      this.variablePaySummary.data = res.data.map((item: any) => {
        const matchedUser = this.selectedFnF.userList.find((user: any) => user._id === item.payrollFNFUser);
        item.userName = this.getMatchedSettledUser(matchedUser.user);
        return item;
      });
    });
  }

  getLists() {
    let payload = { skip: '', next: '' }

    this.payrollService.getVariableAllowance(payload).subscribe((res: any) => {
      this.varAllowances = res.data;
    });

    this.payrollService.getVariableDeduction(payload).subscribe((res: any) => {
      this.varDeductions = res.data;
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

  editVariablePay(variablePay: any): void {
    this.isEdit = true;
    this.selectedVariablePay = variablePay;
    this.selectedFnFUserId = variablePay.userId;

    this.userService.getSalaryByUserId(this.selectedFnFUserId).subscribe((res: any) => {
      this.salary = res.data[res.data.length - 1];
      this.variableAllowance = this.salary?.variableAllowanceList || [];
      this.variableDeduction = this.salary?.variableDeductionList || [];
      this.variablePayForm.patchValue({
        payrollFNFUser: variablePay.userName,
        variableDeduction: variablePay?.variableDeduction?._id,
        variableAllowance: variablePay?.variableAllowance?._id,
        amount: variablePay.amount,
        month: variablePay.month,
        year: variablePay.year
      });
      this.variablePayForm.get('payrollFNFUser').disable();
      this.openDialog(true);
    });
  }

  onSubmit(): void {
    const allowance = this.variablePayForm.get('variableAllowance')?.value;
    const deduction = this.variablePayForm.get('variableDeduction')?.value;

    if (allowance && deduction) {
      this.toast.error('You can only select either Variable Allowance or Variable Deduction — not both.', 'Validation Error');
      return;
    }

    if (!allowance && !deduction) {
      this.toast.error('Please select either Variable Allowance or Variable Deduction.', 'Validation Error');
      return;
    }

    const matchedUser = this.selectedFnF.userList.find((user: any) => user.user === this.selectedFnFUserId);
    const payrollFNFUserId = matchedUser ? matchedUser._id : null;

    this.variablePayForm.patchValue({
      payrollFNFUser: payrollFNFUserId,
      variableAllowance: allowance || null,
      variableDeduction: deduction || null,
    });

    if (this.variablePayForm.valid) {
      const payload = this.variablePayForm.getRawValue();

      if (!payload.variableAllowance) {
        this.variablePayForm.patchValue({ variableAllowance: null });
      }
      if (!payload.variableDeduction) {
        this.variablePayForm.patchValue({ variableDeduction: null });
      };

      const request$ = this.isEdit
        ? this.payrollService.updateFnFVariablePay(this.selectedVariablePay._id, payload)
        : this.payrollService.addFnFVariablePay(payload);

      request$.subscribe({
        next: () => {
          this.fetchVariablePaySummary(this.selectedFnF).subscribe((data) => {
            this.variablePaySummary.data = data;
          });
          this.toast.success(`Variable Pay ${this.isEdit ? 'updated' : 'added'} successfully`, 'Success');
          this.resetForm();
          this.isEdit = false;
          this.dialog.closeAll();
        },
        error: () => {
          this.toast.error(`Failed to ${this.isEdit ? 'update' : 'add'} Variable Pay`, 'Error');
        }
      });
    } else {
      this.variablePayForm.markAllAsTouched();
    }
    this.selectedVariablePay = null;
    this.isEdit = false;
    this.variablePayForm.get('year').disable();
    this.variablePayForm.get('month').disable();
  }

  resetForm(): void {
    this.variablePayForm.reset({
      payrollFNFUser: '',
      variableDeduction: null,
      variableAllowance: null,
      amount: 0,
      month: this.selectedFnF?.month,
      year: this.selectedFnF?.year
    });
  }

  onCancel(): void {
    this.isEdit = false;
    this.resetForm();
    this.dialog.closeAll();
  }

  onAction(event: any): void {
    switch(event.action.label){
      case 'Edit':
        this.editVariablePay(event.row);
        break;
      case 'Delete':
        this.deleteFnF(event.row._id);
        break;
    }
  }

  deleteVariablePay(_id: string) {
    this.payrollService.deleteFnFVariablePay(_id).subscribe((res: any) => {
      this.toast.success('Variable Pay Deleted', 'Success');
      this.variablePaySummary.data = this.variablePaySummary.data.filter(item => item._id !== _id);
    }, error => {
      this.toast.error('Failed to delete Variable Pay', 'Error');
    });
  }

  deleteFnF(id: string): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, { width: '400px', });
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'delete') { this.deleteVariablePay(id); }
    });
  }

  getMatchedSettledUser(userId: string) {
    const matchedUser = this.settledUsers?.find(user => user?._id == userId)
    return matchedUser ? `${matchedUser?.firstName}  ${matchedUser?.lastName}` : 'Not specified'
  }

  getSalarydetailsByUser() {
    this.userService.getSalaryByUserId(this.selectedFnFUserId).subscribe((res: any) => {
      this.salary = res.data[res.data.length - 1];
      this.variableAllowance = this.salary.variableAllowanceList;
      this.variableDeduction = this.salary.variableDeductionList;
    })
  }
}