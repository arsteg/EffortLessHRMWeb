import { Component } from '@angular/core';

@Component({
  selector: 'app-advance-reports',
  templateUrl: './advance-reports.component.html',
  styleUrl: './advance-reports.component.css'
})
export class AdvanceReportsComponent {
  selectedTab = 1;
  selectTab(tabIndex: number) {
    this.selectedTab = tabIndex;
  }
}
