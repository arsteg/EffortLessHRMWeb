import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-attendance-management-settings',
  templateUrl: './attendance-management-settings.component.html',
  styleUrls: ['./attendance-management-settings.component.css']
})
export class AttendanceManagementSettingsComponent implements OnInit {
selectedTab: number = 1;
  view:string="";

  constructor() { }

  ngOnInit(): void {
    this.view ='admin';
  }
  selectTab(tabIndex: number) {
    console.log(this.selectedTab)
    this.selectedTab = tabIndex;
  }
}
