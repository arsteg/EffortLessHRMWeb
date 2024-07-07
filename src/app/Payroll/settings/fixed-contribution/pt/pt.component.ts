import { Component, Input } from '@angular/core';
import { PayrollService } from 'src/app/_services/payroll.service';

@Component({
  selector: 'app-pt',
  templateUrl: './pt.component.html',
  styleUrl: './pt.component.css'
})
export class PtComponent {
  activeTab: string = 'tabEligibleStates';
  states: any;
  @Input() selectedReport: any;
  constructor(private payrollService: PayrollService) { }

  ngOnInit() {
    this.payrollService.getEligibleStates().subscribe((res: any) => {
      this.states = res.data;
    })
  }

  selectTab(tabId: string) {
    this.activeTab = tabId;
  }
}