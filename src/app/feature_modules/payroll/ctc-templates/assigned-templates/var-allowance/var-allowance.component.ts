import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CustomValidators } from 'src/app/_helpers/custom-validators';

@Component({
  selector: 'app-var-allowance',
  templateUrl: './var-allowance.component.html',
  styleUrls: ['./var-allowance.component.css']
})
export class VarAllowanceComponent{
  @Input() isEdit: boolean = false;
  @Input() selectedRecord: any = {};
  @Input() ctcTemplateVariableAllowance: any[] = [];
  @Output() formDataChange = new EventEmitter<any>();

  variableAllowanceForm: FormGroup;
  variableAllowance: any[] = [];

  constructor(private fb: FormBuilder) {
    this.variableAllowanceForm = this.fb.group({
      variableAllowance: this.fb.array([])
    });
  }
  ngOnInit() {
    this.initForm();
  }

  isFormValid(): boolean {
    const formArray = this.variableAllowanceForm.get('variableAllowance') as FormArray;
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
    const allowanceArray = this.variableAllowanceForm.get('variableAllowance') as FormArray;
   
    this.variableAllowance = this.selectedRecord?.ctcTemplateVariableAllowances || this.ctcTemplateVariableAllowance || [];

    this.variableAllowance.forEach(item => {
      allowanceArray.push(this.fb.group({
        variableAllowance: [item.variableAllowance?._id || item._id || '', Validators.required],
        variableAllowanceLabel: [item.variableAllowance?.label || item.label || '', Validators.required],
        criteria: [item.criteria || 'Amount', Validators.required],
        value: [item.value || '', [Validators.required, Validators.min(0)]],
        valueType: [item.valueType || '0'],
        minimumAmount: [item.minimumAmount || '',  [Validators.required, Validators.min(0)]]
    }, { validators: CustomValidators.minimumAmountLessThanOrEqualValue }));
    });
    
    this.variableAllowanceForm.valueChanges.subscribe(() => {
      if (this.variableAllowanceForm.valid) {
        const formValue = this.variableAllowanceForm.value.variableAllowance.map((allowance: any) => {
          const { variableAllowanceLabel, ...rest } = allowance;
          return rest;
        });
        this.formDataChange.emit(formValue);
      } else {
        this.formDataChange.emit([]);
      }
    });
  }
  get allowances() {
    return (this.variableAllowanceForm.get('variableAllowance') as FormArray).controls;
  }
}