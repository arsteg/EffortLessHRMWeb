import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PayrollService } from 'src/app/_services/payroll.service';

@Component({
  selector: 'app-var-deduction',
  templateUrl: './var-deduction.component.html',
  styleUrls: ['./var-deduction.component.css']
})
export class VarDeductionComponent {
  @Input() isEdit: boolean = false;
  @Input() ctcTemplateVariableDeduction: any;
  @Output() formDataChange = new EventEmitter<any>();

  variableDeductionForm: FormGroup;
  variableDeduction: any[] = [];
  selectedRecord: any;

  constructor(
    private fb: FormBuilder,
    private payroll: PayrollService
  ) {
    this.variableDeductionForm = this.fb.group({
      variableDeduction: this.fb.array([])
    });
  }

  ngOnInit() {
    this.selectedRecord = this.payroll?.selectedCTCTemplate.getValue();
    this.initForm();
  }

  isFormValid(): boolean {
    const formArray = this.variableDeductionForm.get('variableDeduction') as FormArray;
    let isValid = true;

    formArray.controls.forEach(control => {
      control.markAllAsTouched();
      if (control.invalid) {
        isValid = false;
      }
    });

    return isValid;
  }

  initForm() {
    const deductionArray = this.variableDeductionForm.get('variableDeduction') as FormArray;
  
    this.variableDeduction = this.selectedRecord?.ctcTemplateVariableDeductions || this.ctcTemplateVariableDeduction || [];
   
    this.variableDeduction.forEach(vd => {
      deductionArray.push(this.fb.group({
        variableDeduction: [vd.variableDeduction?._id || vd._id || ''],
        variableDeductionLabel: [vd.variableDeduction?.label || vd.label || ''],
        criteria: [vd.criteria || 'Amount'],
        value: [vd.value ?? '', [Validators.required, Validators.min(0)]],
        valueType: [vd.valueType ?? 0],
        minimumAmount: [vd.minimumAmount ?? '', [Validators.min(0)]]
      }));
    });

    this.variableDeductionForm.valueChanges.subscribe(() => {
      if (this.variableDeductionForm.valid) {
        const cleaned = this.variableDeductionForm.value.variableDeduction.map((item: any) => {
          const { variableDeductionLabel, ...rest } = item;
          return rest;
        });
        this.formDataChange.emit(cleaned);
      } else {
        this.formDataChange.emit([]);
      }
    });
  }

  get deductions() {
    return (this.variableDeductionForm.get('variableDeduction') as FormArray).controls;
  }
}