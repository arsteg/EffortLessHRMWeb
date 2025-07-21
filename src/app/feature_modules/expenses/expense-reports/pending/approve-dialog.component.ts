import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-approve-dialog',
  template: `
    <div class="d-flex align-items-center justify-content-between">
      <h1 mat-dialog-title>{{'expenses.approve' | translate}} {{'expenses.expense_report' | translate}}</h1>
      <button mat-icon-button mat-dialog-close="" class="me-4">
        <mat-icon>close</mat-icon>
      </button>
  </div>
      <form [formGroup]="form">
        <mat-dialog-content>
        <mat-form-field class="w-100">
          <mat-label>{{'reason' | translate}}</mat-label>
          <textarea matInput formControlName="reason"></textarea>
        </mat-form-field>
        </mat-dialog-content>
      </form>
      <mat-dialog-actions class="d-flex align-items-center justify-content-between">
        <button mat-flat-button (click)="onCancel()">{{'expenses.cancel' | translate}}</button>
        <button mat-flat-button (click)="onApprove()" color="primary">{{'expenses.approve' | translate}}</button>
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
    this.dialogRef.close({ 'approved': true, 'reason': this.form.value.reason });
  }
}
