import { Component, Input } from '@angular/core';
import { PayrollService } from 'src/app/_services/payroll.service';

@Component({
  selector: 'app-employee-deduction',
  templateUrl: './employee-deduction.component.html',
  styleUrl: './employee-deduction.component.css'
})
export class EmployeeDeductionComponent {
  employeeDeduction: any;
  selectedRecord: any;

  constructor(private payroll: PayrollService) { }

  ngOnInit() {
    this.selectedRecord = this.payroll?.selectedCTCTemplate.getValue();
  }
}
