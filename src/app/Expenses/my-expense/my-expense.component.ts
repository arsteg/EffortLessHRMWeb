import { Component} from '@angular/core';

@Component({
  selector: 'app-my-expense',
  templateUrl: './my-expense.component.html',
  styleUrl: './my-expense.component.css'
})
export class MyExpenseComponent {
  selectedTab = 1;
  selectTab(tabIndex: number) {
    this.selectedTab = tabIndex;
  }
}