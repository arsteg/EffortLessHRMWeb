import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ExpensesService } from 'src/app/_services/expenses.service';
import { ViewExpenseReportExpensesComponent } from '../view-expense-report-expenses/view-expense-report-expenses.component';
import { CommonService } from 'src/app/_services/common.Service';

@Component({
  selector: 'app-view-report',
  templateUrl: './view-report.component.html',
  styleUrl: './view-report.component.css'
})
export class ViewReportComponent {
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
    return matchingUser ? `${matchingUser?.firstName} ${matchingUser?.lastName}` : 'User Not Found';
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
    return matchingCategory ? matchingCategory?.label : 'Category Not Found';
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
