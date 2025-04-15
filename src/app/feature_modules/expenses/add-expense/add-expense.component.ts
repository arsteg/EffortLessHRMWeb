import { Component, Output, EventEmitter, Input } from '@angular/core';
import { CommonService } from 'src/app/_services/common.Service';
import { CreateReportComponent } from '../expense-reports/create-report/create-report.component';
import { MatDialog } from '@angular/material/dialog';
import { ExpensesService } from 'src/app/_services/expenses.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'add-expense',
  templateUrl: './add-expense.component.html',
  styleUrl: './add-expense.component.css'
})
export class AddExpenseComponent {
  @Input() changeMode: string;
  @Input() selfExpense: boolean = false;
  @Output() close: any = new EventEmitter();
  @Output() updateExpenseReportTable: EventEmitter<void> = new EventEmitter<void>();
  addExpenseForm: FormGroup;
  expenseReport: any[];
  users: any = [];
  isEdit: boolean;
  category: any;
  expenseReportExpenses: any[] = [];
  selectedExpenseReportExpense: any;
  allCategories: any;
  noCategoryError: boolean;
  validations: any;
  currentUser = JSON.parse(localStorage.getItem('currentUser'));
  reportId = '';

  constructor(private dialog: MatDialog,
    private commonService: CommonService,
    public expenseService: ExpensesService,
    private fb: FormBuilder,
    private toast: ToastrService,) {
   
  }

  initForm(){
    this.addExpenseForm = this.fb.group({
      employee: [this.selfExpense ? this.currentUser.id : '', Validators.required],
      title: ['', Validators.required],
      status: [''],
      amount: [''],
      expenseReportExpenses: []
    });
  }

  ngOnInit() {
    this.initForm();
    this.expenseService.changeMode.next(this.changeMode)
    if (this.changeMode !== 'Add') {
      const { employee, title, amount, status } = this.expenseService.selectedReport.getValue();
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
      const id = this.expenseService.selectedReport.getValue();
      this.expenseService.getExpenseReportExpensesByReportId(id._id).subscribe((res: any) => {
        this.expenseReportExpenses = res.data;
      })
    });
  }

  resetForm() {
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
    this.updateExpenseReportTable.emit();
  }

  getCategoryByUser() {
    const user = this.addExpenseForm.value.employee;
    this.expenseService.selectedUser.next(user);
    this.noCategoryError = false;
    if (this.changeMode && user) {
      this.expenseService.getExpenseCategoryByUser(user).subscribe((res: any) => {
        this.expenseService.tempAndCat.next(res);
        if (res?.details?.length) {
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
      employee: this.selfExpense ? this.currentUser.id : this.addExpenseForm.value.employee,
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
      if (this.changeMode == 'Add' && !this.reportId) {
        this.expenseService.addExpensePendingReport(payload).subscribe((res: any) => {
          this.toast.success('Expense Template Applicable Category Added Successfully!');
          this.expenseService.selectedReport.next(res.data.expenseReport);
          this.reportId = res.data.expenseReport._id;
        },
          err => {
            this.toast.error('Expense Template Applicable Category Can not be Added', 'ERROR!');
          }
        )
      }
      else {
        let id = this.expenseService.selectedReport.getValue()._id
        this.expenseService.updateExpenseReport(id, payload).subscribe((res: any) => {
          this.expenseService.selectedReport.next(res.data.expenseReport);
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
    this.reportId = this.expenseService.selectedReport.getValue()._id;
    if (this.changeMode === 'Update') {
      this.expenseService.getExpenseReportExpensesByReportId(this.reportId).subscribe((res: any) => {
        this.expenseReportExpenses = res.data;
      })
    }
  }
}
