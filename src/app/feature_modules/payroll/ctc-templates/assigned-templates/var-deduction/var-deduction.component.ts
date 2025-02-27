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
  selectedRecord: any;

  constructor(
    private payroll: PayrollService,
    private fb: FormBuilder
  ) {
    this.variableDeductionForm = this.fb.group({
      variableDeduction: this.fb.array([])
    });
  }

  ngOnInit() {
    this.initForm();
    this.selectedRecord = this.payroll?.selectedCTCTemplate.getValue();

    if (this.isEdit) {
      this.patchFormValues();
    }
  }

  initForm() {
    const allowancesControl = this.variableDeductionForm.get('variableDeduction') as FormArray;
    this.variableDeductions = this.selectedRecord?.ctcTemplateVariableDeductions || [];

    this.variableDeductions.forEach(fa => {
      allowancesControl.push(this.fb.group({
        variableDeduction: [fa.variableDeduction?._id || ''],
        variableDeductionLabel: [fa.variableDeduction?.label || ''],
        criteria: ['Amount'],
        value: [''],
        valueType: [0],
        minimumAmount: [0]
      }));
    });

    this.variableDeductionForm.valueChanges.subscribe(() => {
      if (this.variableDeductionForm.valid) {
        const formValue = this.variableDeductionForm.value.variableDeduction.map((allowance: any) => {
          const { variableDeductionLabel, ...rest } = allowance;
          return rest;
        });
        this.formDataChange.emit(formValue);
      } else {
        console.log("Form is invalid or incomplete");
      }
    });
  }

  patchFormValues() {
    const allowancesControl = this.variableDeductionForm.get('variableDeduction') as FormArray;
    allowancesControl.clear();

    this.selectedRecord.ctcTemplateVariableDeductions.forEach((item: any, index: number) => {
      allowancesControl.push(this.fb.group({
        variableDeduction: [item.variableDeduction?._id || ''],
        variableDeductionLabel: [item.variableDeduction?.label || ''],
        criteria: [item.criteria || 'Amount'],
        value: [item.value || ''],
        valueType: item.valueType || '',
        minimumAmount: [item.minimumAmount || 0]
      }));
    });
  }

  get allowances() {
    return (this.variableDeductionForm.get('variableDeduction') as FormArray).controls;
  }
}
