import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { PayrollService } from 'src/app/_services/payroll.service';

@Component({
  selector: 'app-var-allowance',
  templateUrl: './var-allowance.component.html',
  styleUrl: './var-allowance.component.css'
})
export class VarAllowanceComponent {
  @Input() isEdit: boolean;
  // @Input() data: any;
  @Output() formDataChange = new EventEmitter<any>();
  allfixedAllowances: any[] = [];
  variableAllowances: any[] = [];
  variableAllowanceForm: FormGroup;
  combinedDataChange: any;
  selectedRecord: any;
  @Input() ctcTemplateVariableAllowance: any;

  constructor(
    private payroll: PayrollService,
    private fb: FormBuilder
  ) {
    this.variableAllowanceForm = this.fb.group({
      variableAllowance: this.fb.array([])
    });
  }

  ngOnInit() {
    this.initForm();
    this.selectedRecord = this.payroll?.selectedCTCTemplate.getValue();
      this.patchFormValues();
  }

  initForm() {
    const allowancesControl = this.variableAllowanceForm.get('variableAllowance') as FormArray;
    this.variableAllowances = this.selectedRecord?.ctcTemplateVariableAllowances || this.ctcTemplateVariableAllowance;

    this.variableAllowances.forEach(fa => {
      allowancesControl.push(this.fb.group({
        // variableAllowance: [fa],
        variableAllowance: [fa.variableAllowance?._id || ''],
        variableAllowanceLabel: [fa.variableAllowance?.label || ''],
        criteria: ['Amount'],
        value: [''],
        valueType: [0],
        minimumAmount: [0]
      }));
    });

    this.variableAllowanceForm.valueChanges.subscribe(() => {
      if (this.variableAllowanceForm.valid) {
        const formValue = this.variableAllowanceForm.value.variableAllowance.map((allowance: any) => {
          const { variableAllowanceLabel, ...rest } = allowance;
          return rest;
        });
        this.formDataChange.emit(formValue);
      } else {
        console.log("Form is invalid or incomplete");
      }
    });
  }

  patchFormValues() {
    const allowancesControl = this.variableAllowanceForm.get('variableAllowance') as FormArray;
    allowancesControl.clear();
   if(this.isEdit) {
    this.selectedRecord.ctcTemplateVariableAllowances.forEach((item: any, index: number) => {
      allowancesControl.push(this.fb.group({
        // variableAllowance: [item.variableAllowance?.label || ''],
        variableAllowance: [item.variableAllowance?._id || ''],
        variableAllowanceLabel: [item.variableAllowance?.label || ''],
        criteria: [item.criteria || 'Amount'],
        value: [item.value || ''],
        valueType: item.valueType || '',
        minimumAmount: [item.minimumAmount || 0]
      }));
    });
  }
  else if(!this.isEdit) {
    this.ctcTemplateVariableAllowance.forEach((item: any, index: number) => {
      allowancesControl.push(this.fb.group({
        variableAllowance: [item.variableAllowance?._id || ''],
        variableAllowanceLabel: [item.variableAllowance?.label || ''],
        criteria: [item.criteria || 'Amount'],
        value: [item.value || ''],
        valueType: item.valueType || '',
        minimumAmount: [item.minimumAmount || 0]
      }));
    });
  }
  }

  get allowances() {
    return (this.variableAllowanceForm.get('variableAllowance') as FormArray).controls;
  }
}