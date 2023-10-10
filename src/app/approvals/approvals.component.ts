import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-approvals',
  templateUrl: './approvals.component.html',
  styleUrls: ['./approvals.component.css']
})
export class ApprovalsComponent implements OnInit {
  selectedTab: number = 1;
  constructor(
    ) { }

  ngOnInit(): void {  
  }
  selectTab(tabIndex: number) {
    this.selectedTab = tabIndex;
  }


}
