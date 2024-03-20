import { Component } from '@angular/core';

@Component({
  selector: 'app-short-leave',
  templateUrl: './short-leave.component.html',
  styleUrl: './short-leave.component.css'
})
export class ShortLeaveComponent {
  selectedTab: number = 1;
  selectTab(tabIndex: number) {
    this.selectedTab = tabIndex;
  }
}
