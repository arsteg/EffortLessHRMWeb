import { Component } from '@angular/core';

@Component({
  selector: 'app-approved-team-expenses',
  templateUrl: './approved-team-expenses.component.html',
  styleUrl: './approved-team-expenses.component.css'
})
export class ApprovedTeamExpensesComponent {
  actionOptions = {
    approve: false,
    reject: false,
    view: true,
    edit: false,
    cancel: false,
  };
}
