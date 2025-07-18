import { Component } from '@angular/core';

@Component({
  selector: 'app-timeline-management',
  templateUrl: './timeline-management.component.html',
  styleUrls: ['./timeline-management.component.css']
})
export class TimelineManagementComponent {
  selectedTab: number = 1;
  view = localStorage.getItem('adminView');

  ngOnInit(): void {
    this.selectTab(this.selectedTab); 
  }
  selectTab(tabIndex: number) {
    this.selectedTab = tabIndex;
  }
}
