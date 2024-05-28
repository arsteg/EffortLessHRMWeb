import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-regularizations-records',
  templateUrl: './regularizations-records.component.html',
  styleUrl: './regularizations-records.component.css'
})
export class RegularizationsRecordsComponent {
  selectedTab = 1;
  @Input() tab: number;
  view = localStorage.getItem('adminView');

  constructor() { }

  ngOnInit(): void {
    console.log(this.view)
  }

  selectTab(tabIndex: number) {
    this.selectedTab = tabIndex;
  }
}
