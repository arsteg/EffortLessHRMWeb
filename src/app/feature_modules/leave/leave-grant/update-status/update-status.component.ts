import { Component, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { LeaveService } from 'src/app/_services/leave.service';

@Component({
  selector: 'app-update-status',
  templateUrl: './update-status.component.html',
  styleUrl: './update-status.component.css'
})
export class UpdateStatusComponent {
  @Output() leaveGrantRefreshed: EventEmitter<void> = new EventEmitter<void>();
  updateLeaveReport: FormGroup;
  leaveUpdateStatus: any;

  constructor(public leaveService: LeaveService,
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<UpdateStatusComponent>,
    private translate: TranslateService,
    private toast: ToastrService) {
    this.updateLeaveReport = this.fb.group({
      user: [''],
      status: [''],
      level1Reason: [''],
      level2Reason: [''],
      date: [],
      comment: ['']
    })
  }

  ngOnInit() { }

  updateApprovedReport() {
    this.updateLeaveReport.markAllAsTouched();
    if (this.updateLeaveReport.invalid) {
      this.toast.error(this.translate.instant('leave.formInvalidError'));
      return;
    }

    this.leaveUpdateStatus = this.leaveService.leave.getValue();
    let id = this.leaveService.leave.getValue()._id;
    let payload = {
      user: this.leaveUpdateStatus.employee,
      status: this.leaveUpdateStatus.status,
      level1Reason: this.updateLeaveReport.value.level1Reason,
      level2Reason: this.leaveUpdateStatus.level2Reason,
      date: this.leaveUpdateStatus.date,
      comment: this.leaveUpdateStatus.comment
    }
    this.leaveService.updateLeaveGrant(id, payload).subscribe((res: any) => {
      this.toast.success(this.translate.instant('leave.leaveGrant.leaveCreatedSuccessfully'));
      this.leaveGrantRefreshed.emit();
      this.dialogRef.close();
    },
    (err: any) => this.toast.error(err || this.translate.instant('leave.leaveGrant.leaveCreatedError')) );
    this.leaveGrantRefreshed.emit();
  }

  closeModal() {
    this.dialogRef.close();
  }
}
