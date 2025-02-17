import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { PayrollService } from 'src/app/_services/payroll.service';
@Component({
  selector: 'app-assigned-fixed-allowance',
  templateUrl: './fixed-allowance.component.html',
  styleUrl: './fixed-allowance.component.css'
})
export class AssignedFixedAllowanceComponent {
  @Input() isEdit: boolean;
  @Input() data: any;
  @Output() formDataChange = new EventEmitter<any>();
  allfixedAllowances: any[] = [];
  fixedAllowances: any[] = [];
  fixedAllowanceForm: FormGroup;
  combinedDataChange: any;
  @Input() selectedRecord: any;

  constructor(
    private payroll: PayrollService,
    private fb: FormBuilder
  ) {
    this.fixedAllowanceForm = this.fb.group({
      fixedAllowance: this.fb.array([])
    });
  }

  ngOnInit() {
    this.initForm();
    if (this.isEdit && this.selectedRecord) {
      this.patchFormValues();
    }
  }

  initForm() {
    const allowancesControl = this.fixedAllowanceForm.get('fixedAllowance') as FormArray;
    this.fixedAllowances = this.data.ctcTemplateFixedAllowance || [];
    this.fixedAllowances.forEach(fa => {
      allowancesControl.push(this.fb.group({
        fixedAllowance: [fa],
        criteria: ['Amount'],
        value: [''],
        valueType: [0],
        minimumAmount: [0]
      }));
    });

    this.fixedAllowanceForm.valueChanges.subscribe(() => {
      if (this.fixedAllowanceForm.valid) {
        this.formDataChange.emit(this.fixedAllowanceForm.value.fixedAllowance);
      } else {
        console.log("Form is invalid or incomplete");
      }
    });
  }

  patchFormValues() {
    const allowancesControl = this.fixedAllowanceForm.get('fixedAllowance') as FormArray;
    allowancesControl.clear();
    this.selectedRecord.ctcTemplateFixedAllowances.forEach((item: any) => {
      allowancesControl.push(this.fb.group({
        fixedAllowance: [item.fixedAllowance?.label || ''],
        criteria: [item.criteria || 'Amount'],
        value: [item.value || ''],
        valueType: [item.valueType || 0],
        minimumAmount: [item.minimumAmount || 0]
      }));
    });
  }

  get allowances() {
    return (this.fixedAllowanceForm.get('fixedAllowance') as FormArray).controls;
  }
}