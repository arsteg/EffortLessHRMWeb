import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
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
  @Output() recordUpdatedFromAssigned: EventEmitter<any> = new EventEmitter<any>();

  handleRecordUpdate(updatedRecord: any) {
    // Pass the event further up to the parent component
    console.log(updatedRecord);
    this.recordUpdatedFromAssigned.emit(updatedRecord);
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
      ctcTemplateFixedAllowance: (this.ctcTemplateForm.value.ctcTemplateFixedAllowance || []).filter(Boolean).map(fixedAllowance => ({ fixedAllowance })),
      ctcTemplateFixedDeduction: (this.ctcTemplateForm.value.ctcTemplateFixedDeduction || []).filter(Boolean).map(fixedDeduction => ({ fixedDeduction })),
      ctcTemplateEmployerContribution: (this.ctcTemplateForm.value.ctcTemplateEmployerContribution || []).filter(Boolean).map(fixedContribution => ({ fixedContribution })),
      ctcTemplateOtherBenefitAllowance: (this.ctcTemplateForm.value.ctcTemplateOtherBenefitAllowance || []).filter(Boolean).map(otherBenefit => ({ otherBenefit })),
      ctcTemplateEmployeeDeduction: (this.ctcTemplateForm.value.ctcTemplateEmployeeDeduction || []).filter(Boolean).map(employeeDeduction => ({ employeeDeduction })),
      ctcTemplateVariableAllowance: (this.ctcTemplateForm.value.ctcTemplateVariableAllowance || []).filter(Boolean).map(variableAllowance => ({ variableAllowance })),
      ctcTemplateVariableDeduction: (this.ctcTemplateForm.value.ctcTemplateVariableDeduction || []).filter(Boolean).map(variableDeduction => ({ variableDeduction }))
    };
    console.log(payload);
    this.payroll.assignedTemplates.next(payload);
  }
  openOffcanvas(offcanvasId: string) {
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
    console.log(payload);
    this.payroll.assignedTemplates.next(payload);
    this.showAssignedTemplates = true;
    const offcanvasElement = document.getElementById(offcanvasId);
    const offcanvas = new Offcanvas(offcanvasElement);
    offcanvas.show();
  }

}
