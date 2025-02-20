import { Component, Input } from '@angular/core';
import { PayrollService } from 'src/app/_services/payroll.service';

@Component({
  selector: 'app-assigned-fixed-contribution',
  templateUrl: './fixed-contribution.component.html',
  styleUrl: './fixed-contribution.component.css'
})
export class AssignedFixedContributionComponent {
  employerContributions: any;
  selectedRecord: any;

  constructor(private payroll: PayrollService) { }

  ngOnInit() {
    this.selectedRecord = this.payroll?.selectedCTCTemplate.getValue();
  }
}
