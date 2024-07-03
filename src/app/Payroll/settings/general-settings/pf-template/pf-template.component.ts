import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PayrollService } from 'src/app/_services/payroll.service';

@Component({
  selector: 'app-pf-template',
  templateUrl: './pf-template.component.html',
  styleUrl: './pf-template.component.css'
})
export class PfTemplateComponent {
  @Input() roundingRule: any;
  @Output() close: any = new EventEmitter();
  @Input() changeMode: boolean = false;
  pfTemplateForm: FormGroup;
  fixedAllowance: any;

  constructor(private modalService: NgbModal,
    private fb: FormBuilder,
    private payroll: PayrollService
  ) {
    this.pfTemplateForm = this.fb.group({
      generalSetting: ['', Validators.required],
      name: ['', Validators.required],
      roundingType: ['', Validators.required]
    })
  }

  ngOnInit() {
    console.log(this.payroll.generalSettings.getValue());
    if (this.changeMode) {
      this.pfTemplateForm.patchValue({
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