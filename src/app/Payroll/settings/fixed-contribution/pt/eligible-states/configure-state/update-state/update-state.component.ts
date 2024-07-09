import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PayrollService } from 'src/app/_services/payroll.service';

@Component({
  selector: 'app-update-state',
  templateUrl: './update-state.component.html',
  styleUrl: './update-state.component.css'
})
export class UpdateStateComponent  implements OnInit{
  @Input() isEdit: boolean;
  @Input() data: any;
  addStateForm: FormGroup;
  @Output() close = new EventEmitter<void>();
  constructor(private payroll: PayrollService,
    private fb: FormBuilder
  ) {
    this.addStateForm = this.fb.group({
      state: [''],
      frequency: ['']
    })
  }

  ngOnInit() {
    console.log(this.isEdit);
    // if (this.isEdit) {
    //   this.addStateForm.patchValue({
    //     state: this.data.state,
    //     frequency: this.data.frequency
    //   });
    // }
  }

  closeModal() {
    this.close.emit();
  }
  onSubmission() {
    this.payroll.addConfiguredState(this.addStateForm.value).subscribe((res: any) => {
      console.log(res.data);
      this.payroll.configureState.next(res.data);
    })
  }
}
