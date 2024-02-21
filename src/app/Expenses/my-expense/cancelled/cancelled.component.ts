import { Component } from '@angular/core';

@Component({
  selector: 'app-my-expense-cancelled',
  templateUrl: './cancelled.component.html',
  styleUrl: './cancelled.component.css'
})
export class CancelledMyExpensesComponent {
  actionOptions = {
    approve: true,
    reject: false,
    view: true,
    cancel: false
  };
}
