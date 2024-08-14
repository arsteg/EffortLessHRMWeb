import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { PayrollService } from 'src/app/_services/payroll.service';


@Component({
  selector: 'app-var-deduction',
  templateUrl: './var-deduction.component.html',
  styleUrl: './var-deduction.component.css'
})
export class VarDeductionComponent {
  @Input() isEdit: boolean;
  @Input() data: any;
  @Output() formDataChange = new EventEmitter<any>();
  allVariableDeductions: any[] = [];
  variableDeductions: any[] = [];
  variableDeductionForm: FormGroup;
  combinedDataChange: any;
  @Input() selectedRecord: any;

  constructor(private payroll: PayrollService, private fb: FormBuilder) {
    this.variableDeductionForm = this.fb.group({
      variableDeduction: this.fb.array([])
    });
  }

  ngOnInit() {
    this.getVariableDeduction();
    this.initForm();
    if (this.isEdit && this.selectedRecord) {
      this.patchFormValues();
    }
  }

  initForm() {
    const allowancesControl = this.variableDeductionForm.get('variableDeduction') as FormArray;
    this.variableDeductions = this.data.ctcTemplateVariableDeduction || [];
    this.variableDeductions.forEach(fa => {
      allowancesControl.push(this.fb.group({
        variableDeduction: [fa],
        criteria: ['Amount'],
        value: [''],
        valueType: [0],
        minimumAmount: ['']
      }));
    });

    this.variableDeductionForm.valueChanges.subscribe(() => {
      this.formDataChange.emit(this.variableDeductionForm.value.variableDeduction);
    });
  }

  patchFormValues() {
    const allowancesControl = this.variableDeductionForm.get('variableDeduction') as FormArray;
    allowancesControl.clear();
    this.selectedRecord.ctcTemplateVariableDeductions.forEach((item: any) => {
      allowancesControl.push(this.fb.group({
        variableDeduction: [item.variableDeduction || ''],
        criteria: [item.criteria || 'Amount'],
        value: [item.value || ''],
        valueType: item.valueType || '',
        minimumAmount: [item.minimumAmount || '']
      }));
    });
  }

  get allowances() {
    return (this.variableDeductionForm.get('variableDeduction') as FormArray).controls;
  }

  getVariableDeduction() {
    let payload = {
      next: '',
      skip: ''
    }
    this.payroll.getVariableDeduction(payload).subscribe((res: any) => {
      this.allVariableDeductions = res.data;
    });
  }

  getAllowance(allowance: string) {
    const matchingAllowance = this.allVariableDeductions?.find(res => res._id === allowance);
    return matchingAllowance ? matchingAllowance.label : '';
  }

}
