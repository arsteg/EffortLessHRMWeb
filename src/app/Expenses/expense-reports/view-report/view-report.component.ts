import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ExpensesService } from 'src/app/_services/expenses.service';

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

  constructor(private expenseService: ExpensesService) { }

  ngOnInit() {
    this.expenseService.getExpenseReportExpensesByReportId(this.report._id).subscribe((res: any) => {
      this.expenseReportExpenses = res.data;
    })
  }

  calculateTotalAmount(): number {
    let totalAmount = 0;
    if (Array.isArray(this.expenseReportExpenses)) {
      for (let report of this.expenseReportExpenses) {
        if (report && typeof report.amount === 'number') {
          totalAmount += report.amount;
        }
      }
    }
    return totalAmount;
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
    let response = this.selectedReport.documentLink;
    const blob = new Blob([response], { type: 'application/png' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = response;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);

  }
  closeModal() {
    this.close.emit(true);
  }

}
