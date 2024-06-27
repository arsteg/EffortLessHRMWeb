import { Component, Output, EventEmitter, Input } from '@angular/core';
import { ExpensesService } from 'src/app/_services/expenses.service';

@Component({
  selector: 'app-view-expense-report-expenses',
  templateUrl: './view-expense-report-expenses.component.html',
  styleUrl: './view-expense-report-expenses.component.css'
})
export class ViewExpenseReportExpensesComponent {
  @Output() close: any = new EventEmitter();
  @Input() expense: any;
  expenseReportExpense: any;
  category: any;

  constructor(private expenseService: ExpensesService) { }

  ngOnInit() {
    let id = this.expenseService.report.getValue()._id;
    this.expenseService.getExpenseReportExpensesById(id).subscribe(res => {
      this.expenseReportExpense = res.data;
      console.log('Expense report expenses: ',this.expenseReportExpense)
    });
    this.getCategory();
  }

  getCategory() {
    let category = this.expenseService.report.getValue().expenseCategory
    this.expenseService.getExpenseCategoryById(category).subscribe(res => {
      this.category = res.data;
      console.log(this.category);
    })
  }

  closeModal() {
    this.close.emit(true);
  }

}
