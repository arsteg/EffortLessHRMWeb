import { Component, EventEmitter, Output } from '@angular/core';
import { ExpensesService } from 'src/app/_services/expenses.service';

@Component({
  selector: 'app-view-my-expense',
  templateUrl: './view-my-expense.component.html',
  styleUrl: './view-my-expense.component.css'
})
export class ViewMyExpenseComponent {
  @Output() close: any = new EventEmitter();
  expenseReport: any;
  allCategory: any;

  constructor(public expenseService: ExpensesService) { }

  ngOnInit() {
    this.getAllCatgeories();
    this.expenseReport = this.expenseService.advanceReport.getValue();
    console.log(this.expenseReport);
  }

  getAllCatgeories(){
    this.expenseService.getExpenseCatgories().subscribe((res: any) => {
      this.allCategory = res.data;
    });
  }
  getCategory(categoryId: string) {
    const matchingCategory = this.allCategory?.find(category => category._id === categoryId);
    return matchingCategory ? `${matchingCategory.label}` : 'Category Not Found';
  }
  closeModal() {
    this.close.emit(true);
  }
}
