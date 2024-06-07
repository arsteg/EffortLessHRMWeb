import { Component, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { AttendanceService } from 'src/app/_services/attendance.service';

@Component({
  selector: 'app-update-record',
  templateUrl: './update-record.component.html',
  styleUrl: './update-record.component.css'
})
export class UpdateRecordComponent {
  updateRegularization: FormGroup;
  status: any;
  @Output() regularization: EventEmitter<void> = new EventEmitter<void>();


  constructor(private fb: FormBuilder,
    private attendanceService: AttendanceService,
    private dialogRef: MatDialogRef<UpdateRecordComponent>
  ) {
    this.updateRegularization = this.fb.group({
      regularizationDate: [],
      requestType: [''],
      shift: [''],
      checkInTime: [],
      checkOutTime: [],
      firstApprover: [''],
      firstApproverDate: [],
      firstApproverComment: [''],
      secondApprover: [''],
      secondApproverDate: [],
      secondApproverComment: [''],
      reason: [''],
      isHalfDayRegularization: [true],
      halfDayType: [''],
      comment: [''],
      user: [''],
      status: ['']
    })
  }

  ngOnInit() {
    this.status = this.attendanceService.status.getValue();
    console.log(this.status)
  }

  onSubmission() {
    const status = this.attendanceService.status.getValue();
    let payload = {
      regularizationDate: status.regularizationDate,
      requestType: status.requestType,
      shift: status.shift,
      checkInTime: status.checkInTime,
      checkOutTime: status.checkOutTime,
      firstApprover: status.firstApprover,
      firstApproverDate: status.firstApproverDate,
      firstApproverComment: this.updateRegularization.value.firstApproverComment,
      secondApprover: status.secondApprover,
      secondApproverDate: status.secondApproverDate,
      secondApproverComment: status.secondApproverComment,
      reason: status.reason,
      isHalfDayRegularization: status.isHalfDayRegularization,
      halfDayType: status.halfDayType,
      comment: status.comment,
      user: status.user,
      status: status.status
    }
    this.attendanceService.updateRegularization(status._id, payload).subscribe((res: any) => {
      this.regularization.emit();
      this.dialogRef.close();
    })
  }
}
