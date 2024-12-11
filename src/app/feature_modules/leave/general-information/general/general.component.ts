import { Component } from '@angular/core';

@Component({
  selector: 'app-general',
  templateUrl: './general.component.html',
  styleUrl: './general.component.css'
})
export class GeneralComponent {
  selectedTab: number = 1;
  view= localStorage.getItem('adminView');

  ngOnInit() { }

  selectTab(tabIndex: number) {
    this.selectedTab = tabIndex;
    console.log(this.selectedTab)
  }
}
