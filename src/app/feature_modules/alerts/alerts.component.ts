import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-alerts',
  templateUrl: './alerts.component.html',
  styleUrls: ['./alerts.component.css']
})
export class AlertsComponent implements OnInit {
  selectedTab: number = 5;
  constructor() { }

  ngOnInit(): void {
  }
  selectTab(tabIndex: number) {
    this.selectedTab = tabIndex;
  }

}
