import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-leave-Setting',
  templateUrl: './leave-setting.component.html',
  styleUrls: ['./leave-setting.component.css']
})
export class LeaveSettingComponent {
  selectedTab = 1;
  selectTab(tabIndex: number) {
    this.selectedTab = tabIndex;
  }
 }
