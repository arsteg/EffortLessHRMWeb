import { Component, EventEmitter, Output } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { LeaveService } from 'src/app/_services/leave.service';

@Component({
  selector: 'app-view-application',
  templateUrl: './view-application.component.html',
  styleUrl: './view-application.component.css'
})
export class ViewApplicationComponent {
  totalLeaveDays = 0;
  @Output() close: any = new EventEmitter();
  leaveApplication: any;

  constructor(public leaveService: LeaveService,
    public dialogRef: MatDialogRef<ViewApplicationComponent>) {

  }

  ngOnInit() {
    this.leaveApplication = this.leaveService.leave.getValue();
    this.calculateTotalLeaveDays();
  }

  calculateTotalLeaveDays() {
    const leave = this.leaveService?.leave?.getValue();
    if (leave && leave.startDate && leave.endDate) {
      const startDate = new Date(leave.startDate);
      const endDate = new Date(leave.endDate);
      const timeDifference = endDate.getTime() - startDate.getTime();
      let totalDays = Math.abs(Math.round(timeDifference / (1000 * 3600 * 24))) + 1;
      if (leave.isHalfDayOption) {
        if (startDate.toDateString() === endDate.toDateString()) {
          totalDays = 0.5;
        } else {
          totalDays -= 0.5;
        }
      }
      this.totalLeaveDays = totalDays;
    }
  }

  closeModal() {
    this.dialogRef.close();
  }
}
