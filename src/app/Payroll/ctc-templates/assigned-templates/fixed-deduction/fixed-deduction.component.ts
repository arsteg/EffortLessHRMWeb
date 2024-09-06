import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { PayrollService } from 'src/app/_services/payroll.service';

@Component({
  selector: 'app-assigned-fixed-deduction',
  templateUrl: './fixed-deduction.component.html',
  styleUrl: './fixed-deduction.component.css'
})
export class AssignedFixedDeductionComponent {
  @Input() data: any;
  allfixedDeduction: any[] = [];
  fixedDeduction: any[] = [];
  fixedDeductionForm: FormGroup;
  @Output() formDataChange = new EventEmitter<any>();
  @Input() isEdit: boolean;
  @Input() selectedRecord: any;

  constructor(private payroll: PayrollService,
    private fb: FormBuilder
  ) {
    this.fixedDeductionForm = this.fb.group({
      fixedDeduction: this.fb.array([])
    });
  }

  ngOnInit() {
    this.getFixedDeduction();
    this.initForm();
    console.log(this.selectedRecord, this.isEdit);
    if (this.isEdit && this.selectedRecord) {
      console.log(this.selectedRecord)
      this.patchFormValues();
    }
  }
  initForm() {
    const allowancesControl = this.fixedDeductionForm.get('fixedDeduction') as FormArray;
    this.fixedDeduction = this.data.ctcTemplateFixedDeduction;
    console.log(this.fixedDeduction);
    this.fixedDeduction.forEach(fd => {
      allowancesControl.push(this.fb.group({
        fixedDeduction: [fd],
        criteria: ['Amount'],
        value: [''],
        valueType: [0],
        minimumAmount: [0]
      }));
    });
    this.fixedDeductionForm.valueChanges.subscribe(() => {
      this.formDataChange.emit(this.fixedDeductionForm.value.fixedDeduction);
    });
  }
  patchFormValues() {
    const allowancesControl = this.fixedDeductionForm.get('fixedDeduction') as FormArray;
    allowancesControl.clear();
    this.selectedRecord.ctcTemplateFixedDeductions.forEach((item: any) => {
      allowancesControl.push(this.fb.group({
        fixedDeduction: [item.fixedDeduction || ''],
        criteria: [item.criteria || 'Amount'],
        value: [item.value || ''],
        valueType: item.valueType || 0,
        minimumAmount: [item.minimumAmount || 0]
      }));
    });
    console.log(this.fixedDeductionForm.value);
  }
  get allowances() {
    return (this.fixedDeductionForm.get('fixedDeduction') as FormArray).controls;
  }

  getFixedDeduction() {
    let payload = {
      next: '',
      skip: ''
    }
    this.payroll.getFixedDeduction(payload).subscribe((res: any) => {
      this.allfixedDeduction = res.data;
    });
  }
  getAllowance(allowance: string) {
    const matchingAllowance = this.allfixedDeduction?.find(res => res._id === allowance);
    return matchingAllowance ? matchingAllowance.label : '';
  }
}
