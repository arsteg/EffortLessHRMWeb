import { Component, EventEmitter, Input, Output, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-assigned-fixed-allowance',
  templateUrl: './fixed-allowance.component.html',
  styleUrls: ['./fixed-allowance.component.css']
})
export class AssignedFixedAllowanceComponent{
  @Input() isEdit: boolean = false;
  @Input() selectedRecord: any = {};
  @Input() ctcTemplateFixedAllowance: any[] = [];
  @Output() formDataChange = new EventEmitter<any>();

  fixedAllowanceForm: FormGroup;
  fixedAllowance: any[] = [];
  constructor(private fb: FormBuilder) {
    this.fixedAllowanceForm = this.fb.group({
      fixedAllowance: this.fb.array([])
    });
  }

  ngOnInit() {
    this.initForm();
  }
  isFormValid(): boolean {
    const formArray = this.fixedAllowanceForm.get('fixedAllowance') as FormArray;
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
    const allowancesControl = this.fixedAllowanceForm.get('fixedAllowance') as FormArray;
    
    this.fixedAllowance = this.selectedRecord?.ctcTemplateFixedAllowances || this.ctcTemplateFixedAllowance || [];

    this.fixedAllowance.forEach(item => {
      allowancesControl.push(this.fb.group({
        fixedAllowance: [item.fixedAllowance?._id || item._id || '', Validators.required],
        fixedAllowanceLabel: [item.fixedAllowance?.label || item.label || '', Validators.required],
        criteria: [item.criteria || 'Amount', Validators.required],
        value: [item.value ?? '', [Validators.required, Validators.min(0)]],
        valueType: [item.valueType ?? '0'],
        minimumAmount: [item.minimumAmount ?? '', [Validators.required, Validators.min(0)]]
      }));
    });   
    this.fixedAllowanceForm.valueChanges.subscribe(() => {
      if (this.fixedAllowanceForm.valid) {
        const formValue = this.fixedAllowanceForm.value.fixedAllowance.map((allowance: any) => {
          const { fixedAllowanceLabel, ...rest } = allowance;
          return rest;
        });
        this.formDataChange.emit(formValue);
      } else {
        this.formDataChange.emit([]);
      }
    });
  } 
  get allowances() {
    return (this.fixedAllowanceForm.get('fixedAllowance') as FormArray).controls;
  }
}