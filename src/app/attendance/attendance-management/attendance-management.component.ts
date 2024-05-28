import { Component } from '@angular/core';

@Component({
  selector: 'app-attendance-management',
  templateUrl: './attendance-management.component.html',
  styleUrl: './attendance-management.component.css'
})
export class AttendanceManagementComponent {
  selectedTab: number = 1;
  view = localStorage.getItem('adminView');

  constructor() { }

  ngOnInit(): void {
    console.log(this.view)
  }
  selectTab(tabIndex: number) {
    this.selectedTab = tabIndex;
  }
}
