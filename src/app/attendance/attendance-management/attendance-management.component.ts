import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-attendance-management',
  templateUrl: './attendance-management.component.html',
  styleUrls: ['./attendance-management.component.css']
})
export class AttendanceManagementComponent implements OnInit {
selectedTab: number = 1;
  view:string="";

  constructor() { }

  ngOnInit(): void {
    this.view ='admin';// localStorage.getItem('adminView');
  }
  selectTab(tabIndex: number) {
    this.selectedTab = tabIndex;
  }
}
