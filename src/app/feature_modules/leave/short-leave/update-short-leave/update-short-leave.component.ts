import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
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

  @Input() selectedShortLeave: any;
  @Input() selectedStatus: string;
  @Input() modalInstance!: NgbModalRef;

  constructor(public leaveService: LeaveService,
    private fb: FormBuilder) {
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
    });
  }

  updateApprovedReport() {
    let payload = {
      employee: this.selectedShortLeave.employee,
      date: this.selectedShortLeave.Date,
      startTime: this.selectedShortLeave.start,
      endTime: this.selectedShortLeave.end,
      durationInMinutes: this.selectedShortLeave.durationInMinutes,
      comments: this.selectedShortLeave.comments,
      status: this.selectedStatus,
      level1Reason: this.selectedShortLeave.level1Reason,
      level2Reason: this.selectedShortLeave.level2Reason
    }
    this.leaveService.updateShortLeave(this.selectedShortLeave?._id, payload).subscribe((res: any) => {
      this.shortLeaveRefreshed.emit();
      this.modalInstance.close();
    });
    this.shortLeaveRefreshed.emit();
  }

}