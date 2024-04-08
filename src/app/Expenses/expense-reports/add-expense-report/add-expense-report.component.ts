import { Component, Output, EventEmitter, Input, ChangeDetectorRef } from '@angular/core';
import { CommonService } from 'src/app/common/common.service';
import { CreateReportComponent } from '../create-report/create-report.component';
import {
  MatDialog,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogTitle,
} from '@angular/material/dialog';
import { ExpensesService } from 'src/app/_services/expenses.service';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';
import { Observable, Subscription, map } from 'rxjs';

@Component({
  selector: 'app-add-expense-report',
  templateUrl: './add-expense-report.component.html',
  styleUrl: './add-expense-report.component.css'
})
export class AddExpenseReportComponent {
  users: any = [];
  @Output() close: any = new EventEmitter();
  @Input() changeMode: boolean;
  addExpenseForm: FormGroup;
  expenseReport: any[];
  @Output() updateExpenseReportTable: EventEmitter<void> = new EventEmitter<void>();
  isEdit: boolean;
  category: any;
  expenseReportExpenses: any;
  selectedExpenseReportExpense: any;
  private updateTableSubscription: Subscription;

  constructor(private dialog: MatDialog,
    private commonService: CommonService,
    public expenseService: ExpensesService,
    private fb: FormBuilder,
    private toast: ToastrService,
    private cdr: ChangeDetectorRef) {

    this.addExpenseForm = this.fb.group({
      employee: [{ value: '', disabled: this.changeMode }, Validators.required],
      title: ['', Validators.required],
      status: [''],
      amount: [''],
      expenseReportExpenses: []
    });

  }


  ngOnInit() {
    console.log(this.changeMode);
    if (!this.isEdit && !this.changeMode) {
      this.addExpenseForm.reset();
    }
    else {
      this.addExpenseForm.patchValue({
        employee: this.expenseService.selectedReport.getValue().employee,
        title: this.expenseService.selectedReport.getValue().title,
        amount: this.expenseService.selectedReport.getValue().amount,
        status: this.expenseService.selectedReport.getValue().status
      });
      this.getExpenseReportExpensesByReportId();
    }
    this.commonService.populateUsers().subscribe((res: any) => {
      this.users = res.data.data;
    });
    this.getCategoryByUser();

  }

  ngAfterViewInit() {
    this.updateTableSubscription = this.expenseService.updateTable$.subscribe(() => {
      this.getExpenseReportExpensesByReportId();
    });
  }

  ngOnDestroy() {
    this.updateTableSubscription.unsubscribe();
  }


  openSecondModal(isEdit: boolean) {
    this.expenseService.isEdit.next(isEdit);
    const dialogRef = this.dialog.open(CreateReportComponent, {
      width: '50%',
      data: { isEdit: this.isEdit }
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log(this.expenseService.expenseReportExpense.getValue());
      this.expenseService.expenseReportExpense.subscribe((res: any) => {
        this.expenseReportExpenses.push(res); 
      this.expenseReportExpenses = [...this.expenseReportExpenses];
      });
      this.expenseService.triggerUpdateTable();
    });
  }

  resetForm(){
    this.addExpenseForm.reset();
    this.addExpenseForm.value.expenseReportExpenses = [];
  }

  getSelectedExpenseReportExpense(selectedExpenseReportExpense: any) {
    this.expenseService.expenseReportExpense.next(selectedExpenseReportExpense);
  }

  closeModal() {
    this.close.emit(true);
  }
  getCategoryByUser() {
    const user = this.addExpenseForm.value.employee;
    this.expenseService.selectedUser.next(user);
    if (this.isEdit = false) {
      this.expenseService.getExpenseCategoryByUser(user).subscribe((res: any) => {
        if (!res.data) {
          this.toast.warning('User is not Assigned to any Expense Categories', 'Warning')
        }
      })
    }
  }
  createReport() {
    let payload = {
      employee: this.addExpenseForm.value.employee,
      title: this.addExpenseForm.value.title,
      amount: this.addExpenseForm.value.amount,
      status: this.addExpenseForm.value.status,
      expenseReportExpenses: []
    }
    let formArray = this.expenseService.expenseReportExpense.getValue();
    payload.expenseReportExpenses = [formArray];
    if (this.changeMode = false) {
      console.log(this.changeMode, payload)
      this.expenseService.addExpensePendingReport(payload).subscribe((res: any) => {
        this.toast.success('Expense Template Applicable Category Added Successfully!');
        this.updateExpenseReportTable.emit();
        this.addExpenseForm.reset();
      },
        err => {
          this.toast.error('Expense Template Applicable Category Can not be Added', 'ERROR!')
        }
      )
    }
    else {
      let id = this.expenseService.selectedReport.getValue()._id
      this.expenseService.updateExpenseReport(id, payload).subscribe((res: any) => {
        this.updateExpenseReportTable.emit();
        this.toast.success('Expense Template Applicable Category Updated Successfully!');
      },
        err => {
          this.toast.error('Expense Template Applicable Category Can not be Updated', 'ERROR!')
        }
      )
    }
  }
  getCategoryById(categoryId) {
    this.expenseService.getExpenseCategoryById(categoryId).subscribe((res: any) => {
      this.category = res.data.label;
      return this.category
    });
  }
  getCategoryLabel(expenseCategoryId: string): string {
    const matchingCategory = this.expenseReportExpenses.find(category => category._id === expenseCategoryId);
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