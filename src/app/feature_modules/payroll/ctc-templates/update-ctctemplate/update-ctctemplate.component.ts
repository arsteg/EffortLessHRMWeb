import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PayrollService } from 'src/app/_services/payroll.service';
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';

@Component({
  selector: 'app-update-ctctemplate',
  templateUrl: './update-ctctemplate.component.html',
  styleUrl: './update-ctctemplate.component.css'
})
export class UpdateCTCTemplateComponent {
  isEdit: boolean;
  @Input() selectedRecord: any = null;
  @Output() recordUpdatedFromAssigned: EventEmitter<any> = new EventEmitter<any>();
  fixedAllowances: any;
  fixedDeduction: any;
  otherBenefits: any;
  fixedContribution: any;
  variableAllowance: any;
  variableDeduction: any;
  showAssignedTemplates = true;
  ctcTemplateForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private payroll: PayrollService,
    private route: ActivatedRoute,
    private router: Router
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
    this.route.params.subscribe(param => {
      const id = param['id'];
      if (id) {
        this.getRecordById(id);
      }
    });
    this.getDataOfAllPayrollSettings();
    this.selectedRecord = this.payroll.selectedCTCTemplate.getValue();
    if (this.selectedRecord) {
      this.ctcTemplateForm.patchValue({
        name: this.selectedRecord.name,
        ctcTemplateFixedAllowance: Array.isArray(this.selectedRecord.ctcTemplateFixedAllowances) ? this.selectedRecord.ctcTemplateFixedAllowances.map(item => (item.fixedAllowance?._id)) : [],
        ctcTemplateFixedDeduction: Array.isArray(this.selectedRecord.ctcTemplateFixedDeductions) ? this.selectedRecord.ctcTemplateFixedDeductions.map(item => (item.fixedDeduction?._id)) : [],
        ctcTemplateVariableAllowance: Array.isArray(this.selectedRecord.ctcTemplateVariableAllowances) ? this.selectedRecord.ctcTemplateVariableAllowances.map(item => (item.variableAllowance?._id)) : [],
        ctcTemplateVariableDeduction: Array.isArray(this.selectedRecord.ctcTemplateVariableDeductions) ? this.selectedRecord.ctcTemplateVariableDeductions.map(item => (item.variableDeduction?._id)) : [],
        ctcTemplateEmployerContribution: Array.isArray(this.selectedRecord.ctcTemplateEmployerContributions) ? this.selectedRecord.ctcTemplateEmployerContributions.map(item => (item.fixedContribution?._id)) : [],
        ctcTemplateOtherBenefitAllowance: Array.isArray(this.selectedRecord.ctcTemplateOtherBenefitAllowances) ? this.selectedRecord.ctcTemplateOtherBenefitAllowances.map(item => (item.otherBenefit?._id)) : [],
        ctcTemplateEmployeeDeduction: Array.isArray(this.selectedRecord.ctcTemplateEmployeeDeductions) ? this.selectedRecord.ctcTemplateEmployeeDeductions.map(item => (item.employeeDeduction?._id)) : []
      });
    }
  }

  goBack() {
    this.router.navigate(['home/payroll/ctc-template']);
  }

  getAssignedTemplates() {
    const id = this.selectedRecord?._id || this.route.snapshot.paramMap.get('id');
    if (id) {
      this.payroll.isEdit.next(true)
      this.router.navigate([`assigned-templates`], { relativeTo: this.route });
    }
    else {
    this.router.navigate(['assigned-templates'], { relativeTo: this.route });
    }
  }

  getRecordById(id: string) {
    this.payroll.getCTCTemplateById(id).subscribe((res: any) => {
      const result = res.data;
      this.payroll?.selectedCTCTemplate.next(result);
      this.ctcTemplateForm.patchValue({
        name: result?.name,
        ctcTemplateFixedAllowance: Array.isArray(result.ctcTemplateFixedAllowances) ? result.ctcTemplateFixedAllowances.map(item => (item.fixedAllowance?._id)) : [],
        ctcTemplateFixedDeduction: Array.isArray(result.ctcTemplateFixedDeductions) ? result.ctcTemplateFixedDeductions.map(item => (item.fixedDeduction?._id)) : [],
        ctcTemplateVariableAllowance: Array.isArray(result.ctcTemplateVariableAllowances) ? result.ctcTemplateVariableAllowances.map(item => (item.variableAllowance?._id)) : [],
        ctcTemplateVariableDeduction: Array.isArray(result.ctcTemplateVariableDeductions) ? result.ctcTemplateVariableDeductions.map(item => (item.variableDeduction?._id)) : [],
        ctcTemplateEmployerContribution: Array.isArray(result.ctcTemplateEmployerContributions) ? result.ctcTemplateEmployerContributions.map(item => (item.fixedContribution?._id)) : [],
        ctcTemplateOtherBenefitAllowance: Array.isArray(result.ctcTemplateOtherBenefitAllowances) ? result.ctcTemplateOtherBenefitAllowances.map(item => (item.otherBenefit?._id)) : [],
        ctcTemplateEmployeeDeduction: Array.isArray(result.ctcTemplateEmployeeDeductions) ? result.ctcTemplateEmployeeDeductions.map(item => (item.employeeDeduction?._id)) : []
      });
    });
  }

  onDropdownChange(event: any, type: string) {
    const selectedValues = event.value;
    switch (type) {
      case 'fixedAllowance':
        // Filter out the deselected options
        this.selectedRecord.ctcTemplateFixedAllowances = this.selectedRecord.ctcTemplateFixedAllowances.filter(allowance =>
          selectedValues.includes(allowance.fixedAllowance._id));

        // Add newly selected options
        selectedValues.forEach(value => {
          const selectedAllowance = this.fixedAllowances.find(fa => fa._id === value);
          if (!this.selectedRecord.ctcTemplateFixedAllowances.find(allowance => allowance.fixedAllowance._id === value)) {
            this.selectedRecord.ctcTemplateFixedAllowances.push({
              fixedAllowance: { _id: value, label: selectedAllowance.label },
              value: '',
              criteria: '',
              minAmount: ''
            });
          }
        });
        break;

      case 'fixedDeduction':
        // Filter out the deselected options
        this.selectedRecord.ctcTemplateFixedDeductions = this.selectedRecord.ctcTemplateFixedDeductions.filter(deduction =>
          selectedValues.includes(deduction.fixedDeduction));

        // Add newly selected options
        selectedValues.forEach(value => {
          const selectedDeduction = this.fixedDeduction.find(fa => fa._id === value);
          if (!this.selectedRecord.ctcTemplateFixedDeductions.find(deduction => deduction.fixedDeduction === value)) {
            this.selectedRecord.ctcTemplateFixedDeductions.push({
              fixedDeduction: { _id: value, label: selectedDeduction.label },
              value: '',
              criteria: '',
              minAmount: ''
            });
          }
        });
        break;

      case 'fixedContribution':
        // Filter out the deselected options
        this.selectedRecord.ctcTemplateEmployerContributions = this.selectedRecord.ctcTemplateEmployerContributions.filter(contribution => selectedValues.includes(contribution.fixedContribution));

        // Add newly selected options
        selectedValues.forEach(value => {
          const selectedContribution = this.fixedContribution.find(fa => fa._id === value);
          if (!this.selectedRecord.ctcTemplateEmployerContributions.find(contribution => contribution.fixedContribution === value)) {
            this.selectedRecord.ctcTemplateEmployerContributions.push({
              fixedContribution: { _id: value, label: selectedContribution.label },
              value: '',
              criteria: '',
              minAmount: ''
            });
          }
        });
        break;

      case 'otherBenefit':
        // Filter out the deselected options
        this.selectedRecord.ctcTemplateOtherBenefitAllowances = this.selectedRecord.ctcTemplateOtherBenefitAllowances.filter(otherbenefits => selectedValues.includes(otherbenefits.otherBenefit));

        // Add newly selected options
        selectedValues.forEach(value => {
          const selectedBenefit = this.otherBenefits.find(fa => fa._id === value);
          if (!this.selectedRecord.ctcTemplateOtherBenefitAllowances.find(otherbenefits => otherbenefits.otherBenefit === value)) {
            this.selectedRecord.ctcTemplateOtherBenefitAllowances.push({
              otherBenefit: { _id: value, label: selectedBenefit.label },
              value: '',
              criteria: '',
              minAmount: ''
            });
          }
        });
        break;

      case 'employeeDeduction':
        // Filter out the deselected options
        this.selectedRecord.ctcTemplateEmployeeDeductions = this.selectedRecord.ctcTemplateEmployeeDeductions.filter(empDeduction => selectedValues.includes(empDeduction.employeeDeduction));

        // Add newly selected options
        selectedValues.forEach(value => {
          const selectedEmpDeduction = this.fixedContribution.find(fa => fa._id === value);
          if (!this.selectedRecord.ctcTemplateEmployeeDeductions.find(empDeduction => empDeduction.otherBenefit === value)) {
            this.selectedRecord.ctcTemplateEmployeeDeductions.push({
              employeeDeduction: { _id: value, label: selectedEmpDeduction.label },
              value: '',
              criteria: '',
              minAmount: ''
            });
          }
        });
        break;

      case 'variableAllowance':
        // Filter out the deselected options
        this.selectedRecord.ctcTemplateVariableAllowances = this.selectedRecord.ctcTemplateVariableAllowances.filter(varallowance => selectedValues.includes(varallowance.variableAllowance));

        // Add newly selected options
        selectedValues.forEach(value => {
          const selectedVarAllowance = this.variableAllowance.find(fa => fa._id === value);
          if (!this.selectedRecord.ctcTemplateVariableAllowances.find(varallowance => varallowance.variableAllowance === value)) {
            this.selectedRecord.ctcTemplateVariableAllowances.push({
              variableAllowance: { _id: value, label: selectedVarAllowance.label },
              value: '',
              criteria: '',
              minAmount: ''
            });
          }
        });
        break;

      case 'variableDeduction':
        // Filter out the deselected options
        this.selectedRecord.ctcTemplateVariableDeductions = this.selectedRecord.ctcTemplateVariableDeductions.filter(vardeduction => selectedValues.includes(vardeduction.variableDeduction));

        // Add newly selected options
        selectedValues.forEach(value => {
          const selectedVarDeduction = this.variableDeduction.find(fa => fa._id === value);
          if (!this.selectedRecord.ctcTemplateVariableDeductions.find(vardeduction => vardeduction.variableDeduction === value)) {
            this.selectedRecord.ctcTemplateVariableDeductions.push({
              variableDeduction: { _id: value, label: selectedVarDeduction.label },
              value: '',
              criteria: '',
              minAmount: ''
            });
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
    let payload = { next: '', skip: '' };
    this.payroll.getFixedAllowance(payload).subscribe((res: any) => {
      this.fixedAllowances = res.data;
      this.payroll.fixedAllowances.next(this.fixedAllowances);
    });

    this.payroll.getFixedDeduction(payload).subscribe((res: any) => {
      this.fixedDeduction = res.data;
      this.payroll.fixedDeductions.next(this.fixedAllowances);
    });

    this.payroll.getOtherBenefits(payload).subscribe((res: any) => {
      this.otherBenefits = res.data;
      this.payroll.otherBenefits.next(this.fixedAllowances);
    });

    this.payroll.getFixedContribution(payload).subscribe((res: any) => {
      this.fixedContribution = res.data;
      this.payroll.fixedContributions.next(this.fixedAllowances);
    });

    this.payroll.getVariableAllowance(payload).subscribe((res: any) => {
      this.variableAllowance = res.data.filter((item: any) => item.isShowInCTCStructure === true);
      this.payroll.variableAllowances.next(this.fixedAllowances);
    });

    this.payroll.getVariableDeduction(payload).subscribe((res: any) => {
      this.variableDeduction = res.data.filter((item: any) => item.isShowINCTCStructure === true);
      this.payroll.variableDeductions.next(this.fixedAllowances);
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

    if (this.isEdit) {
      payload = {
        ...payload,
        ctcTemplateFixedAllowance: this.selectedRecord.ctcTemplateFixedAllowances,
        ctcTemplateFixedDeduction: this.selectedRecord.ctcTemplateFixedDeductions,
        ctcTemplateEmployerContribution: this.selectedRecord.ctcTemplateEmployerContributions,
        ctcTemplateOtherBenefitAllowance: this.selectedRecord.ctcTemplateOtherBenefitAllowances,
        ctcTemplateEmployeeDeduction: this.selectedRecord.ctcTemplateEmployeeDeductions,
        ctcTemplateVariableAllowance: this.selectedRecord.ctcTemplateVariableAllowances,
        ctcTemplateVariableDeduction: this.selectedRecord.ctcTemplateVariableDeductions
      };
    }

    this.payroll.selectedCTCTemplate.next(payload);
  }
}