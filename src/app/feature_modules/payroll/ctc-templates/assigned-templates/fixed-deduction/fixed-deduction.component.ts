import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-assigned-fixed-deduction',
  templateUrl: './fixed-deduction.component.html',
  styleUrls: ['./fixed-deduction.component.css']
})
export class AssignedFixedDeductionComponent {
  @Input() isEdit: boolean = false;
  @Input() selectedRecord: any = {};
  @Input() ctcTemplateFixedDeduction: any[] = [];
  @Output() formDataChange = new EventEmitter<any>();
  fixedDeductionForm: FormGroup;
  fixedDeduction: any[] = [];
  constructor(private fb: FormBuilder) {
    this.fixedDeductionForm = this.fb.group({
      fixedDeduction: this.fb.array([])
    });
  }

  ngOnInit() {
    this.initForm();
  }

  isFormValid(): boolean {
    const formArray = this.fixedDeductionForm.get('fixedDeduction') as FormArray;
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
    const deductionsControl = this.fixedDeductionForm.get('fixedDeduction') as FormArray;

     this.fixedDeduction = this.selectedRecord?.ctcTemplateFixedDeductions || this.ctcTemplateFixedDeduction || [];

    (this.fixedDeduction || []).forEach(item => {
      deductionsControl.push(this.fb.group({
        fixedDeduction: [item.fixedDeduction?._id || item._id || '', Validators.required],
        fixedDeductionLabel: [item.fixedDeduction?.label || item.label || '', Validators.required],
        criteria: [item.criteria || 'Amount', Validators.required],
        value: [item.value ?? '', [Validators.required, Validators.min(0)]],
        valueType: [item.valueType ?? '0'],
        minimumAmount: [item.minimumAmount ?? '', [Validators.required, Validators.min(0)]]
      }));
    });
    this.fixedDeductionForm.valueChanges.subscribe(() => {
      if (this.fixedDeductionForm.valid) {
        const formValue = this.fixedDeductionForm.value.fixedDeduction.map((deduction: any) => {
          const { fixedDeductionLabel, ...rest } = deduction;
          return rest;
        });
        this.formDataChange.emit(formValue);
      } else {
        this.formDataChange.emit([]);
      }
    });   
  }

  get deductions() {
    return (this.fixedDeductionForm.get('fixedDeduction') as FormArray).controls;
  }
}