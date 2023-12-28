import { Component } from '@angular/core';

@Component({
  selector: 'app-expense-reports',
  templateUrl: './expense-reports.component.html',
  styleUrl: './expense-reports.component.css'
})
export class ExpenseReportsComponent {
  selectedTab = 1;
  selectTab(tabIndex: number) {
    this.selectedTab = tabIndex;
  }
}
