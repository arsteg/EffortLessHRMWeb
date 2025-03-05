import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-assigned-fixed-contribution',
  templateUrl: './fixed-contribution.component.html',
  styleUrl: './fixed-contribution.component.css'
})
export class AssignedFixedContributionComponent {
  employerContributions: any;
  @Input() selectedRecord: any;
  @Input() ctcTemplateEmployeeDeduction: any;

  constructor() { }

  ngOnInit() {
    this.employerContributions = this.selectedRecord?.ctcTemplateEmployerContributions || this.ctcTemplateEmployeeDeduction;
  }
}
