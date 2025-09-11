import { Component, Input, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { forkJoin, map } from 'rxjs';
import { CommonService } from 'src/app/_services/common.Service';
import { PayrollService } from 'src/app/_services/payroll.service';
import { UserService } from 'src/app/_services/users.service';
import { ActionVisibility, TableColumn } from 'src/app/models/table-column';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-step-3',
  templateUrl: './step-3.component.html',
  styleUrl: './step-3.component.css'
})
export class Step3Component {
  searchText: string = '';
  variablePayForm: FormGroup;
  @Input() selectedPayroll: any;
  selectedUserId: any;
  variablePay: any;
  varAllowance: any;
  varDeduction: any;
  years: number[] = [];
  selectedYear: number;
  changeMode: 'Add' | 'Update' = 'Update';
  selectedRecord: any;
  payrollUser: any;
  salary: any;
  allUsers: any;
  payrollUsers: any;
  isSubmitted: boolean = false;
  @ViewChild('dialogTemplate') dialogTemplate: TemplateRef<any>;
  columns: TableColumn[] = [
    { key: 'payrollUserDetails', name: 'Employee Name' },
    { key: 'variableAllowance', name: 'Variable Allowance', valueFn: (row) => row.variableAllowance?.label },
    { key: 'variableDeduction', name: 'Variable Deduction', valueFn: (row) => row.variableDeduction?.label },
    { key: 'amount', name: 'Amount', },
    { key: 'period', name: 'Period', valueFn: (row) => `${row.month}-${row.year}` },
    {
      key: 'action', name: 'Action', isAction: true, options: [
        { label: 'Edit', visibility: ActionVisibility.BOTH, icon: 'edit' },
        { label: 'Delete', visibility: ActionVisibility.BOTH, icon: 'delete', cssClass: 'delete-btn' }
      ]
    }
  ]

  months = [
    { name: 'January', value: 1 },
    { name: 'February', value: 2 },
    { name: 'March', value: 3 },
    { name: 'April', value: 4 },
    { name: 'May', value: 5 },
    { name: 'June', value: 6 },
    { name: 'July', value: 7 },
    { name: 'August', value: 8 },
    { name: 'September', value: 9 },
    { name: 'October', value: 10 },
    { name: 'November', value: 11 },
    { name: 'December', value: 12 }
  ];
  selectedPayrollUser: string;


  constructor(private payrollService: PayrollService,
    private fb: FormBuilder,
    private toast: ToastrService,
    private commonService: CommonService,
    private dialog: MatDialog,
    private userService: UserService
  ) {
    this.variablePayForm = this.fb.group({
      payrollUser: ['', Validators.required],
      variableDeduction: [null],
      variableAllowance: [null],
      amount: [0, [Validators.required, Validators.min(0)]],
      month: [0, [Validators.required, Validators.min(1), Validators.max(12)]],
      year: [0, [Validators.required, Validators.min(2000), Validators.max(new Date().getFullYear())]]
    }, {
      validators: this.atLeastOneValidator('variableDeduction', 'variableAllowance')
    })
  }

  atLeastOneValidator(control1: string, control2: string) {
    return (formGroup: FormGroup) => {
      const c1 = formGroup.get(control1);
      const c2 = formGroup.get(control2);

      if (!c1?.value && !c2?.value) {
        return { atLeastOneRequired: true };
      }
      return null;
    };
  }



  ngOnInit() {
    console.log(this.selectedPayroll)
    this.generateYearList();
    this.payrollService.allUsers.subscribe(res => {
      this.allUsers = res;
    });
    this.payrollService.payrollUsers.subscribe(res => {
      this.payrollUsers = res;
    });
    this.getVariableDeductionAndAllowance();
    this.getVariablePayByPayroll();
    this.variablePayForm.get('variableDeduction')?.valueChanges.subscribe(val => {
      const allowanceCtrl = this.variablePayForm.get('variableAllowance');
      if (val) {
        allowanceCtrl?.disable({ emitEvent: false });
      } else {
        allowanceCtrl?.enable({ emitEvent: false });
      }
    });

    this.variablePayForm.get('variableAllowance')?.valueChanges.subscribe(val => {
      const deductionCtrl = this.variablePayForm.get('variableDeduction');
      if (val) {
        deductionCtrl?.disable({ emitEvent: false });
      } else {
        deductionCtrl?.enable({ emitEvent: false });
      }
    });
  }

