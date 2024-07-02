import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PayrollService } from 'src/app/_services/payroll.service';

@Component({
  selector: 'app-rounding-rules',
  templateUrl: './rounding-rules.component.html',
  styleUrl: './rounding-rules.component.css'
})
export class RoundingRulesComponent {
  @Input() roundingRule: any;
  @Output() close: any = new EventEmitter();
  @Input() changeMode: boolean = false;
  roundingRulesForm: FormGroup;

  constructor(private modalService: NgbModal,
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
    console.log(this.payroll.generalSettings.getValue());
    if(this.changeMode){
      this.roundingRulesForm.patchValue({
        generalSetting: this.payroll.generalSettings.getValue()._id,
        name: this.roundingRule.name,
        roundingType: this.roundingRule.roundingType
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
        this.closeModal();
      })
    }
    else {
      this.payroll.updateRoundingRules(this.roundingRule._id, this.roundingRulesForm.value).subscribe((res: any) => {
        this.roundingRule = res.data;
        this.payroll.addResponse.next(this.roundingRule);
        this.closeModal();
    })
  }
}

}