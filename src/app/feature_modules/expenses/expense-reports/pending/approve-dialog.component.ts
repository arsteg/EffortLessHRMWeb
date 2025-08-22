import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CustomValidators } from 'src/app/_helpers/custom-validators';

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
          <mat-error>
            @if(form.get('reason').touched || form.get('reason').invalid){
              {{'expenses.reason' | translate}}
          
                @if(form.get('reason').hasError('maxlength')){
                    {{'expenses.category_label_Limit' | translate}}
                  }
                @if(form.get('reason')?.errors?.['spacesNotAllowed']){
                    {{ 'expenses.labelNoLeadingOrTrailingSpaces' | translate }}
                }
                @if(form.get('reason')?.errors?.['invalidLabel']){
                    {{ 'expenses.label_invalid' | translate }}
                 }
                }
          </mat-error>
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
      reason: ['', [Validators.required, Validators.maxLength(30), CustomValidators.labelValidator, CustomValidators.noLeadingOrTrailingSpaces.bind(this)]]
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onApprove(): void {
    if (this.form.valid) {
      this.dialogRef.close({ 'approved': true, 'reason': this.form.value.reason });
    }
  }
}