  onActionClick(event: any) {
    switch (event.action.label) {
      case 'Edit':
        this.changeMode = 'Update';
        this.selectedRecord = event.row;
        this.openDialog();
        break;
      case 'Delete':
        this.selectedRecord = event.row;
        this.deleteDialog(this.selectedRecord._id);
        break;
      default:
        break;
    }
  }

  generateYearList() {
    const currentYear = new Date().getFullYear();
    this.years = [currentYear - 1, currentYear, currentYear + 1];
    this.variablePayForm.value.year = currentYear;
  }

  openDialog() {
    this.variablePayForm.patchValue({
      month: this.selectedPayroll?.month,
      year: this.selectedPayroll?.year
    });
    this.variablePayForm.get('month').disable();
    this.variablePayForm.get('year').disable();
    if (this.changeMode === 'Update') {
      this.payrollService.getPayrollUserById(this.selectedRecord.payrollUser).subscribe((res: any) => {
        this.payrollUser = res.data;
        this.getSalarydetailsByUser();
        const payrollUser = this.payrollUser?.user;
        console.log(this.selectedRecord)
        this.variablePayForm.patchValue({
          payrollUser: this.getUser(payrollUser),
          variableDeduction: this.selectedRecord?.variableDeduction?._id || null,
          variableAllowance: this.selectedRecord?.variableAllowance?._id || null,
          amount: this.selectedRecord?.amount,
          month: this.selectedRecord?.month,
          year: this.selectedRecord?.year
        });
        this.variablePayForm.get('payrollUser').disable();
        this.variablePayForm.get('month').disable();
        this.variablePayForm.get('year').disable();
      });
    }

    this.dialog.open(this.dialogTemplate, {
      width: '600px',
      disableClose: true
    });
  }

  closeDialog() {
    this.isSubmitted = false;
    this.variablePayForm.reset();
    this.variablePayForm.get('payrollUser').enable();
    this.changeMode = 'Update';
    this.dialog.closeAll();
  }

  getSalarydetailsByUser() {
    this.userService.getSalaryByUserId(this.selectedUserId || this.payrollUser?.user).subscribe((res: any) => {
      this.salary = res.data[res.data.length - 1];
    })
  }

  onUserSelectedFromChild(userId: any) {
    this.selectedUserId = userId.value.user;
    this.selectedPayrollUser = userId.value._id;
    if (this.changeMode === 'Add') { this.getSalarydetailsByUser(); }
    if (this.changeMode === 'Update') { this.getVariablePay(); }
  }

  getVariablePay() {
    this.payrollService.getVariablePay(this.selectedRecord?.payrollUser).subscribe((res: any) => {
      this.variablePay = res.data;
      const userRequests = this.variablePay.map((item: any) => {
        const payrollUser = this.payrollUsers?.find((user: any) => user._id === item.payrollUser);
        return {
          ...item,
          payrollUserDetails: payrollUser ? this.getUser(payrollUser.user) : null
        };
      });
      this.variablePay = userRequests
    },
      (error) => {
        this.toast.error("Error fetching Variable Pay:", error);
      }
    );
  }

  getVariablePayByPayroll() {
    this.payrollService.getVariablePayByPayroll(this.selectedPayroll?._id).subscribe((res: any) => {
      this.variablePay = res.data;
      const userRequests = this.variablePay.map((item: any) => {
        const payrollUser = this.payrollUsers?.find((user: any) => user._id === item.payrollUser);
        return {
          ...item,
          payrollUserDetails: payrollUser ? this.getUser(payrollUser.user) : null
        };
      });
      this.variablePay = userRequests
    },
      (error) => {
        this.toast.error("Error fetching attendance summary:", error);
      })
  }

