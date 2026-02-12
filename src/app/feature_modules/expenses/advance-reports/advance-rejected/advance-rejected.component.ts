import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-advance-rejected',
  templateUrl: './advance-rejected.component.html',
  styleUrl: './advance-rejected.component.css'
})
export class AdvanceRejectedComponent implements OnInit {
  currentUserId: string;
  @Input() selectedTab: number;

  ngOnInit() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    this.currentUserId = currentUser?.id || '';
  }
}
