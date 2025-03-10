import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-employee-deduction',
  templateUrl: './employee-deduction.component.html',
  styleUrl: './employee-deduction.component.css'
})
export class EmployeeDeductionComponent {
  employeeDeduction: any;
  @Input() selectedRecord: any;
  @Input() ctcTemplateEmployeeDeduction: any;

  constructor() { }

  ngOnInit() {
    this.employeeDeduction = this.selectedRecord?.ctcTemplateEmployeeDeductions || this.ctcTemplateEmployeeDeduction;
  }
}