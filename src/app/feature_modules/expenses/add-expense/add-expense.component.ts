import { Component, Output, EventEmitter, Input, inject, Inject } from '@angular/core';
import { CommonService } from 'src/app/_services/common.Service';
import { CreateReportComponent } from '../expense-reports/create-report/create-report.component';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ExpensesService } from 'src/app/_services/expenses.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';
import { TranslateService } from '@ngx-translate/core';
import { CustomValidators } from 'src/app/_helpers/custom-validators';

@Component({
  selector: 'add-expense',
  templateUrl: './add-expense.component.html',
  styleUrls: ['./add-expense.component.css']
})
export class AddExpenseComponent {
  private translate: TranslateService = inject(TranslateService);
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
  isSubmitting: boolean = false;
  hasBeenSubmitted: boolean = false;
  private dialogRef: MatDialogRef<AddExpenseComponent>

  constructor(
    private dialog: MatDialog,
    private commonService: CommonService,
    public expenseService: ExpensesService,
    private fb: FormBuilder,
    private toast: ToastrService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  initForm() {
    this.addExpenseForm = this.fb.group({
      employee: [this.selfExpense ? this.currentUser.id : '', Validators.required],
      title: ['', [Validators.required, Validators.maxLength(30), CustomValidators.labelValidator, CustomValidators.noLeadingOrTrailingSpaces.bind(this)]],
      status: [''],
      amount: [0, [Validators.min(0)]],
      expenseReportExpenses: []
    });
    this.expenseService.changeMode.next(this.changeMode);
    if (this.changeMode !== 'Add') {
      const { employee, title, amount, status } = this.expenseService.selectedReport.getValue();
      this.addExpenseForm.patchValue({
        employee: employee,
        title: title,
        amount: amount,
        status: status
      });
    }
  }

  ngOnInit() {
    this.initForm();
    this.getUsers();
    this.getCategoryByUser();
    this.getAllCatgeories();
    this.addExpenseForm.get('employee').valueChanges.subscribe(() => {
      this.isSubmitting = false;
      this.hasBeenSubmitted = false;
      this.getCategoryByUser();
    });
    this.addExpenseForm.get('title').valueChanges.subscribe(() => {
      this.hasBeenSubmitted = false;
      this.isSubmitting = false;
    });
    this.addExpenseForm.get('amount').valueChanges.subscribe(() => {
      this.hasBeenSubmitted = false;
      this.isSubmitting = false;
    });
  }

  getUsers() {
    this.commonService.populateUsers().subscribe((res: any) => {
      this.users = res.data.data;
    });
  }

  getAllCatgeories() {
    let payload = {
      next: '',
      skip: ''
    };
    this.expenseService.getExpenseCatgories(payload).subscribe((res: any) => {
      this.allCategories = res.data;
    });
  }

  openSecondModal(isEdit: boolean) {
    this.isEdit = isEdit;
    const selectedReport = this.expenseService.selectedReport.getValue();
    if (selectedReport) {
      selectedReport.expenseReportExpense = this.expenseReportExpenses;
      this.expenseService.selectedReport.next(selectedReport);
    }
    const dialogRef = this.dialog.open(CreateReportComponent, {
      width: '50%',
      data: { isEdit: this.isEdit }
    });

    // Subscribe to the expenseReportExpensesEmitter from the second form
    dialogRef.componentInstance.expenseReportExpensesEmitter.subscribe(event => {
      if (event.action === 'add' || event.action === 'update') {
        this.hasBeenSubmitted = false; // Reset submission status to re-enable submit button
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      this.isSubmitting = false;
      const id = this.expenseService.selectedReport.getValue();
      this.expenseService.getExpenseReportExpensesByReportId(id._id).subscribe((res: any) => {
        this.expenseReportExpenses = res.data;
        this.setCalculcatedExpenseAmount();
        if (result === 'close') {
          this.createReport(false);
        }
      });
    });
  }

  resetForm() {
    if (this.changeMode === 'Add') {
      this.expenseReportExpenses = [];
      this.addExpenseForm.reset();
      this.hasBeenSubmitted = false;
    }
    if (this.changeMode === 'Update') {
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
    this.expenseService.expenseReportExpId.next(selectedExpenseReportExpense._id);
    this.expenseService.expenseReportExpense.next(selectedExpenseReportExpense);
  }

  closeModal() {
    this.close.emit(true);
    this.dialogRef.close();
    this.dialog.closeAll(); // Close the dialog
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
          if (this.changeMode !== 'Add') {
            this.getExpenseReportExpensesByReportId();
          }
        }
        if (!res || res.data == null) {
          this.noCategoryError = true;
        }
      });
    }
  }

  createReport(showToaster: boolean = true) {
    if (this.hasBeenSubmitted) {
      console.log('Form has already been submitted.');
      this.closeModal(); // Close the dialog if already submitted
      return;
    }

    this.isSubmitting = true;
    let payload = {
      employee: this.selfExpense ? this.currentUser.id : this.addExpenseForm.value.employee,
      title: this.addExpenseForm.value.title,
      amount: this.addExpenseForm.getRawValue().amount,
      status: 'Level 1 Approval Pending',
      expenseReportExpenses: []
    };
    if (this.expenseService.expenseReportExpense.getValue()) {
      let formArray = this.expenseService.expenseReportExpense.getValue();
      payload.expenseReportExpenses = [formArray];
    }

    if (this.addExpenseForm.valid) {
      if (this.changeMode === 'Add' && !this.reportId) {
        this.expenseService.addExpensePendingReport(payload).subscribe(
          (res: any) => {
            this.expenseService.selectedReport.next(res.data.expenseReport);
            this.reportId = res.data.expenseReport._id;
            if (showToaster) {
              this.toast.success(this.translate.instant('expenses.expense_report_created_success'));
            }
            this.isSubmitting = false;
            this.hasBeenSubmitted = true; 
          },
          err => {
            this.toast.error(this.translate.instant('expenses.expense_report_created_error'));
            this.isSubmitting = false;
          }
        );
      } else {
        let id = this.expenseService.selectedReport.getValue()._id;
        this.expenseService.updateExpenseReport(id, payload).subscribe(
          (res: any) => {
            this.expenseService.selectedReport.next(res.data);
            if (showToaster) {
              this.toast.success(this.translate.instant('expenses.expense_report_updated_success'));
            }
            this.isSubmitting = false;
            this.hasBeenSubmitted = true; // Mark as submitted
          },
          err => {
            this.toast.error(this.translate.instant('expenses.expense_report_updated_error'));
            this.isSubmitting = false;
          }
        );
      }
    } else {
      this.addExpenseForm.markAllAsTouched();
      this.isSubmitting = false;
    }
    this.updateExpenseReportTable.emit();
  }

  getCategoryById(categoryId) {
    this.expenseService.getExpenseCategoryById(categoryId).subscribe((res: any) => {
      this.category = res.data.label;
      return this.category;
    });
  }

  getCategoryLabel(expenseCategoryId: string): string {
    const matchingCategory = this.allCategories?.find(category => category._id === expenseCategoryId);
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
    }, err => {
      this.toast.error(this.translate.instant('expenses.delete_error'));
    });
  }

  deleteReport(id: string) {
    this.expenseService.deleteExpenseReportExpenses(id).subscribe(
      (res: any) => {
        this.expenseReportExpenses = this.expenseReportExpenses.filter(report => report._id !== id);
        this.toast.success(this.translate.instant('expenses.delete_success'));
      },
      (err) => {
        this.toast.error(this.translate.instant('expenses.delete_error'));
      }
    );
  }

  getExpenseReportExpensesByReportId() {
    this.reportId = this.expenseService.selectedReport.getValue()._id;
    if (this.changeMode === 'Update') {
      this.expenseService.getExpenseReportExpensesByReportId(this.reportId).subscribe((res: any) => {
        this.expenseReportExpenses = res.data;
        this.setCalculcatedExpenseAmount();
      });
    }
  }

  setCalculcatedExpenseAmount() {
    if (this.expenseReportExpenses.length > 0 && !this.validations?.expenseTemplate?.advanceAmount) {
      // this.addExpenseForm.get('amount').setValue(0);
      this.addExpenseForm.get('amount').disable();
      this.addExpenseForm.get('amount').updateValueAndValidity();
    } else {
      this.addExpenseForm.get('amount').enable();
      this.addExpenseForm.get('amount').updateValueAndValidity();
    }
  }
}