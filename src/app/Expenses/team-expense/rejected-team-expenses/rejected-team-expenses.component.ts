import { Component } from '@angular/core';

@Component({
  selector: 'app-rejected-team-expenses',
  templateUrl: './rejected-team-expenses.component.html',
  styleUrl: './rejected-team-expenses.component.css'
})
export class RejectedTeamExpensesComponent {
  actionOptions = {
    approve: false,
    reject: false,
    view: true,
    edit: true,
    cancel: false
  };
  ngOnInit(){
    console.log('test')
  }
}
