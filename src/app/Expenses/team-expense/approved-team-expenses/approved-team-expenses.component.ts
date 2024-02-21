import { Component } from '@angular/core';

@Component({
  selector: 'app-approved-team-expenses',
  templateUrl: './approved-team-expenses.component.html',
  styleUrl: './approved-team-expenses.component.css'
})
export class ApprovedTeamExpensesComponent {
  actionOptions = {
    approve: true,
    reject: true,
    view: true,
    edit: false,
    cancel: false,
  };
}
