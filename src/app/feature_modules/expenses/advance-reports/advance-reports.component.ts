import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-advance-reports',
  templateUrl: './advance-reports.component.html',
  styleUrl: './advance-reports.component.css'
})
export class AdvanceReportsComponent {
  selectedTab = 1;
  @Input() tab: number;

  selectTab(tabIndex: number) {
    this.selectedTab = tabIndex;
  }
}