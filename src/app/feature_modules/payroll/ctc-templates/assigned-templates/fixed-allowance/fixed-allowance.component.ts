import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { TableColumn } from 'src/app/models/table-column';

@Component({
  selector: 'app-assigned-fixed-allowance',
  templateUrl: './fixed-allowance.component.html',
  styleUrl: './fixed-allowance.component.css'
})
export class AssignedFixedAllowanceComponent {
  @Input() isEdit: boolean;
  @Output() formDataChange = new EventEmitter<any>();
  allfixedAllowances: any[] = [];
  fixedAllowances: any[] = [];
  fixedAllowanceForm: FormGroup;
  combinedDataChange: any;
  @Input() selectedRecord: any;
  @Input() ctcTemplateFixedAllowance: any;
  
  constructor(
    private fb: FormBuilder
  ) {
    this.fixedAllowanceForm = this.fb.group({
      fixedAllowance: this.fb.array([])
    });
  }

  ngOnInit() {
    this.initForm();
    this.patchFormValues();
  }

  initForm() {
    const allowancesControl = this.fixedAllowanceForm.get('fixedAllowance') as FormArray;
    this.fixedAllowances = this.selectedRecord.ctcTemplateFixedAllowances || this.ctcTemplateFixedAllowance;
    this.fixedAllowances.forEach(fa => {
      allowancesControl.push(this.fb.group({
        fixedAllowance: [fa.fixedAllowance?._id || ''],
        fixedAllowanceLabel: [fa.fixedAllowance?.label || ''],
        criteria: ['Amount'],
        value: ['', [Validators.min(0)]],
        valueType: [0],
        minimumAmount: [0, [Validators.min(0)]]
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
        console.log("Form is invalid or incomplete");
      }
    });
  }

  patchFormValues() {
    const allowancesControl = this.fixedAllowanceForm.get('fixedAllowance') as FormArray;
    allowancesControl.clear();
    if (this.isEdit) {
      this.selectedRecord.ctcTemplateFixedAllowances.forEach((item: any) => {
        allowancesControl.push(this.fb.group({
          fixedAllowance: [item.fixedAllowance?._id || ''],
          fixedAllowanceLabel: [item.fixedAllowance?.label || ''],
          criteria: [item.criteria || 'Amount'],
          value: [item.value || '', [Validators.min(0)]],
          valueType: [item.valueType || 0],
          minimumAmount: [item.minimumAmount || 0, [Validators.min(0)]]
        }));
      });
    }
    else if (!this.isEdit) {
      this.ctcTemplateFixedAllowance.forEach((item: any) => {
        allowancesControl.push(this.fb.group({
          fixedAllowance: [item.fixedAllowance?._id || ''],
          fixedAllowanceLabel: [item.fixedAllowance?.label || ''],
          criteria: [item.criteria || 'Amount'],
          value: [item.value || '', [Validators.min(0)]],
          valueType: [item.valueType || 0],
          minimumAmount: [item.minimumAmount || 0, [Validators.min(0)]]
        }));
      });
    }
  }

  get allowances() {
    return (this.fixedAllowanceForm.get('fixedAllowance') as FormArray).controls;
  } 
}