import { Component, EventEmitter, Input, Output, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
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
  @Output() recordUpdatedFromAssigned: EventEmitter<any> = new EventEmitter<any>();
  fixedAllowances: any;
  fixedDeduction: any;
  otherBenefits: any;
  fixedContribution: any;
  variableAllowance: any;
  variableDeduction: any;
  showAssignedTemplates = false;
  ctcTemplateForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private payroll: PayrollService,
    private cdr: ChangeDetectorRef
  ) {
    this.ctcTemplateForm = this.fb.group({
      name: [''],
      ctcTemplateFixedAllowance: [[]],
      ctcTemplateFixedDeduction: [[]],
      ctcTemplateEmployerContribution: [[]],
      ctcTemplateOtherBenefitAllowance: [[]],
      ctcTemplateEmployeeDeduction: [[]],
      ctcTemplateVariableAllowance: [[]],
      ctcTemplateVariableDeduction: [[]],
    });
  }

  ngOnInit() {
    this.getDataOfAllPayrollSettings();
    if (this.isEdit == true) {
      this.ctcTemplateForm.patchValue({
        name: this.selectedRecord?.name,
        ctcTemplateFixedAllowance: Array.isArray(this.selectedRecord.ctcTemplateFixedAllowances) ? this.selectedRecord.ctcTemplateFixedAllowances.map(item => (item.fixedAllowance)) : [],
        ctcTemplateFixedDeduction: Array.isArray(this.selectedRecord.ctcTemplateFixedDeductions) ? this.selectedRecord.ctcTemplateFixedDeductions.map(item => (item.fixedDeduction)) : [],
        ctcTemplateVariableAllowance: Array.isArray(this.selectedRecord.ctcTemplateVariableAllowances) ? this.selectedRecord.ctcTemplateVariableAllowances.map(item => (item.variableAllowance)) : [],
        ctcTemplateVariableDeduction: Array.isArray(this.selectedRecord.ctcTemplateVariableDeductions) ? this.selectedRecord.ctcTemplateVariableDeductions.map(item => (item.variableDeduction)) : [],
        ctcTemplateEmployerContribution: Array.isArray(this.selectedRecord.ctcTemplateEmployerContributions) ? this.selectedRecord.ctcTemplateEmployerContributions.map(item => (item.fixedContribution)) : [],
        ctcTemplateOtherBenefitAllowance: Array.isArray(this.selectedRecord.ctcTemplateOtherBenefitAllowances) ? this.selectedRecord.ctcTemplateOtherBenefitAllowances.map(item => (item.otherBenefit)) : [],
        ctcTemplateEmployeeDeduction: Array.isArray(this.selectedRecord.ctcTemplateEmployeeDeductions) ? this.selectedRecord.ctcTemplateEmployeeDeductions.map(item => (item.employeeDeduction)) : []
      });
    }
  }

  onDropdownChange(event: any, type: string) {
    const selectedValues = event.value;
    switch (type) {
      case 'fixedAllowance':
        // Filter out the deselected options
        this.selectedRecord.ctcTemplateFixedAllowances = this.selectedRecord.ctcTemplateFixedAllowances.filter(allowance =>
          selectedValues.includes(allowance.fixedAllowance));

        // Add newly selected options
        selectedValues.forEach(value => {
          if (!this.selectedRecord.ctcTemplateFixedAllowances.find(allowance => allowance.fixedAllowance === value)) {
            this.selectedRecord.ctcTemplateFixedAllowances.push({
              fixedAllowance: value,
              value: '',
              criteria: '',
              minAmount: ''
            })
          }
        });
        break;

      case 'fixedDeduction':
        // Filter out the deselected options
        this.selectedRecord.ctcTemplateFixedDeductions = this.selectedRecord.ctcTemplateFixedDeductions.filter(deduction =>
          selectedValues.includes(deduction.fixedDeduction));

        // Add newly selected options
        selectedValues.forEach(value => {
          if (!this.selectedRecord.ctcTemplateFixedDeductions.find(deduction => deduction.fixedDeduction === value)) {
            this.selectedRecord.ctcTemplateFixedDeductions.push({
              fixedDeduction: value,
              value: '',
              criteria: '',
              minAmount: ''
            })
          }
        });
        break;

      case 'fixedContribution':
        // Filter out the deselected options
        this.selectedRecord.ctcTemplateEmployerContributions = this.selectedRecord.ctcTemplateEmployerContributions.filter(contribution => selectedValues.includes(contribution.fixedContribution));

        // Add newly selected options
        selectedValues.forEach(value => {
          if (!this.selectedRecord.ctcTemplateEmployerContributions.find(contribution => contribution.fixedContribution === value)) {
            this.selectedRecord.ctcTemplateEmployerContributions.push({
              fixedContribution: value,
              value: '',
              criteria: '',
              minAmount: ''
            })
          }
        });
        break;

      case 'otherBenefit':
        // Filter out the deselected options
        this.selectedRecord.ctcTemplateOtherBenefitAllowances = this.selectedRecord.ctcTemplateOtherBenefitAllowances.filter(otherbenefits => selectedValues.includes(otherbenefits.otherBenefit));

        // Add newly selected options
        selectedValues.forEach(value => {
          if (!this.selectedRecord.ctcTemplateOtherBenefitAllowances.find(otherbenefits => otherbenefits.otherBenefit === value)) {
            this.selectedRecord.ctcTemplateOtherBenefitAllowances.push({
              otherBenefit: value,
              value: '',
              criteria: '',
              minAmount: ''
            })
          }
        });
        break;

      case 'employeeDeduction':
        // Filter out the deselected options
        this.selectedRecord.ctcTemplateEmployeeDeductions = this.selectedRecord.ctcTemplateEmployeeDeductions.filter(empDeduction => selectedValues.includes(empDeduction.employeeDeduction));

        // Add newly selected options
        selectedValues.forEach(value => {
          if (!this.selectedRecord.ctcTemplateEmployeeDeductions.find(empDeduction => empDeduction.otherBenefit === value)) {
            this.selectedRecord.ctcTemplateEmployeeDeductions.push({
              employeeDeduction: value,
              value: '',
              criteria: '',
              minAmount: ''
            })
          }
        });
        break;

      case 'variableAllowance':
        // Filter out the deselected options
        this.selectedRecord.ctcTemplateVariableAllowances = this.selectedRecord.ctcTemplateVariableAllowances.filter(varallowance => selectedValues.includes(varallowance.variableAllowance));

        // Add newly selected options
        selectedValues.forEach(value => {
          if (!this.selectedRecord.ctcTemplateVariableAllowances.find(varallowance => varallowance.variableAllowance === value)) {
            this.selectedRecord.ctcTemplateVariableAllowances.push({
              variableAllowance: value,
              value: '',
              criteria: '',
              minAmount: ''
            })
          }
        });
        break;

      case 'variableDeduction':
        // Filter out the deselected options
        this.selectedRecord.ctcTemplateVariableDeductions = this.selectedRecord.ctcTemplateVariableDeductions.filter(vardeduction => selectedValues.includes(vardeduction.variableDeduction));

        // Add newly selected options
        selectedValues.forEach(value => {
          if (!this.selectedRecord.ctcTemplateVariableDeductions.find(vardeduction => vardeduction.variableDeduction === value)) {
            this.selectedRecord.ctcTemplateVariableDeductions.push({
              variableDeduction: value,
              value: '',
              criteria: '',
              minAmount: ''
            })
          }
        });
        break;
      default:
        console.error(`Unknown type: ${type}`);
    }
  }

  handleRecordUpdate(updatedRecord: any) {
    this.recordUpdatedFromAssigned.emit(updatedRecord);
  }

  getDataOfAllPayrollSettings() {
    let payload = { next: '', skip: '' }
    this.payroll.getFixedAllowance(payload).subscribe((res: any) => { this.fixedAllowances = res.data; });
    this.payroll.getFixedDeduction(payload).subscribe((res: any) => { this.fixedDeduction = res.data; });
    this.payroll.getOtherBenefits(payload).subscribe((res: any) => { this.otherBenefits = res.data; });
    this.payroll.getFixedContribution(payload).subscribe((res: any) => { this.fixedContribution = res.data; });
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
      ctcTemplateFixedAllowance: (this.ctcTemplateForm.value.ctcTemplateFixedAllowance || []).filter(Boolean).map(fixedAllowance => ({ fixedAllowance })),
      ctcTemplateFixedDeduction: (this.ctcTemplateForm.value.ctcTemplateFixedDeduction || []).filter(Boolean).map(fixedDeduction => ({ fixedDeduction })),
      ctcTemplateEmployerContribution: (this.ctcTemplateForm.value.ctcTemplateEmployerContribution || []).filter(Boolean).map(fixedContribution => ({ fixedContribution })),
      ctcTemplateOtherBenefitAllowance: (this.ctcTemplateForm.value.ctcTemplateOtherBenefitAllowance || []).filter(Boolean).map(otherBenefit => ({ otherBenefit })),
      ctcTemplateEmployeeDeduction: (this.ctcTemplateForm.value.ctcTemplateEmployeeDeduction || []).filter(Boolean).map(employeeDeduction => ({ employeeDeduction })),
      ctcTemplateVariableAllowance: (this.ctcTemplateForm.value.ctcTemplateVariableAllowance || []).filter(Boolean).map(variableAllowance => ({ variableAllowance })),
      ctcTemplateVariableDeduction: (this.ctcTemplateForm.value.ctcTemplateVariableDeduction || []).filter(Boolean).map(variableDeduction => ({ variableDeduction }))
    };
    this.payroll.assignedTemplates.next(payload);
  }

  openOffcanvas(offcanvasId: string) {
    this.onSubmission(); // Call the onSubmission function to save the data before opening the off-canvas
    this.showAssignedTemplates = true;
    const offcanvasElement = document.getElementById(offcanvasId);
    if (offcanvasElement) {
      const offcanvas = new Offcanvas(offcanvasElement);
      offcanvas.show();
    }
  }
}