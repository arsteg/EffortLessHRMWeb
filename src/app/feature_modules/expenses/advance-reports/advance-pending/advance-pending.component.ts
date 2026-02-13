import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-advance-pending',
  templateUrl: './advance-pending.component.html',
  styleUrl: './advance-pending.component.css'
})
export class AdvancePendingComponent implements OnInit {
  currentUserId: string;
  @Input() selectedTab: number;

  ngOnInit() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    this.currentUserId = currentUser?.id || '';
  }
}
