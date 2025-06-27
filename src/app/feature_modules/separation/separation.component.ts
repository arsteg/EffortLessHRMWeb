import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-separation',
  templateUrl: './separation.component.html',
  styleUrls: ['./separation.component.css']
})
export class SeparationComponent implements OnInit {
  selectedTab: number = 0;
  view = localStorage.getItem('adminView');

  constructor(
  ) { }

  ngOnInit(): void {
  }
  selectTab(tabIndex: number) {
    this.selectedTab = tabIndex;
  }

}
