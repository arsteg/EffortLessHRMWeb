import { Component, EventEmitter, Inject, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { AttendanceService } from 'src/app/_services/attendance.service';

@Component({
  selector: 'app-update-on-duty',
  templateUrl: './update-on-duty.component.html',
  styleUrl: './update-on-duty.component.css'
})
export class UpdateOnDutyComponent {
  onDutyShiftForm: FormGroup;
  @Output() onDutyRequest: EventEmitter<void> = new EventEmitter<void>();
  status: any;

  constructor(private fb: FormBuilder,
    private attendanceService: AttendanceService,
    private toast:ToastrService,
    public dialogRef: MatDialogRef<UpdateOnDutyComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { report: any } 
  ) {
    this.onDutyShiftForm = this.fb.group({
      user: ['', Validators.required],
      onDutyReason: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      comment: ['', Validators.required],
      status: ['Pending'],
      primaryApprovar: [null],
      primaryApprovarComment: [''],
      secondaryApprovar: [null],
      secondaryApprovarComment: [''],
    })
  }

  ngOnInit() {
    this.status = this.attendanceService.status.getValue();
  }

  onSubmission() {
    const status = this.attendanceService.status.getValue();
    let payload = {
      user: status.user,
      onDutyReason: status.onDutyReason,
      startDate: status.startDate,
      endDate: status.endDate,
      comment: status.comment,
      status: status.status,
      primaryApprovar: status.primaryApprovar,
      primaryApprovarComment: status.primaryApprovarComment,
      secondaryApprovar: status.secondaryApprovar,
      secondaryApprovarComment: status.secondaryApprovarComment
    }
    this.attendanceService.updateOnDutyRequest(status._id, payload).subscribe({
      next: (res: any) => {
        this.onDutyRequest.emit();
        this.dialogRef.close();
        this.toast.success('On Duty Request Updated', 'Successfully!');
      },
      error: (err) => {
        console.error(err);
        this.toast.error('Failed to update On Duty Request', 'Error');
      }
    });
  }
}
