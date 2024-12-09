import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-leave-grant',
  templateUrl: './leave-grant.component.html',
  styleUrls: ['./leave-grant.component.css']
})
export class LeaveManagementComponent implements OnInit {
  selectedTab = 1;
  @Input() tab: number;
  constructor() { }

  ngOnInit(): void {
  }
  selectTab(tabIndex: number) {
    this.selectedTab = tabIndex;
  }
}
