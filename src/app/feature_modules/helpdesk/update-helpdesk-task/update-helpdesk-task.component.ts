import { Component, Inject } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-update-helpdesk-task',
  // standalone: true,
  // imports: [],
  templateUrl: './update-helpdesk-task.component.html',
  styleUrl: './update-helpdesk-task.component.css'
})
export class UpdateHelpdeskTaskComponent {
  status: string;
  remark: string;

  constructor(
    public dialogRef: MatDialogRef<UpdateHelpdeskTaskComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    if (data && data.helpdesk) {
      this.status = data.helpdesk.status || '';
      this.remark = data.helpdesk.remarks || '';
    }
  }

  // onSubmit() {
  //   if (!this.status || !this.remark) return;
  //   this.dialogRef.close({ status: this.status, remark: this.remark });
  // }
  onSubmit(form: NgForm) {
    if (form.invalid) {
      form.control.markAllAsTouched();
      return;
    }

    this.dialogRef.close({ status: this.status, remark: this.remark });
  }

  onCancel() {
    this.dialogRef.close();
  }
}
