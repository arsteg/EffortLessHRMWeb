import { Component } from '@angular/core';

@Component({
  selector: 'app-pending-team-expenses',
  templateUrl: './pending-team-expenses.component.html',
  styleUrl: './pending-team-expenses.component.css'
})
export class PendingTeamExpensesComponent {
  actionOptions = {
    approve: true,
    reject: true,
    view: true,
    cancel: false,
    edit: false,
  };
}