import { Component } from '@angular/core';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class SettingsComponent {
  selectedTab = 7;

  constructor() { }

  ngOnInit(): void {
  }
  selectTab(tabIndex: number) {
    this.selectedTab = tabIndex;
  }
}
