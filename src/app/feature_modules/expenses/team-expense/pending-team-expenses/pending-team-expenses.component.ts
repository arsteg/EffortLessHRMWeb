import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-pending-team-expenses',
  templateUrl: './pending-team-expenses.component.html',
  styleUrl: './pending-team-expenses.component.css'
})
export class PendingTeamExpensesComponent implements OnInit {
  currentUserId: string;

  ngOnInit() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    this.currentUserId = currentUser?.id || '';
  }
}