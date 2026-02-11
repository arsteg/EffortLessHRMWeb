import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ExpensesService } from 'src/app/_services/expenses.service';
import { ViewExpenseReportExpensesComponent } from '../view-expense-report-expenses/view-expense-report-expenses.component';
import { CommonService } from 'src/app/_services/common.Service';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-view-report',
  templateUrl: './view-report.component.html',
  styleUrl: './view-report.component.css'
})
export class ViewReportComponent {
  private readonly translate = inject(TranslateService);
  expenseReportExpenses: any;
  selectedReport: any;
  @Input() report: any;
  @Output() close: any = new EventEmitter();
  totalAmount: number = 0;
  closeResult: string = '';
  selectedExpense: any;
  users: any[];
  category: any;

  constructor(private expenseService: ExpensesService,
    private dialog: MatDialog,
    private commonService: CommonService) { }

  ngOnInit() {
    this.expenseService.getExpenseReportExpensesByReportId(this.report._id).subscribe((res: any) => {
      this.expenseReportExpenses = res.data;
    });
    this.getAllUsers();
    this.getCategory();
  }

  getAllUsers() {
    this.commonService.populateUsers().subscribe((res: any) => {
      this.users = res?.data?.data;
    });
  }
  getUser(employeeId: string) {
    const matchingUser = this.users?.find(user => user?._id === employeeId);
    return matchingUser ? `${matchingUser?.firstName} ${matchingUser?.lastName}` : this.translate.instant('expenses.user_not_found');
  }
  getCategory() {
    let payload = {
      next: '',
      skip: ''
    }
    this.expenseService.getExpenseCatgories(payload).subscribe(res => {
      this.category = res.data;
    })
  }

  getCategoryById(categoryId: string) {
    const matchingCategory = this.category?.find(cat => cat?._id === categoryId);
    return matchingCategory ? matchingCategory?.label : this.translate.instant('expenses.category_not_found');
  }

  calculateTotalAmount(): number {
    if (this.expenseReportExpenses && this.expenseReportExpenses.length > 0) {
      return this.expenseReportExpenses.reduce((total, expense) => total + expense.amount, 0);
    }
    return parseFloat(this.report.amount) || 0;
  }

  calculateAdvanceAmount(): number {
    if (this.report.advanceAmountAllowed === false) {
      return 0;
    }
    if (this.expenseReportExpenses && this.expenseReportExpenses.length > 0) {
      const sumItems = this.expenseReportExpenses.reduce((sum, item) => sum + (item.amount || 0), 0);
      if (Math.abs(parseFloat(this.report.amount) - sumItems) > 0.01) {
        return parseFloat(this.report.amount) || 0;
      }
    }
    return 0;
  }

  calculateNetPayable(): number {
    return this.calculateTotalAmount() - this.calculateAdvanceAmount();
  }

  calculateSumOfReimbursableAmounts(): number {
    let sum = 0;
    if (Array.isArray(this.expenseReportExpenses)) {
      for (let report of this.expenseReportExpenses) {
        if (report.isReimbursable) {
          sum += report.amount;
        }
      }
    }
    return sum;
  }

  calculateSumOfBillableAmounts(): number {
    let sum = 0;
    if (Array.isArray(this.expenseReportExpenses)) {
      for (let report of this.expenseReportExpenses) {
        if (report.isBillable) {
          sum += report.amount;
        }
      }
    }
    return sum;
  }

  downloadFile() {
    const fileContent = this.selectedReport.documentLink;
    window.open(fileContent, '_blank');
  }

  closeModal() {
    this.close.emit(true);
  }

  openSecondModal(selectedReport: any): void {
    this.expenseService.report.next(selectedReport);
    this.dialog.open(ViewExpenseReportExpensesComponent, {
      width: '600px',
      data: { report: selectedReport }
    });
  }

  getFileNameFromUrl(url: string): string {
    const urlParts = url.split('/');
    const fileName = urlParts[urlParts.length - 1];
    return fileName;
  }
}
