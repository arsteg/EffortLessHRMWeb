import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-reject-dialog',
  template: `
    <h2 mat-dialog-title>Reject Expense Report</h2>
    <mat-dialog-content>
      <form [formGroup]="form">
        <mat-form-field  class="w-100">
          <mat-label>Reason</mat-label>
          <textarea matInput formControlName="reason"></textarea>
        </mat-form-field>
      </form>
      <mat-dialog-actions class="d-flex justify-content-between px-0">
        <button mat-raised-button (click)="onCancel()">Cancel</button>
        <button mat-raised-button (click)="onReject()" color="warn">Reject</button>
      </mat-dialog-actions>
    </mat-dialog-content>
  `,
})
export class RejectDialogComponent {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<RejectDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.form = this.fb.group({
      reason: ['']
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onReject(): void {
    this.dialogRef.close({'rejected': true, 'reason': this.form.value.reason});
  }
}
