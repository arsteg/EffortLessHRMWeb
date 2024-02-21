import { Component } from '@angular/core';

@Component({
  selector: 'app-my-expense-rejected',
  templateUrl: './rejected.component.html',
  styleUrl: './rejected.component.css'
})
export class RejectedMyExpensesComponent {
  actionOptions = {
    approve: false,
    reject: false,
    view: true,
    cancel: false
  };
}
