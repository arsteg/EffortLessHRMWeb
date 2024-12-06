import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-on-duty-records',
  templateUrl: './on-duty-records.component.html',
  styleUrl: './on-duty-records.component.css'
})
export class OnDutyRecordsComponent {
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
