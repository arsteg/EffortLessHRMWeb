import { Component, Output, EventEmitter, Input } from '@angular/core';
import { CommonService } from 'src/app/_services/common.Service';
import { CreateReportComponent } from '../create-report/create-report.component';
import {  MatDialog } from '@angular/material/dialog';
import { ExpensesService } from 'src/app/_services/expenses.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-add-expense-report',
  templateUrl: './add-expense-report.component.html',
  styleUrl: './add-expense-report.component.css'
})
export class AddExpenseReportComponent {
  users: any = [];
  @Output() close: any = new EventEmitter();
  @Input() changeMode: string;
  addExpenseForm: FormGroup;
  expenseReport: any[];
  @Output() updateExpenseReportTable: EventEmitter<void> = new EventEmitter<void>();
  isEdit: boolean;
  category: any;
  expenseReportExpenses: any[] = [];
  selectedExpenseReportExpense: any;
  allCategories: any;
  noCategoryError: boolean;
  validations: any;

  constructor(private dialog: MatDialog,
    private commonService: CommonService,
    public expenseService: ExpensesService,
    private fb: FormBuilder,
    private toast: ToastrService,) {

    this.addExpenseForm = this.fb.group({
      employee: [{ value: '', disabled: this.changeMode }, Validators.required],
      title: ['', Validators.required],
      status: [''],
      amount: [''],
      expenseReportExpenses: []
    });
  }

  ngOnInit() {
    this.expenseService.changeMode.next(this.changeMode)
    if (this.changeMode == 'Add') {
      this.addExpenseForm.reset();
    }
    else {
      const {employee, title, amount, status} = this.expenseService.selectedReport.getValue();
      this.addExpenseForm.patchValue({
        employee: employee,
        title: title,
        amount: amount,
        status: status
      });
      this.getExpenseReportExpensesByReportId();
    }
    this.commonService.populateUsers().subscribe((res: any) => {
      this.users = res.data.data;
    });
    this.getCategoryByUser();
    this.getAllCatgeories();
  }

  getAllCatgeories() {
    let payload = {
      next: '',
      skip: ''
    }
    this.expenseService.getExpenseCatgories(payload).subscribe((res: any) => {
      this.allCategories = res.data;
    })
  }
  openSecondModal(isEdit: boolean) {
    this.isEdit = isEdit;
    const dialogRef = this.dialog.open(CreateReportComponent, {
      width: '50%',
      data: { isEdit: this.isEdit }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (this.changeMode == 'Update') {
        const id = this.expenseService.selectedReport.getValue();
        this.expenseService.getExpenseReportExpensesByReportId(id._id).subscribe((res: any) => {
          this.expenseReportExpenses = res.data;
        })
      }
    });
  }

  resetForm() {
    console.log(this.changeMode)
    if (this.changeMode == 'Add') {
      this.expenseReportExpenses = [];
      this.addExpenseForm.reset();
    }
    if (this.changeMode == 'Update') {
      this.addExpenseForm.patchValue({
        employee: this.expenseService.selectedReport.getValue().employee,
        title: this.expenseService.selectedReport.getValue().title,
        amount: this.expenseService.selectedReport.getValue().amount,
        status: this.expenseService.selectedReport.getValue().status
      });
      this.getExpenseReportExpensesByReportId();
    }
  }

  getSelectedExpenseReportExpense(selectedExpenseReportExpense: any) {
    this.expenseService.expenseReportExpId.next(selectedExpenseReportExpense._id)
    this.expenseService.expenseReportExpense.next(selectedExpenseReportExpense);
  }

  closeModal() {
    this.close.emit(true);
  }

  getCategoryByUser() {
    const user = this.addExpenseForm.value.employee;
    this.expenseService.selectedUser.next(user);
    this.noCategoryError = false;
    if (this.changeMode && user) {
      this.expenseService.getExpenseCategoryByUser(user).subscribe((res: any) => {
        this.expenseService.tempAndCat.next(res);
        if(res?.details?.length){
          this.validations = res.details[0];
          this.addExpenseForm.get('amount').setValidators([Validators.max(this.validations.maximumAmountPerExpense)]);
        } else {
          this.addExpenseForm.get('amount').setValidators(null);
        }
        if (!res || res.data == null) {
          this.noCategoryError = true;
        }
      })
    }
  }
  createReport() {
    let payload = {
      employee: this.addExpenseForm.value.employee,
      title: this.addExpenseForm.value.title,
      amount: this.addExpenseForm.value.amount,
      status: 'Level 1 Approval Pending',
      expenseReportExpenses: []
    }
    if (this.expenseService.expenseReportExpense.getValue()) {
      let formArray = this.expenseService.expenseReportExpense.getValue();
      payload.expenseReportExpenses = [formArray];
    }
    if (this.addExpenseForm.valid) {
      if (this.changeMode == 'Add') {
        console.log(payload);
        this.expenseService.addExpensePendingReport(payload).subscribe((res: any) => {
          this.toast.success('Expense Template Applicable Category Added Successfully!');
          this.addExpenseForm.reset();
          this.expenseService.expenseReportExpense.next();
          payload.expenseReportExpenses = [];
          this.expenseReportExpenses = [];
          this.addExpenseForm.value.expenseReportExpenses = [];
          this.expenseService.selectedReport.next(res.data);
          console.log(res.data);
        },
          err => {
            this.toast.error('Expense Template Applicable Category Can not be Added', 'ERROR!');
          }
        )
      }
      else {
        let id = this.expenseService.selectedReport.getValue()._id
        this.expenseService.updateExpenseReport(id, payload).subscribe((res: any) => {
          // this.updateExpenseReportTable.emit();
          this.expenseService.expenseReportExpense.next();
          this.toast.success('Expense Template  Updated Successfully!');
        },
          err => {
            this.toast.error('Expense Template Applicable Category Can not be Updated', 'ERROR!')
          }
        )
      }
    }
    else { this.addExpenseForm.markAllAsTouched(); }
    this.updateExpenseReportTable.emit();
  }

  getCategoryById(categoryId) {
    this.expenseService.getExpenseCategoryById(categoryId).subscribe((res: any) => {
      this.category = res.data.label;
      return this.category
    });
  }

  getCategoryLabel(expenseCategoryId: string): string {
    const matchingCategory = this.allCategories.find(category => category._id === expenseCategoryId);
    return matchingCategory ? matchingCategory.label : '';
  }


  deleteExpenseReportExpense(id: string): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'delete') {
        this.deleteReport(id);
      }
      err => {
        this.toast.error('Can not be Deleted', 'Error!')
      }
    });
  }

  deleteReport(id: string) {
    this.expenseService.deleteExpenseReportExpenses(id).subscribe((res: any) => {
      this.expenseReportExpenses = this.expenseReportExpenses.filter(report => report._id !== id);
      this.ngOnInit();
      this.toast.success('Successfully Deleted!!!', 'Expense Report')
    },
      (err) => {
        this.toast.error('Can not be deleted!')
      })
  }

  getExpenseReportExpensesByReportId() {
    let id = this.expenseService.selectedReport.getValue()._id;
    if (this.changeMode) {
      this.expenseService.getExpenseReportExpensesByReportId(id).subscribe((res: any) => {
        this.expenseReportExpenses = res.data;
      })
    }
  }
}
