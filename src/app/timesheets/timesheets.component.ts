import { Component, OnInit } from '@angular/core';


@Component({
  selector: 'app-timesheets',
  templateUrl: './timesheets.component.html',
  styleUrls: ['./timesheets.component.css']
})

export class TimesheetsComponent implements OnInit {
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
