import { Component } from '@angular/core';

@Component({
  selector: 'app-pt',
  templateUrl: './pt.component.html',
  styleUrl: './pt.component.css'
})
export class PtComponent {
  activeTab: string = 'tabEligibleStates';

constructor() { }

selectTab(tabId: string) {
  this.activeTab = tabId;
  console.log(this.activeTab)
}
}
