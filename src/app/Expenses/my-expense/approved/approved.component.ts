import { Component } from '@angular/core';

@Component({
  selector: 'app-my-expense-approved',
  templateUrl: './approved.component.html',
  styleUrl: './approved.component.css'
})
export class ApprovedMyExpensesComponent {
  actionOptions = {
    approve: false,
    reject: false,
    view: true,
    cancel: true
  };
}
