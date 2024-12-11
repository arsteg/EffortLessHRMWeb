import { Component, Input } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-payroll-steps',
  templateUrl: './payroll-steps.component.html',
  styleUrl: './payroll-steps.component.css'
})
export class PayrollStepsComponent {
  firstFormGroup = this._formBuilder.group({
    firstCtrl: ['', Validators.required],
  });
  secondFormGroup = this._formBuilder.group({
    secondCtrl: ['', Validators.required],
  });
  isEditable = false;
  @Input() selectedPayroll: any;

  constructor(private _formBuilder: FormBuilder) {}

  
  ngOnInit(){
  }
}
