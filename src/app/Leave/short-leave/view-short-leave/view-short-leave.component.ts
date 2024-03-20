import { Component, EventEmitter, Output } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { LeaveService } from 'src/app/_services/leave.service';

@Component({
  selector: 'app-view-short-leave',
  templateUrl: './view-short-leave.component.html',
  styleUrl: './view-short-leave.component.css'
})
export class ViewShortLeaveComponent {

  @Output() close: any = new EventEmitter();

  constructor(public leaveService: LeaveService,
    public dialogRef: MatDialogRef<ViewShortLeaveComponent>) {

  }

  ngOnInit() {
    this.leaveService.leave.getValue();
  }

  closeModal() {
    this.dialogRef.close();
  }
 
}
