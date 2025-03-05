import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
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
  dialogRef: MatDialogRef<any>;

  constructor(private toastr: ToastrService,
    private fb: FormBuilder,
    private payroll: PayrollService
  ) {
    this.pfTemplateForm = this.fb.group({
      templateName: ['', Validators.required],
      allowanceApplicable: [[]]
    })
  }

  ngOnInit() {
    if (this.changeMode) {
      this.payroll.data.subscribe(res => {
        this.pfTemplateForm.patchValue({
          templateName: res.templateName,
          allowanceApplicable: res.allowanceApplicable
        })
      })
    }
    this.fixedAllowance = this.payroll.fixedAllowance.getValue();
  }

  closeModal() {
    this.dialogRef.close();
  }

  onSubmission() {
    if (!this.changeMode) {
      console.log(this.pfTemplateForm.value);
      this.payroll.addPFTemplate(this.pfTemplateForm.value).subscribe(res => {
        const response = res.data;
        this.payroll.addResponse.next(response);
        this.toastr.success('PF Template Added Successfully');
        this.pfTemplateForm.reset();
        this.closeModal();
      },
        err => {
          this.toastr.error('PF Template can not be added', 'ERROR!')
        })
    }
    else {
      const id = this.payroll.data.getValue()._id;
      console.log(id);
      this.payroll.updatePFTemplate(id, this.pfTemplateForm.value).subscribe((res: any) => {
        this.roundingRule = res.data;
        this.payroll.addResponse.next(this.roundingRule);
        this.toastr.success('PF Template Updated Successfully');
        this.closeModal();
      },
        err => {
          this.toastr.error('PF Template can not be updated', 'ERROR!')
        })
    }
  }

}