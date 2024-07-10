import { Component, Input } from '@angular/core';
import { PayrollService } from 'src/app/_services/payroll.service';

@Component({
  selector: 'app-lwf',
  templateUrl: './lwf.component.html',
  styleUrl: './lwf.component.css'
})
export class LwfComponent {
  activeTab: string = 'tablwfSlab';
  @Input() selectedRecord: any;
  constructor(private payrollService: PayrollService) { }
  eligibleStates: any;
  states: any;

  ngOnInit() {
    this.payrollService.getEligibleStates().subscribe((res: any) => {
      this.eligibleStates = res.data;
    });
    this.payrollService.getAllConfiguredStates().subscribe((res: any) => {
      this.states = res.data;
    });
  }

  getMatchingState(stateID: string) {
    const matchingState = this.states?.find(rec => rec._id === stateID);
    return matchingState ? matchingState?.state : '';
  }

  selectTab(tabId: string) {
    this.activeTab = tabId;
  }
}
