import { Component, Output, EventEmitter, Input, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { ExpensesService } from 'src/app/_services/expenses.service';
import { CommonService } from 'src/app/common/common.service';
import { CreateReportComponent } from '../../expense-reports/create-report/create-report.component';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';
import { AuthenticationService } from 'src/app/_services/authentication.service';

@Component({
  selector: 'app-add-my-expense',
  templateUrl: './add-my-expense.component.html',
  styleUrl: './add-my-expense.component.css'
})
export class AddMyExpenseComponent {
  users: any = [];
  @Output() close: any = new EventEmitter();
  changeMode: 'Add' | 'Update' = 'Add';
  addExpenseForm: FormGroup;
  expenseReport: any[];
  @Output() updateExpenseReportTable: EventEmitter<void> = new EventEmitter<void>();
  isEdit: boolean;
  category: any;
  expenseReportExpenses: any;
  selectedExpenseReportExpense: any;
  private updateTableSubscription: Subscription;
  employee: string;
  currentUser = JSON.parse(localStorage.getItem('currentUser'));
  @Input() selectedTab: number;

  constructor(private dialog: MatDialog,
    private commonService: CommonService,
    public expenseService: ExpensesService,
    private fb: FormBuilder,
    private toast: ToastrService,
    private cdr: ChangeDetectorRef,
    private authService: AuthenticationService) {

    this.addExpenseForm = this.fb.group({
      employee: [{ value: '', disabled: this.changeMode }, Validators.required],
      title: ['', Validators.required],
      amount: [Validators.required],
      status: ['', Validators.required],
      expenseReportExpenses: []
    });

  }

  ngOnInit() {
    if (!this.isEdit && !this.changeMode) {
      this.addExpenseForm.reset();
    }
    else {
      this.addExpenseForm.patchValue({
        employee: this.expenseService.selectedReport.getValue().employee,
        title: this.expenseService.selectedReport.getValue().title,
        amount: this.expenseService.selectedReport.getValue.amount
      });
      this.getExpenseReportExpensesByReportId();
    }
    this.commonService.populateUsers().subscribe((res: any) => {
      this.users = res.data.data;
    });
    this.getCategoryByUser();
  }

  // ngAfterViewInit() {
  //   this.updateTableSubscription = this.expenseService.updateTable$.subscribe(() => {
  //     this.getExpenseReportExpensesByReportId();
  //   });
  // }

  // ngOnDestroy() {
  //   this.updateTableSubscription.unsubscribe();
  // }

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
    });
  }

  getSelectedExpenseReportExpense(selectedExpenseReportExpense: any) {
    console.log(selectedExpenseReportExpense)
    this.expenseService.expenseReportExpense.next(selectedExpenseReportExpense);
  }

  closeModal() {
    this.close.emit(true);
  }
  getCategoryByUser() {
    const user = this.currentUser.id;
    this.expenseService.selectedUser.next(user);
    if (this.changeMode == 'Add') {
      this.expenseService.getExpenseCategoryByUser(user).subscribe((res: any) => {
        this.expenseService.tempAndCat.next(res);
        if (!res.data) {
          this.toast.warning('User is not Assigned to any Expense Categories', 'Warning')
        }
      })
    }
  }
  createReport() {
    let payload = {
      employee: this.currentUser.id,
      title: this.addExpenseForm.value.title,
      amount: this.addExpenseForm.value.amount,
      status: 'Level 1 Approval Pending',
      expenseReportExpenses: []
    }
    let formArray = this.expenseService.expenseReportExpense.getValue();
    payload.expenseReportExpenses = [formArray];
    if (this.addExpenseForm.value) {
      if (this.changeMode == 'Add') {
        console.log(payload);
        this.expenseService.addExpensePendingReport(payload).subscribe((res: any) => {
          this.toast.success('Expense Report Added Successfully!');
          this.updateExpenseReportTable.emit();
        },
          err => {
            this.toast.error('Expense Report Can not be Added', 'ERROR!')
          }
        )
      }
      else {
        let id = this.expenseService.selectedReport.getValue()._id
        this.expenseService.updateExpenseReport(id, payload).subscribe((res: any) => {
          this.updateExpenseReportTable.emit();
          this.toast.success('Expense Report Updated Successfully!');
        },
          err => {
            this.toast.error('Expense Report Can not be Updated', 'ERROR!')
          }
        )
      }
    }
    else {
      this.markFormGroupTouched(this.addExpenseForm);
    }
  }

  markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
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
      this.toast.success('Successfully Deleted!!!', 'Expense Report')
    },
      (err) => {
        this.toast.error('Can not be deleted!')
      })
  }

  getExpenseReportExpensesByReportId() {
    let id = this.expenseService.selectedReport.getValue()._id;
    if (this.changeMode == 'Add') { this.expenseReportExpenses = this.expenseService.expenseReportExpense; }
    if (this.changeMode == 'Update') {
      this.expenseService.getExpenseReportExpensesByReportId(id).subscribe((res: any) => {
        this.expenseReportExpenses = res.data;
      })
    }
  }
}
