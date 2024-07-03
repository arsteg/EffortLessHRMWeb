import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PayrollService } from 'src/app/_services/payroll.service';

@Component({
  selector: 'app-gratuity-template',
  templateUrl: './gratuity-template.component.html',
  styleUrl: './gratuity-template.component.css'
})
export class GratuityTemplateComponent {
  @Input() roundingRule: any;
  @Output() close: any = new EventEmitter();
  @Input() changeMode: boolean = false;
  gratuityTemplateForm: FormGroup;
  fixedAllowance: any;

  constructor(private modalService: NgbModal,
    private fb: FormBuilder,
    private payroll: PayrollService
  ) {
    this.gratuityTemplateForm = this.fb.group({
      generalSetting: ['', Validators.required],
      name: ['', Validators.required],
      roundingType: ['', Validators.required]
    })
  }

  ngOnInit() {
    console.log(this.payroll.generalSettings.getValue());
    if (this.changeMode) {
      this.gratuityTemplateForm.patchValue({
        generalSetting: this.payroll.generalSettings.getValue()._id,
        name: this.roundingRule.name,
        roundingType: this.roundingRule.roundingType
      })
    }
    this.fixedAllowance = this.payroll.fixedAllowance.getValue();
  }

  closeModal() {
    this.close.emit(true);
  }

  onSubmission() {
    if (!this.changeMode) {
     
    }
    else {
      
    }
  }

}