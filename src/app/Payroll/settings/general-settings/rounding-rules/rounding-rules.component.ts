import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { PayrollService } from 'src/app/_services/payroll.service';

@Component({
  selector: 'app-rounding-rules',
  templateUrl: './rounding-rules.component.html',
  styleUrl: './rounding-rules.component.css'
})
export class RoundingRulesComponent {
  @Output() close: any = new EventEmitter();
  @Input() changeMode: boolean ;
  roundingRulesForm: FormGroup;
  roundingRule: any;

  constructor(private toaster: ToastrService,
    private fb: FormBuilder,
    private payroll: PayrollService
  ) {
    this.roundingRulesForm = this.fb.group({
      generalSetting: ['', Validators.required],
      name: ['', Validators.required],
      roundingType: ['', Validators.required]
    })
  }

  ngOnInit() {
    if (this.changeMode) {
      this.payroll.data.subscribe(res =>{
      this.roundingRulesForm.patchValue({
        generalSetting: this.payroll.generalSettings.getValue()._id,
        name: res.name,
        roundingType: res.roundingType
      })
    })
    }
  }

  closeModal() {
    this.close.emit(true);
  }

  onSubmission() {
    if (!this.changeMode) {
      this.roundingRulesForm.value.generalSetting = this.payroll.generalSettings.getValue()._id;
      console.log(this.payroll.generalSettings.getValue()._id);
      this.payroll.addRoundingRules(this.roundingRulesForm.value).subscribe((res: any) => {
        this.roundingRule = res.data;
        this.payroll.addResponse.next(this.roundingRule);
        this.roundingRulesForm.reset();
        this.toaster.success('Rounding Rules Added Successfully');
        this.closeModal();
      },
      err =>{
        this.toaster.error('Rounding Rules Add Failed');
      })
    }
    else {
      this.payroll.updateRoundingRules(this.payroll.data.getValue()._id, this.roundingRulesForm.value).subscribe((res: any) => {
        this.roundingRule = res.data;
        this.payroll.addResponse.next(this.roundingRule);
        this.toaster.success('Rounding Rules Updated Successfully');

        this.closeModal();
      },
    err =>{
      this.toaster.error('Rounding Rules Update Failed');
    })
    }
  }

}