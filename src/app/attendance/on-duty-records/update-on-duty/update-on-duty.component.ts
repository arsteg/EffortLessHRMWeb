import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
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
  private dialogRef: MatDialogRef<UpdateOnDutyComponent>;
  status: any;

  constructor(private fb: FormBuilder,
    private attendanceService: AttendanceService,
    private toast:ToastrService
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
    this.attendanceService.updateOnDutyRequest(status._id, payload).subscribe((res: any) => {
      this.onDutyRequest.emit();
      this.dialogRef.close();
      this.toast.success('Status Updated', 'Successfully!' )
    })
  }
}
