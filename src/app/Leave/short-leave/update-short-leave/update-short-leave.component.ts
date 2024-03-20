import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { LeaveService } from 'src/app/_services/leave.service';

@Component({
  selector: 'app-update-short-leave',
  templateUrl: './update-short-leave.component.html',
  styleUrl: './update-short-leave.component.css'
})
export class UpdateShortLeaveComponent {
  @Output() shortLeaveRefreshed: EventEmitter<void> = new EventEmitter<void>();
  updateLeaveReport: FormGroup;
  leaveUpdateStatus: any;

  constructor(public leaveService: LeaveService,
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<UpdateShortLeaveComponent>) {
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
    let payload = {
      employee: this.leaveUpdateStatus.employee,
      date: this.leaveUpdateStatus.date,
      startTime: this.leaveUpdateStatus.startTime,
      endTime: this.leaveUpdateStatus.endTime,
      durationInMinutes: this.leaveUpdateStatus.durationInMinutes,
      comments: this.leaveUpdateStatus.comments,
      status: this.leaveUpdateStatus.status,
      level1Reason: this.leaveUpdateStatus.level1Reason,
      level2Reason: this.leaveUpdateStatus.level2Reason
    }
    this.leaveService.updateShortLeave(id, payload).subscribe((res: any) => {
      this.shortLeaveRefreshed.emit();
      this.dialogRef.close();
    });
    this.shortLeaveRefreshed.emit();
  }
}
