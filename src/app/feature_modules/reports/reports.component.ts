import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent implements OnInit {
  selectedTab: number = 1;
  view = localStorage.getItem('adminView');

  constructor(
    ) { }

  ngOnInit(): void {
    if (this.view === 'admin') {
      this.selectedTab = 1;
    } else {
      this.selectedTab = 3;
    }
    this.selectTab(this.selectedTab); 
  }
  selectTab(tabIndex: number) {
    this.selectedTab = tabIndex;
  }

}
