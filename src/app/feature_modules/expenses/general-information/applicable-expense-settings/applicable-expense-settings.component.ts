import { Component } from '@angular/core';
import { AuthenticationService } from 'src/app/_services/authentication.service';
import { ExpensesService } from 'src/app/_services/expenses.service';

@Component({
  selector: 'app-applicable-expense-settings',
  templateUrl: './applicable-expense-settings.component.html',
  styleUrl: './applicable-expense-settings.component.css'
})
export class ApplicableExpenseSettingsComponent {
  employeeApplicableSettings: any;
  categories: any;

  constructor(private auth: AuthenticationService,
    private expenseService: ExpensesService) {
  }

  ngOnInit() {
    this.auth.currentUser.subscribe(res => {
      this.expenseService.getEmployeeApplicableSettings(res.id).subscribe((res: any) => {
        this.employeeApplicableSettings = res.data.applicableCategories;
      });
      this.getCategories();
    })
  }

  getCategories() {
    let payload = {
      next: '',
      skip: ''
    }
    this.expenseService.getExpenseCatgories(payload).subscribe((res: any) => {
      this.categories = res.data;
    })
  }

  getCategoryLabel(expenseCategoryId: string): string {
    const matchingCategory = this.categories.find(category => category._id === expenseCategoryId);
    return matchingCategory ? matchingCategory.label : '';
  }
}
