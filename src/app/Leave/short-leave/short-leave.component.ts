import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-short-leave',
  templateUrl: './short-leave.component.html',
  styleUrl: './short-leave.component.css'
})
export class ShortLeaveComponent {
  selectedTab: number = 1;
  @Input() tab: number;
  
  ngOnInit() {
  }
  selectTab(tabIndex: number) {
    this.selectedTab = tabIndex;
  }
}
