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
  states: any;

  ngOnInit() {
    this.payrollService.getEligibleStates().subscribe((res: any) => {
      this.states = res.data;
    });
  
  }
  selectTab(tabId: string) {
    this.activeTab = tabId;
  }
}
