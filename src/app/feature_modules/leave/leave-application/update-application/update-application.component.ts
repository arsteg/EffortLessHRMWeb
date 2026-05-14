import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { LeaveService } from 'src/app/_services/leave.service';
import { toUtcDateOnly } from 'src/app/util/date-utils';

@Component({
  selector: 'app-update-application',
  templateUrl: './update-application.component.html',
  styleUrl: './update-application.component.css'
})
export class UpdateApplicationComponent {
  @Output() shortLeaveRefreshed: EventEmitter<void> = new EventEmitter<void>();
  updateLeaveReport: FormGroup;
  leaveUpdateStatus: any;

  constructor(public leaveService: LeaveService,
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<UpdateApplicationComponent>) {
    this.updateLeaveReport = this.fb.group({
      employee: [''],
      date: [],
      startTime: [],
      endTime: [],
      durationInMinutes: [],
      comments: [''],
      status: [''],
      level1Reason: [''],
      level2Reason: ['']

    })
  }

  updateApprovedReport() {
    this.leaveUpdateStatus = this.leaveService.leave.getValue();
    let id = this.leaveService.leave.getValue()._id;

    // Get the reason from the form based on the original status
    const formValues = this.updateLeaveReport.value;
    const level1Reason = this.leaveUpdateStatus.originalStatus === 'Level 1 Approval Pending'
      ? formValues.level1Reason
      : this.leaveUpdateStatus.level1Reason;
    const level2Reason = this.leaveUpdateStatus.originalStatus === 'Level 2 Approval Pending'
      ? formValues.level2Reason
      : this.leaveUpdateStatus.level2Reason;

    let payload = {
      employee: this.leaveUpdateStatus.employeeId,
      leaveCatgeory: this.leaveUpdateStatus.leaveCategory,
      startDate: toUtcDateOnly(this.leaveUpdateStatus.startDate),
      endDate: toUtcDateOnly(this.leaveUpdateStatus.endDate),
      durationInMinutes: this.leaveUpdateStatus.durationInMinutes,
      comments: this.leaveUpdateStatus.comments,
      status: this.leaveUpdateStatus.status,
      level1Reason: level1Reason,
      level2Reason: level2Reason,
      isHalfDayOption: this.leaveUpdateStatus.isHalfDayOption
    }
    this.leaveService.updateLeaveApplication(id, payload).subscribe((res: any) => {
      this.shortLeaveRefreshed.emit();
      this.dialogRef.close(res);
    });
    this.shortLeaveRefreshed.emit();
  }
  closeModal() {
    this.dialogRef.close();
  }
  
}
