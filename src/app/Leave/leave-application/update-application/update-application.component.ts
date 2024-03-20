import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { LeaveService } from 'src/app/_services/leave.service';

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
    let payload = {
      employee: this.leaveUpdateStatus.employee,
      leaveCatgeory: this.leaveUpdateStatus.leaveCategory,
      startTime: this.leaveUpdateStatus.startTime,
      endTime: this.leaveUpdateStatus.endTime,
      durationInMinutes: this.leaveUpdateStatus.durationInMinutes,
      comments: this.leaveUpdateStatus.comments,
      status: this.leaveUpdateStatus.status,
      level1Reason: this.leaveUpdateStatus.level1Reason,
      level2Reason: this.leaveUpdateStatus.level2Reason,
      isHalfDayOption: this.leaveUpdateStatus.isHalfDayOption
    }
    this.leaveService.updateLeaveApplication(id, payload).subscribe((res: any) => {
      this.shortLeaveRefreshed.emit();
      this.dialogRef.close();
    });
    this.shortLeaveRefreshed.emit();
  }
  closeModal() {
    this.dialogRef.close();
  }
  
}
