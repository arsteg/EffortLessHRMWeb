import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { skip } from 'rxjs';
import { PayrollService } from 'src/app/_services/payroll.service';
import { Offcanvas } from 'bootstrap';

@Component({
  selector: 'app-update-ctctemplate',
  templateUrl: './update-ctctemplate.component.html',
  styleUrl: './update-ctctemplate.component.css'
})
export class UpdateCTCTemplateComponent {
  @Input() isEdit: boolean;
  @Input() selectedRecord: any = null;
  fixedAllowances: any;
  fixedDeduction: any;
  otherBenefits: any;
  fixedContribution: any;
  variableAllowance: any;
  variableDeduction: any;
  showAssignedTemplates = false;
  ctcTemplateForm: FormGroup;

  constructor(private fb: FormBuilder,
    private payroll: PayrollService
  ) {

    this.ctcTemplateForm = this.fb.group({
      name: [''],
      ctcTemplateFixedAllowance: [[]],
      ctcTemplateFixedDeduction: [[]],
      ctcTemplateEmployerContribution: [[]],
      ctcTemplateOtherBenefitAllowance: [[]],
      ctcTemplateEmployeeDeduction: [[]]

      // "ctcTemplateFixedAllowance": [
      //   {
      //     "fixedAllowance": "string",
      //     "criteria": "string",
      //     "value": 0,
      //     "valueType": "string",
      //     "minimumAmount": "string"
      //   }
      // ],
      // "ctcTemplateFixedDeduction": [
      //   {
      //     "fixedDeduction": "string",
      //     "criteria": "string",
      //     "value": 0,
      //     "valueType": "string",
      //     "minimumAmount": "string"
      //   }
      // ],
      // "ctcTemplateEmployerContribution": [
      //   {
      //     "fixedContribution": "string",
      //     "value": "string"
      //   }
      // ],
      // "ctcTemplateOtherBenefitAllowance": [
      //   {
      //     "otherBenefit": "string",
      //     "value": "string"
      //   }
      // ],
      // "ctcTemplateEmployeeDeduction": [
      //   {
      //     "employeeDeduction": "string",
      //     "value": "string"
      //   }
      // ]
    });
  }
  
  ngOnInit() {
    this.getDataOfAllPayrollSettings();

    if (this.isEdit == true) {
      this.ctcTemplateForm.patchValue({
        name: this.selectedRecord?.name,
        ctcTemplateFixedAllowance: Array.isArray(this.selectedRecord.ctcTemplateFixedAllowances) ? this.selectedRecord.ctcTemplateFixedAllowances.map(item => (item.fixedAllowance)) : [],
        ctcTemplateFixedDeduction: Array.isArray(this.selectedRecord.ctcTemplateFixedDeductions) ? this.selectedRecord.ctcTemplateFixedDeductions.map(item => (item.fixedDeduction)) : [],
        ctcTemplateEmployerContribution: Array.isArray(this.selectedRecord.ctcTemplateEmployerContributions) ? this.selectedRecord.ctcTemplateEmployerContributions.map(item => (item.fixedContribution)) : [],
        ctcTemplateOtherBenefitAllowance: Array.isArray(this.selectedRecord.ctcTemplateOtherBenefitAllowances) ? this.selectedRecord.ctcTemplateOtherBenefitAllowances.map(item => (item.otherBenefit)) : [],
        ctcTemplateEmployeeDeduction: Array.isArray(this.selectedRecord.ctcTemplateEmployeeDeductions) ? this.selectedRecord.ctcTemplateEmployeeDeductions.map(item => (item.fixedDeduction)) : []
      });
    }
  }
 
  getDataOfAllPayrollSettings() {
    let payload = {
      next: '',
      skip: ''
    }
    this.payroll.getFixedAllowance(payload).subscribe((res: any) => {
      this.fixedAllowances = res.data;
    });
    this.payroll.getFixedDeduction(payload).subscribe((res: any) => {
      this.fixedDeduction = res.data;
    });
    this.payroll.getOtherBenefits(payload).subscribe((res: any) => {
      this.otherBenefits = res.data;
    });
    this.payroll.getFixedContribution(payload).subscribe((res: any) => {
      this.fixedContribution = res.data;
    });
    this.payroll.getVariableAllowance(payload).subscribe((res: any) => {
      this.variableAllowance = res.data.filter((item: any) => item.isShowInCTCStructure === true);
    });
    this.payroll.getVariableDeduction(payload).subscribe((res: any) => {
      this.variableDeduction = res.data.filter((item: any) => item.isShowINCTCStructure === true);
    });
  }

  onSubmission() {
    let payload = {
      name: this.ctcTemplateForm.value.name,
      ctcTemplateFixedAllowance: this.ctcTemplateForm.value.ctcTemplateFixedAllowance.map(fixedAllowance => ({ fixedAllowance })),
      ctcTemplateFixedDeduction: this.ctcTemplateForm.value.ctcTemplateFixedDeduction.map(fixedDeduction => ({ fixedDeduction })),
      ctcTemplateEmployerContribution: this.ctcTemplateForm.value.ctcTemplateEmployerContribution.map(fixedContribution => ({ fixedContribution })),
      ctcTemplateOtherBenefitAllowance: this.ctcTemplateForm.value.ctcTemplateOtherBenefitAllowance.map(otherBenefit => ({ otherBenefit })),
      ctcTemplateEmployeeDeduction: this.ctcTemplateForm.value.ctcTemplateEmployeeDeduction.map(employeeDeduction => ({ employeeDeduction }))
    };
    payload = this.ctcTemplateForm.value;

    this.payroll.assignedTemplates.next(payload);
  }

  openOffcanvas(offcanvasId: string) {
    this.showAssignedTemplates = true;
    const offcanvasElement = document.getElementById(offcanvasId);
    const offcanvas = new Offcanvas(offcanvasElement);
    offcanvas.show();
  }
 
}
