import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { PayrollService } from 'src/app/_services/payroll.service';

@Component({
  selector: 'app-update-state',
  templateUrl: './update-state.component.html',
  styleUrl: './update-state.component.css'
})
export class UpdateStateComponent implements OnInit {
  @Input() isEdit: boolean;
  @Input() data: any;
  addStateForm: FormGroup;
  @Output() close = new EventEmitter<void>();
  states: any;
  
  constructor(private payroll: PayrollService,
    private fb: FormBuilder,
    private toast: ToastrService
  ) {
    this.addStateForm = this.fb.group({
      state: ['', Validators.required],
      frequency: ['', Validators.required]
    })
  }

  ngOnInit() {
    if (this.isEdit) {
      this.addStateForm.patchValue({
        state: this.data.state,
        frequency: this.data.frequency
      });
    }
    this.getAllStates();
  }

  getAllStates() {
    this.payroll.getAllStates().subscribe((res: any) => {
      this.states = res.data;
      console.log(this.states);
    });
  }

  closeModal() {
    this.close.emit();
  }
  onSubmission() {
    if (!this.isEdit)
      this.payroll.addConfiguredState(this.addStateForm.value).subscribe((res: any) => {
        this.toast.success('Successfully', 'Configured State Added');
        this.payroll.configureState.next(res.data);
        this.addStateForm.reset();
      })
    else {
      this.payroll.updateConfiguredState(this.data._id, this.addStateForm.value).subscribe((res: any) => {
        this.toast.success('Successfully', 'Configured State Updated');
        this.payroll.configureState.next(res.data);
      })
    }
  }
}
