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
        this.isEdit = true;
        this.getRecordById(id);
      }
      else {
        this.isEdit = false;
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
      console.log(this.ctcTemplateForm.value)
      this.payroll.getFormValues.next(this.ctcTemplateForm.value);
      this.router.navigate(['assigned-templates'], { relativeTo: this.route });
    }
    this.showAssignedTemplates = false;
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
    if (!this.selectedRecord) {
      this.selectedRecord = {
        ctcTemplateFixedAllowances: [],
        ctcTemplateFixedDeductions: [],
        ctcTemplateEmployerContributions: [],
        ctcTemplateOtherBenefitAllowances: [],
        ctcTemplateEmployeeDeductions: [],
        ctcTemplateVariableAllowances: [],
        ctcTemplateVariableDeductions: []
      };
    }
    switch (type) {
      case 'fixedAllowance':
        this.selectedRecord.ctcTemplateFixedAllowances = this.selectedRecord.ctcTemplateFixedAllowances.filter(allowance =>
          selectedValues.includes(allowance.fixedAllowance._id));
        selectedValues.forEach(value => {
          const selectedAllowance = this.fixedAllowances.find(fa => fa._id === value);
          this.selectedRecord.ctcTemplateFixedAllowances.push({
            fixedAllowance: { _id: value, label: selectedAllowance.label },
            value: '',
            criteria: '',
            minAmount: ''
          });
        });
        this.ctcTemplateForm.patchValue({
          ctcTemplateFixedAllowance: this.selectedRecord.ctcTemplateFixedAllowances.map(item => item.fixedAllowance._id)
        });
        this.payroll.fixedAllowances.next(this.selectedRecord.ctcTemplateFixedAllowances);
        break;

      case 'fixedDeduction':
        this.selectedRecord.ctcTemplateFixedDeductions = this.selectedRecord.ctcTemplateFixedDeductions.filter(deduction =>
          selectedValues.includes(deduction.fixedDeduction._id));
        selectedValues.forEach(value => {
          const selectedDeduction = this.fixedDeduction.find(fa => fa._id === value);
          this.selectedRecord.ctcTemplateFixedDeductions.push({
            fixedDeduction: { _id: value, label: selectedDeduction.label },
            value: '',
            criteria: '',
            minAmount: ''
          });
        });
        this.ctcTemplateForm.patchValue({
          ctcTemplateFixedDeduction: this.selectedRecord.ctcTemplateFixedDeductions.map(item => item.fixedDeduction._id)
        });
        this.payroll.fixedDeductions.next(this.selectedRecord.ctcTemplateFixedDeductions);
        break;

      case 'fixedContribution':
        this.selectedRecord.ctcTemplateEmployerContributions = this.selectedRecord.ctcTemplateEmployerContributions.filter(contribution =>
          selectedValues.includes(contribution.fixedContribution._id));
        selectedValues.forEach(value => {
          const selectedContribution = this.fixedContribution.find(fa => fa._id === value);
          this.selectedRecord.ctcTemplateEmployerContributions.push({
            fixedContribution: { _id: value, label: selectedContribution.label },
            value: '',
            criteria: '',
            minAmount: ''
          });
        });
        this.ctcTemplateForm.patchValue({
          ctcTemplateEmployerContribution: this.selectedRecord.ctcTemplateEmployerContributions.map(item => item.fixedContribution._id)
        });
        this.payroll.fixedContributions.next(this.selectedRecord.ctcTemplateEmployerContributions);
        break;

      case 'otherBenefit':
        this.selectedRecord.ctcTemplateOtherBenefitAllowances = this.selectedRecord.ctcTemplateOtherBenefitAllowances.filter(otherbenefits =>
          selectedValues.includes(otherbenefits.otherBenefit._id));
        selectedValues.forEach(value => {
          const selectedBenefit = this.otherBenefits.find(fa => fa._id === value);
          this.selectedRecord.ctcTemplateOtherBenefitAllowances.push({
            otherBenefit: { _id: value, label: selectedBenefit.label },
            value: '',
            criteria: '',
            minAmount: ''
          });
        });
        this.ctcTemplateForm.patchValue({
          ctcTemplateOtherBenefitAllowance: this.selectedRecord.ctcTemplateOtherBenefitAllowances.map(item => item.otherBenefit._id)
        });
        this.payroll.otherBenefits.next(this.selectedRecord.ctcTemplateOtherBenefitAllowances);
        break;

      case 'employeeDeduction':
        this.selectedRecord.ctcTemplateEmployeeDeductions = this.selectedRecord.ctcTemplateEmployeeDeductions.filter(empDeduction =>
          selectedValues.includes(empDeduction.employeeDeduction._id));
        selectedValues.forEach(value => {
          const selectedEmpDeduction = this.fixedContribution.find(fa => fa._id === value);
          this.selectedRecord.ctcTemplateEmployeeDeductions.push({
            employeeDeduction: { _id: value, label: selectedEmpDeduction.label },
            value: '',
            criteria: '',
            minAmount: ''
          });
        });
        this.ctcTemplateForm.patchValue({
          ctcTemplateEmployeeDeduction: this.selectedRecord.ctcTemplateEmployeeDeductions.map(item => item.employeeDeduction._id)
        });
        this.payroll.employeeDeduction.next(this.selectedRecord.ctcTemplateEmployeeDeductions);
        break;

      case 'variableAllowance':
        this.selectedRecord.ctcTemplateVariableAllowances = this.selectedRecord.ctcTemplateVariableAllowances.filter(varallowance =>
          selectedValues.includes(varallowance.variableAllowance._id));
        selectedValues.forEach(value => {
          const selectedVarAllowance = this.variableAllowance.find(fa => fa._id === value);
          this.selectedRecord.ctcTemplateVariableAllowances.push({
            variableAllowance: { _id: value, label: selectedVarAllowance.label },
            value: '',
            criteria: '',
            minAmount: ''
          });
        });
        this.ctcTemplateForm.patchValue({
          ctcTemplateVariableAllowance: this.selectedRecord.ctcTemplateVariableAllowances.map(item => item.variableAllowance._id)
        });
        this.payroll.variableAllowances.next(this.selectedRecord.ctcTemplateVariableAllowances);
        break;

      case 'variableDeduction':
        this.selectedRecord.ctcTemplateVariableDeductions = this.selectedRecord.ctcTemplateVariableDeductions.filter(vardeduction =>
          selectedValues.includes(vardeduction.variableDeduction._id));
        selectedValues.forEach(value => {
          const selectedVarDeduction = this.variableDeduction.find(fa => fa._id === value);
          this.selectedRecord.ctcTemplateVariableDeductions.push({
            variableDeduction: { _id: value, label: selectedVarDeduction.label },
            value: '',
            criteria: '',
            minAmount: ''
          });
        });
        this.ctcTemplateForm.patchValue({
          ctcTemplateVariableDeduction: this.selectedRecord.ctcTemplateVariableDeductions.map(item => item.variableDeduction._id)
        });
        this.payroll.variableDeductions.next(this.selectedRecord.ctcTemplateVariableDeductions);
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
      ctcTemplateFixedAllowance: (this.ctcTemplateForm.value.ctcTemplateFixedAllowance || []).filter(Boolean).map(fixedAllowance => {
        const allowance = this.fixedAllowances.find(fa => fa._id === fixedAllowance);
        return { fixedAllowance: { _id: fixedAllowance, label: allowance ? allowance.label : '' } };
      }),
      ctcTemplateFixedDeduction: (this.ctcTemplateForm.value.ctcTemplateFixedDeduction || []).filter(Boolean).map(fixedDeduction => {
        const deduction = this.fixedDeduction.find(fd => fd._id === fixedDeduction);
        return { fixedDeduction: { _id: fixedDeduction, label: deduction ? deduction.label : '' } };
      }),
      ctcTemplateEmployerContribution: (this.ctcTemplateForm.value.ctcTemplateEmployerContribution || []).filter(Boolean).map(fixedContribution => {
        const contribution = this.fixedContribution.find(fc => fc._id === fixedContribution);
        return { fixedContribution: { _id: fixedContribution, label: contribution ? contribution.label : '' } };
      }),
      ctcTemplateOtherBenefitAllowance: (this.ctcTemplateForm.value.ctcTemplateOtherBenefitAllowance || []).filter(Boolean).map(otherBenefit => {
        const benefit = this.otherBenefits.find(ob => ob._id === otherBenefit);
        return { otherBenefit: { _id: otherBenefit, label: benefit ? benefit.label : '' } };
      }),
      ctcTemplateEmployeeDeduction: (this.ctcTemplateForm.value.ctcTemplateEmployeeDeduction || []).filter(Boolean).map(employeeDeduction => {
        const empDeduction = this.fixedContribution.find(ed => ed._id === employeeDeduction);
        return { employeeDeduction: { _id: employeeDeduction, label: empDeduction ? empDeduction.label : '' } };
      }),
      ctcTemplateVariableAllowance: (this.ctcTemplateForm.value.ctcTemplateVariableAllowance || []).filter(Boolean).map(variableAllowance => {
        const varAllowance = this.variableAllowance.find(va => va._id === variableAllowance);
        return { variableAllowance: { _id: variableAllowance, label: varAllowance ? varAllowance.label : '' } };
      }),
      ctcTemplateVariableDeduction: (this.ctcTemplateForm.value.ctcTemplateVariableDeduction || []).filter(Boolean).map(variableDeduction => {
        const varDeduction = this.variableDeduction.find(vd => vd._id === variableDeduction);
        return { variableDeduction: { _id: variableDeduction, label: varDeduction ? varDeduction.label : '' } };
      })
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
    } else {
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
      this.payroll.getFormValues.next(payload);
      console.log(payload);
    }

    this.payroll.selectedCTCTemplate.next(payload);
  }
}