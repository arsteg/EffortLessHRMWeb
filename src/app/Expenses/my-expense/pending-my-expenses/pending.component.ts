import { Component } from '@angular/core';
import { ShowMyExpensesComponent } from '../show-my-expenses/show-my-expenses.component';

@Component({
  selector: 'app-my-expense-pending',
  templateUrl: './pending.component.html',
  styleUrl: './pending.component.css'
})
export class PendingMyExpenseComponent {
  actionOptions = {
    approve: true,
    reject: true,
    view: true,
    cancel: false
  };
}
