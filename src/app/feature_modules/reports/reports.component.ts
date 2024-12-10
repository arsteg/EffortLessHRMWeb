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
  }
  selectTab(tabIndex: number) {
    this.selectedTab = tabIndex;
  }

}
