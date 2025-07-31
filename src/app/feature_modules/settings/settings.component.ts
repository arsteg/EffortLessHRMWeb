import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  //selectedTab: number = 1;
  view = localStorage.getItem('adminView');
  
  constructor(
    ) { }

  ngOnInit(): void {
    //this.selectTab(this.selectedTab);
  }
  // selectTab(tabIndex: number) {
  //   this.selectedTab = tabIndex;
  // }

  // onTabChange(index: number): void {
  //   this.selectedTab = index;
  //   const path = index === 0 ? 'resignation' : 'termination';
  //   this.router.navigate([path], { relativeTo: this.route });
  // }

}
