import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-reject-dialog',
  template: `
    <h2 mat-dialog-title>{{'expenses.reject' | translate}} {{'expenses.expense_report' | translate}}</h2>
    <mat-dialog-content>
      <form [formGroup]="form">
        <mat-form-field  class="w-100">
          <mat-label>{{'reason' | translate}}</mat-label>
          <textarea matInput formControlName="reason"></textarea>
        </mat-form-field>
      </form>
      <mat-dialog-actions class="d-flex justify-content-between px-0">
        <button mat-raised-button (click)="onCancel()">{{'expenses.cancel' | translate}}</button>
        <button mat-raised-button (click)="onReject()" color="warn">{{'expenses.reject' | translate}}</button>
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
