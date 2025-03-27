import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-approve-dialog',
  template: `
    <h2 mat-dialog-title>Approve Expense Report</h2>
    <mat-dialog-content>
      <form [formGroup]="form">
        <mat-form-field class="w-100">
          <mat-label>Reason</mat-label>
          <textarea matInput formControlName="reason"></textarea>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions class="d-flex justify-content-between">
      <button mat-raised-button (click)="onCancel()">Cancel</button>
      <button mat-raised-button (click)="onApprove()" color="accent">Approve</button>
    </mat-dialog-actions>
  `
})
export class ApproveDialogComponent {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<ApproveDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.form = this.fb.group({
      reason: ['']
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onApprove(): void {
    this.dialogRef.close({'approved': true, 'reason': this.form.value.reason});
  }
}
