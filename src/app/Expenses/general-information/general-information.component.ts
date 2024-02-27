import { Component } from '@angular/core';

@Component({
  selector: 'app-general-information',
  templateUrl: './general-information.component.html',
  styleUrl: './general-information.component.css'
})
export class GeneralInformationComponent {
  selectedTab = 1;

  constructor() { }

  ngOnInit(): void {
  }
  selectTab(tabIndex: number) {
    this.selectedTab = tabIndex;
  }
}
