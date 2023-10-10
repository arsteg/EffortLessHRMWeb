import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-taxation',
  templateUrl: './taxation.component.html',
  styleUrls: ['./taxation.component.css']
})
export class TaxationComponent implements OnInit {
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
