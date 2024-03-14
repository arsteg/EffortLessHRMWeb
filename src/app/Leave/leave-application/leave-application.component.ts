import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-leave-Application',
  templateUrl: './leave-application.component.html',
  styleUrls: ['./leave-application.component.css']
})
export class LeaveApplicationComponent implements OnInit {
  selectedTab = 1;
 
  constructor() { }

  ngOnInit(): void {
  }

  selectTab(tabIndex: number) {
    this.selectedTab = tabIndex;
  }
}