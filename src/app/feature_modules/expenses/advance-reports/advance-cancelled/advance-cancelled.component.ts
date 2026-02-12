import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-advance-cancelled',
  templateUrl: './advance-cancelled.component.html',
  styleUrl: './advance-cancelled.component.css'
})
export class AdvanceCancelledComponent implements OnInit {
  currentUserId: string;
  @Input() selectedTab: number;

  ngOnInit() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    this.currentUserId = currentUser?.id || '';
  }
}
