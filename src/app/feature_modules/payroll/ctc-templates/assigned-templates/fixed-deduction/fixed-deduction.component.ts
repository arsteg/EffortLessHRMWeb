import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { PayrollService } from 'src/app/_services/payroll.service';

@Component({
  selector: 'app-assigned-fixed-deduction',
  templateUrl: './fixed-deduction.component.html',
  styleUrls: ['./fixed-deduction.component.css'] // Fixed typo
})
export class AssignedFixedDeductionComponent {
  @Input() data: any;
  allfixedDeduction: any[] = [];
  fixedDeduction: any[] = [];
  fixedDeductionForm: FormGroup;
  @Output() formDataChange = new EventEmitter<any>();
  @Input() isEdit: boolean = false;
  @Input() selectedRecord: any = {};

  constructor(
    private fb: FormBuilder
  ) {
    this.fixedDeductionForm = this.fb.group({
      fixedDeduction: this.fb.array([])
    });
  }

  ngOnInit() {
    this.initForm();
    if (this.isEdit) {
      this.patchFormValues();
    }
  }

  initForm() {
    const allowancesControl = this.fixedDeductionForm.get('fixedDeduction') as FormArray;
    allowancesControl.clear();

    if (this.selectedRecord?.ctcTemplateFixedDeductions?.length) {
      this.fixedDeduction = this.selectedRecord.ctcTemplateFixedDeductions;

      this.fixedDeduction.forEach(fd => {
        allowancesControl.push(this.fb.group({
          fixedDeduction: [fd.fixedDeduction?._id || ''],
          fixedDeductionLabel: [fd.fixedDeduction?.label || ''],
          criteria: [fd.criteria || 'Amount'],
          value: [fd.value || ''],
          valueType: [fd.valueType || 0],
          minimumAmount: [fd.minimumAmount || 0]
        }));
      });
    }

    this.fixedDeductionForm.valueChanges.subscribe(() => {
      if (this.fixedDeductionForm.valid) {
        const formValue = this.fixedDeductionForm.value.fixedDeduction.map((allowance: any) => {
          const { fixedDeductionLabel, ...rest } = allowance;
          return rest;
        });
        this.formDataChange.emit(formValue);
      } else {
        console.log("Form is invalid or incomplete");
      }
    });
  }

  patchFormValues() {
    const allowancesControl = this.fixedDeductionForm.get('fixedDeduction') as FormArray;

    if (this.selectedRecord?.ctcTemplateFixedDeductions?.length) {
      this.selectedRecord.ctcTemplateFixedDeductions.forEach((item: any) => {
        allowancesControl.push(this.fb.group({
          fixedDeduction: [item.fixedDeduction?._id || ''],
          fixedDeductionLabel: [item.fixedDeduction?.label || ''],
          criteria: [item.criteria || 'Amount'],
          value: [item.value || ''],
          valueType: [item.valueType || 0],
          minimumAmount: [item.minimumAmount || 0]
        }));
      });
    }
  }

  get deductions() {
    return (this.fixedDeductionForm.get('fixedDeduction') as FormArray).controls;
  }
}
