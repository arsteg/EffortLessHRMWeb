import { Component } from '@angular/core';

@Component({
  selector: 'app-run-payroll',
  templateUrl: './run-payroll.component.html',
  styleUrl: './run-payroll.component.css'
})
export class RunPayrollComponent {
  selectedTab: number = 1;
  constructor() { }

  ngOnInit(): void {  
  }
  selectTab(tabIndex: number) {
    this.selectedTab = tabIndex;
  }
}
