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
  @Input() data: any;
  @Output() formDataChange = new EventEmitter<any>();
  allfixedAllowances: any[] = [];
  variableAllowances: any[] = [];
  variableAllowanceForm: FormGroup;
  combinedDataChange: any;
  @Input() selectedRecord: any;

  constructor(private payroll: PayrollService, private fb: FormBuilder) {
    this.variableAllowanceForm = this.fb.group({
      variableAllowance: this.fb.array([])
    });
  }

  ngOnInit() {
    this.getVariableAllowances();
    this.initForm();
  }

  initForm() {
    const allowancesControl = this.variableAllowanceForm.get('variableAllowance') as FormArray;
    this.variableAllowances = this.data.ctcTemplateFixedAllowance || [];

    this.variableAllowances.forEach(fa => {
      allowancesControl.push(this.fb.group({
        variableAllowance: [fa],
        criteria: ['Amount'],
        value: [''],
        valueType: [0],
        minimumAmount: ['']
      }));
    });

    this.variableAllowanceForm.valueChanges.subscribe(() => {
      this.formDataChange.emit(this.variableAllowanceForm.value.fixedAllowance);
    });
  }
  get allowances() {
    return (this.variableAllowanceForm.get('variableAllowance') as FormArray).controls;
  }

  getVariableAllowances() {
    let payload = {
      next: '',
      skip: ''
    }
    this.payroll.getVariableAllowance(payload).subscribe((res: any) => {
      this.allfixedAllowances = res.data;
    });
  }

  getAllowance(allowance: string) {
    const matchingAllowance = this.allfixedAllowances?.find(res => res._id === allowance);
    return matchingAllowance ? matchingAllowance.label : '';
  }

}
