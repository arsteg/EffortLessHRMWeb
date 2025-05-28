import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-pt',
  templateUrl: './pt.component.html',
  styleUrl: './pt.component.css'
})
export class PtComponent {
  activeTab: string = 'tabPTSlab';
  states: any;
  @Input() selectedReport: any;
  
  constructor() { }

  ngOnInit() { }

  selectTab(tabId: string) {
    this.activeTab = tabId;
  }
}