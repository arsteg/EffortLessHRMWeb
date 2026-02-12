import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-approved-team-expenses',
  templateUrl: './approved-team-expenses.component.html',
  styleUrl: './approved-team-expenses.component.css'
})
export class ApprovedTeamExpensesComponent implements OnInit {
  currentUserId: string;

  ngOnInit() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    this.currentUserId = currentUser?.id || '';
  }
}
