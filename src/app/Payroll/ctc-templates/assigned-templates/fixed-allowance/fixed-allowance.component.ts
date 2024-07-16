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

  constructor(private payroll: PayrollService, private fb: FormBuilder) {
    this.fixedAllowanceForm = this.fb.group({
      fixedAllowance: this.fb.array([])
    });
  }

  ngOnInit() {
    this.getFixedAllowances();
    this.initForm();
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
        minimumAmount: ['']
      }));
    });

    this.fixedAllowanceForm.valueChanges.subscribe(() => {
      this.formDataChange.emit(this.fixedAllowanceForm.value.fixedAllowance);
    });
  }
  // initForm() {
  //   const allowancesControl = this.fixedAllowanceForm.get('fixedAllowance') as FormArray;

  //   // Check if isEdit is false (update mode)
  //   if (this.isEdit && this.selectedRecord && this.selectedRecord.ctcTemplateFixedAllowances) {
  //     this.fixedAllowances = this.selectedRecord.ctcTemplateFixedAllowances;
  //   } else {
  //     this.fixedAllowances = this.data.ctcTemplateFixedAllowance || [];
  //   }

  //   this.fixedAllowances.forEach(fa => {
  //     allowancesControl.push(this.fb.group({
  //       fixedAllowance: [fa.fixedAllowance || ''],
  //       criteria: [fa.criteria || 'Amount'],
  //       value: [fa.value || ''],
  //       valueType: [fa.valueType || 0],
  //       minimumAmount: [fa.minimumAmount || '']
  //     }));
  //   });

  //   this.fixedAllowanceForm.valueChanges.subscribe(() => {
  //     this.formDataChange.emit(this.fixedAllowanceForm.value.fixedAllowance);
  //   });
  // }
  get allowances() {
    return (this.fixedAllowanceForm.get('fixedAllowance') as FormArray).controls;
  }

  getFixedAllowances() {
    let payload = {
      next: '',
      skip: ''
    }
    this.payroll.getFixedAllowance(payload).subscribe((res: any) => {
      this.allfixedAllowances = res.data;
    });
  }

  getAllowance(allowance: string) {
    const matchingAllowance = this.allfixedAllowances?.find(res => res._id === allowance);
    return matchingAllowance ? matchingAllowance.label : '';
  }

}