  getVariableDeductionAndAllowance() {
    let payload = { skipe: '', next: '' }
    this.payrollService.getVariableAllowance(payload).subscribe((res: any) => { this.varAllowance = res.data });
    this.payrollService.getVariableDeduction(payload).subscribe((res: any) => { this.varDeduction = res.data });
  }

  getVariableAllowance(templateId: string) {
    const matchingTemp = this.varAllowance?.find(temp => temp._id === templateId);
    return matchingTemp ? matchingTemp.label : '';
  }

  getVariableDeduction(templateId: string) {
    const matchingTemp = this.varDeduction?.find(temp => temp._id === templateId);
    return matchingTemp ? matchingTemp.label : '';
  }

  isDuplicateRecord(): boolean {
    const formValue = this.variablePayForm.value;

    return this.variablePay?.some((record: any) => {
      const sameUser = record.payrollUser?.toString() === formValue.payrollUser?.toString();

      const sameAllowance = record?.variableAllowance?._id?.toString() === formValue?.variableAllowance?.toString();
      const sameDeduction = record?.variableDeduction?._id?.toString() === formValue?.variableDeduction?.toString();

      // Now make the check strict
      if (formValue?.variableAllowance) {
        return sameUser && sameAllowance;
      }
      if (formValue?.variableDeduction) {
        return sameUser && sameDeduction;
      }
      return false;
    }) ?? false;
  }


  onSubmit() {
    this.variablePayForm.get('month').enable();
    this.variablePayForm.get('year').enable();
    this.variablePayForm.get('payrollUser').enable();
    this.variablePayForm.patchValue({
      payrollUser: this.selectedPayrollUser,
      month: this.selectedPayroll.month,
      year: this.selectedPayroll.year
    });
    if (this.variablePayForm.invalid) {
      this.variablePayForm.markAllAsTouched();
      return;
    }
    else {
      this.isSubmitted = true;
      if (this.changeMode == 'Add') {
        if (this.isDuplicateRecord()) {
          this.toast.error('Duplicate record: Variable Allowance or Deduction already exists for this user in this payroll.');
          this.isSubmitted = false;
          return;
        }
        else {
          this.payrollService.addVariablePay(this.variablePayForm.value).subscribe((res: any) => {
            this.variablePay = res.data;
            this.getVariablePayByPayroll();
            this.variablePayForm.reset();
            this.toast.success('Variable Pay Added', 'Successfully!');
            this.changeMode = 'Update'
            this.closeDialog();
          },
            err => {
              this.toast.error('Variable Pay can not be Added', 'Error!');
            });
        }
      }
      if (this.changeMode == 'Update') {
        let id = this.selectedRecord._id;
        this.payrollService.updateVariablePay(id, this.variablePayForm.value).subscribe((res: any) => {
          this.getVariablePayByPayroll();
          this.variablePayForm.reset();
          this.changeMode = 'Update';
          this.toast.success('Variable Pay Updated', 'Successfully!');
          this.closeDialog();
        },
          err => {
            this.toast.error('Variable Pay can not be Updated', 'Error!');
          });
      }
    }
    this.variablePayForm.get('month').disable();
    this.variablePayForm.get('year').disable();
  }

  deleteTemplate(_id: string) {
    this.payrollService.deleteVariablePay(_id).subscribe((res: any) => {
      this.getVariablePay();
      this.toast.success('Successfully Deleted!!!', 'Variable Pay')
    },
      (err) => {
        this.toast.error('This Variable Pay Can not be deleted!')
      })
  }

  deleteDialog(id: string): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'delete') {
        this.deleteTemplate(id);
      }
    });
  }

  getAllUsers() {
    this.commonService.populateUsers().subscribe((res: any) => {
      this.allUsers = res.data.data;
    })
  }

  getUser(employeeId: string) {
    const matchingUser = this.allUsers?.find(user => user?._id === employeeId);
    return matchingUser ? `${matchingUser.firstName} ${matchingUser.lastName}` : 'N/A';
  }

}