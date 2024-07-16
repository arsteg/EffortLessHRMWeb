import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-payroll',
  templateUrl: './payroll.component.html',
  styleUrls: ['./payroll.component.css']
})
export class PayrollComponent implements OnInit {
  selectedTab: number = 2;
  constructor(
    ) { }

  ngOnInit(): void {  
  }
  selectTab(tabIndex: number) {
    this.selectedTab = tabIndex;
  }

}
