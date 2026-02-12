import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-rejected-team-expenses',
  templateUrl: './rejected-team-expenses.component.html',
  styleUrl: './rejected-team-expenses.component.css'
})
export class RejectedTeamExpensesComponent implements OnInit {
  currentUserId: string;

  ngOnInit() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    this.currentUserId = currentUser?.id || '';
  }
}