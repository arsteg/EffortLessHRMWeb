import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-advance-approved',
  templateUrl: './advance-approved.component.html',
  styleUrl: './advance-approved.component.css'
})
export class AdvanceApprovedComponent implements OnInit {
  currentUserId: string;
  @Input() selectedTab: number;

  ngOnInit() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    this.currentUserId = currentUser?.id || '';
  }
}
