import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FeedbackService } from 'src/app/_services/feedback.service';
import { FeedbackField } from 'src/app/models/feedback/feedback-field.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-feedback-field-form',
  standalone: true,
  template: `
    <form [formGroup]="fieldForm" (ngSubmit)="onSubmit()" class="mt-4 p-3 me-4 bg-light border rounded">
      <div class="form-group">
        <label for="name">Name</label>
        <input type="text" id="name" class="form-control" formControlName="name" required>
        <div *ngIf="fieldForm.get('name')?.touched && fieldForm.get('name')?.hasError('required')" class="text-danger">
          Name is required.
        </div>
      </div>
      <div class="form-group">
        <label for="dataType">Data Type</label>
        <select id="dataType" class="form-control" formControlName="dataType" required>
          <option value="" disabled>Select a data type</option>
          <option *ngFor="let type of dataTypes" [value]="type">{{ type }}</option>
        </select>
        <div *ngIf="fieldForm.get('dataType')?.touched && fieldForm.get('dataType')?.hasError('required')" class="text-danger">
          Data Type is required.
        </div>
      </div>
      <div class="form-group">
        <label for="description">Description</label>
        <input type="text" id="description" class="form-control" formControlName="description" required>
        <div *ngIf="fieldForm.get('description')?.touched && fieldForm.get('description')?.hasError('required')" class="text-danger">
          Description is required.
        </div>
      </div>
      <div class="form-group form-check">
        <input type="checkbox" id="isRequired" class="form-check-input" formControlName="isRequired">
        <label for="isRequired" class="form-check-label">Is Required</label>
      </div>
      <div class="form-group d-flex justify-content-between mt-2">
        <button type="submit" mat-raised-button color="primary" [disabled]="fieldForm.invalid">
          {{ isEdit ? 'Update' : 'Add' }}
        </button>
        <button *ngIf="isEdit" type="button" mat-raised-button (click)="onCancel()">Cancel</button>
      </div>
    </form>
  `,
  imports: [CommonModule, ReactiveFormsModule],
  styles: []
})
export class FeedbackFieldFormComponent {
  @Input() field: FeedbackField | null = null;
  @Input() isEdit: boolean = false;
  @Output() fieldCreated = new EventEmitter<void>();
  @Output() fieldUpdated = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  fieldForm: FormGroup;
  dataTypes: string[] = ['string', 'number', 'rating', 'boolean', 'date']; // Ensure these match your FeedbackField model

  constructor(
    private fb: FormBuilder,
    private feedbackService: FeedbackService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {
    this.fieldForm = this.fb.group({
      name: ['', Validators.required],
      dataType: ['', Validators.required],
      description: ['', Validators.required],
      isRequired: [false]
    });
  }

  ngOnChanges(): void {
    console.log('isEdit:', this.isEdit, 'field:', this.field); // Debug log to inspect incoming field
    if (this.field) {
      // Log the exact dataType value to compare with dataTypes array
      console.log('Patching form with dataType:', this.field.dataType);
      this.fieldForm.patchValue({
        name: this.field.name,
        dataType: this.field.dataType,
        description: this.field.description,
        isRequired: this.field.isRequired
      });
      // Explicitly set the dataType control value to ensure it matches an option
      this.fieldForm.get('dataType')?.setValue(this.field.dataType);      
      this.cdr.detectChanges(); // Force update
      // Verify the form value after patching
      console.log('Form value after patch:', this.fieldForm.value);
    } else {
      this.fieldForm.reset({
        name: '',
        dataType: '',
        description: '',
        isRequired: false
      });
    }
  }

  onSubmit(): void {
    if (this.fieldForm.valid) {
      if (this.isEdit && this.field?._id) {
        this.feedbackService.updateFeedbackField(this.field._id, this.fieldForm.value).subscribe({
          next: () => this.fieldUpdated.emit(),
          error: (err) => this.snackBar.open('Failed to update field', 'Close', { duration: 3000 })
        });
      } else {
        this.feedbackService.createFeedbackField(this.fieldForm.value).subscribe({
          next: () => {
            this.fieldCreated.emit();
            this.fieldForm.reset({
              name: '',
              dataType: '',
              description: '',
              isRequired: false
            });
          },
          error: (err) => this.snackBar.open('Failed to create field', 'Close', { duration: 3000 })
        });
      }
    }
  }

  onCancel(): void {
    this.fieldForm.reset({
      name: '',
      dataType: '',
      description: '',
      isRequired: false
    });
    this.cancel.emit();
  }
}