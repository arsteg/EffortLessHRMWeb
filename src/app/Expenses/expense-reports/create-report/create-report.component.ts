import { Component, Output, EventEmitter, Input, Inject, ChangeDetectorRef } from '@angular/core';
import { AddExpenseReportComponent } from '../add-expense-report/add-expense-report.component';

import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { ExpensesService } from 'src/app/_services/expenses.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-create-report',
  templateUrl: './create-report.component.html',
  styleUrl: './create-report.component.css'
})
export class CreateReportComponent {
  @Output() changeStep: any = new EventEmitter();
  @Output() close: any = new EventEmitter();
  categories: any;
  expenseReportform: FormGroup;
  isEdit: boolean;
  formValues: any;
  sharedData: any;
  private sharedDataSubscription: Subscription;
  private refreshSubscription: Subscription;
  bsValue = new Date();
  bsRangeValue: Date[];
  maxDate = new Date();

  constructor(public expenseService: ExpensesService,
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddExpenseReportComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { isEdit: boolean },
    private toast: ToastrService) {
    this.expenseReportform = this.fb.group({
      expenseCategory: [''],
      incurredDate: [],
      amount: [0],
      isReimbursable: [true],
      isBillable: [true],
      reason: [''],
      documentLink: [''],
      expenseReport: ['']
    });
    this.maxDate.setDate(this.maxDate.getDate() + 7);
    this.bsRangeValue = [this.bsValue, this.maxDate];
    }

  ngOnInit() {
    console.log(this.expenseService.expenseReportExpense.getValue())
    if (this.expenseService.isEdit.getValue() == true) {
      this.expenseService.expenseReportExpense.subscribe(res => {
        this.formValues = res;

        this.expenseReportform.patchValue({
          expenseCategory: res.expenseCategory,
          incurredDate: res.incurredDate,
          amount: res.amount,
          isReimbursable: res.isReimbursable,
          isBillable: res.isBillable,
          reason: res.reason,
          documentLink: res.documentLink,
          expenseReport: res._id
        })
      })
    }
    const user = this.expenseService.selectedUser.getValue();


    this.isEdit = this.data ? this.data.isEdit : false;
    this.expenseService.getExpenseCategoryByUser(user).subscribe((res: any) => {
      this.categories = res.data;
    });
  }

  ngOnDestroy() {
    this.sharedDataSubscription.unsubscribe();
    this.refreshSubscription.unsubscribe();
  }

  onSubmission() {
    let payload = {
      expenseCategory: this.expenseReportform.value.expenseCategory,
      incurredDate: this.expenseReportform.value.incurredDate,
      amount: this.expenseReportform.value.amount,
      isReimbursable: this.expenseReportform.value.isReimbursable,
      isBillable: this.expenseReportform.value.isBillable,
      reason: this.expenseReportform.value.reason,
      documentLink: this.expenseReportform.value.documentLink,
      expenseReport: this.expenseReportform.value.expenseReport
    }
    payload.expenseReport = this.expenseService.selectedReport.getValue()._id;
    const expenseReportExpenses = this.expenseService.expenseReportExpense.getValue()._id;
    if (this.expenseService.isEdit.getValue() == true) {
      // update expense report expenses
      this.expenseService.updateExpenseReportExpenses(expenseReportExpenses, payload).subscribe((res: any) => {
        this.expenseService.expenseReportExpense.next(this.expenseReportform.value);
        this.toast.success('Expense Report of Expenses is Updated!', 'Successfully!!!')
      },
        err => {
          this.toast.error('This expense report of expenses can not be Updated!', 'Error')
        })
    }
    else {
      // add new expense report expenses  
      payload.expenseReport = this.expenseService.selectedReport.getValue()._id;
      this.expenseService.addExpenseReportExpenses(payload).subscribe((res: any) => {
        this.expenseService.expenseReportExpense.next(this.expenseReportform.value);
        this.toast.success('Expense Report of Expenses is Created!', 'Successfully!!!')
      },
        err => {
          this.toast.error('This expense report of expenses can not be Added!', 'Error')
        })
    }
    this.expenseService.triggerUpdateTable();
    this.dialogRef.close();
    this.changeStep.emit(1);
  }
  closeModal() {
    this.expenseService.triggerUpdateTable();
    this.close.emit(true);
    this.changeStep.emit(1)
  }

}
