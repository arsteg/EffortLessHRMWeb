import { Component, Input } from '@angular/core';
import { PayrollService } from 'src/app/_services/payroll.service';

@Component({
  selector: 'app-other-benefit',
  templateUrl: './other-benefit.component.html',
  styleUrl: './other-benefit.component.css'
})
export class OtherBenefitComponent {
  otherBenefits: any;
  @Input() data: any;
  selectedRecord: any;

  constructor(private payroll: PayrollService) { }

  ngOnInit() {
    this.selectedRecord = this.payroll?.selectedCTCTemplate.getValue();
  }
}
