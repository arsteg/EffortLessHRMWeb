import { Component, OnInit } from '@angular/core';
import { LeaveService } from 'src/app/_services/leave.service';

@Component({
  selector: 'app-leave',
  templateUrl: './leave.component.html',
  styleUrls: ['./leave.component.css']
})
export class LeaveComponent implements OnInit {
  selectedTab: any = 1;
  view= localStorage.getItem('adminView');
  constructor(
    private leaveService :LeaveService
  ) { }

  ngOnInit(): void { 
    this.leaveService.setSelectedTab(this.selectedTab);
    this.leaveService.getSelectedTab().subscribe(tab => {
      this.selectedTab = tab;
    });
  }
  
  selectTab(tabIndex: any) {
    this.selectedTab = tabIndex;
    this.leaveService.setSelectedTab(tabIndex);
    localStorage.setItem('selectedTab', tabIndex)
  }
}
