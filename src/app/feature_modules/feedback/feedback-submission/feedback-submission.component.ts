import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FeedbackService } from 'src/app/_services/feedback.service';
import { AuthenticationService } from 'src/app/_services/authentication.service';
import { FeedbackField } from 'src/app/models/feedback/feedback-field.model';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-feedback-submission',
  templateUrl: './feedback-submission.component.html',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  styleUrls: ['./feedback-submission.component.css']
})
export class FeedbackSubmissionComponent implements OnInit {
  feedbackForm: FormGroup;
  fields: FeedbackField[] = [];
  companyId: string;
  private previewRatings: { [fieldId: string]: number | null } = {};

  constructor(
    private fb: FormBuilder,
    private feedbackService: FeedbackService,
    private authService: AuthenticationService,
    private snackBar: MatSnackBar
  ) {
    this.companyId = '';
    this.feedbackForm = this.fb.group({      
      storeId: [''],
      tableId: [''],
      email: ['', [Validators.email]],
      phoneNumber: ['', [Validators.pattern(/^\+?[1-9]\d{1,14}$/)]],
      name: [''],
      feedbackValues: this.fb.group({})
    });
  }

  ngOnInit(): void {
    this.loadFields();
  }

  loadFields(): void {
    this.feedbackService.getFeedbackFieldsByCompany().subscribe({
      next: (response) => {
        this.fields = response.data;
        const feedbackValues = this.feedbackForm.get('feedbackValues') as FormGroup;
        this.fields.forEach(field => {
          feedbackValues.addControl(
            field._id!,
            this.fb.control(field.dataType.toLowerCase() === 'rating' ? '' : field.dataType.toLowerCase() === 'boolean' ? false : '', 
            field.isRequired ? Validators.required : null)
          );
        });
      },
      error: (err) => {
        console.error('Failed to load feedback fields:', err);        
        this.snackBar.open('Failed to load feedback fields', 'Close', { duration: 3000 });
      }
    });
  }

  onSubmit(): void {
    if (this.feedbackForm.invalid) {
      this.feedbackForm.markAllAsTouched();
      return;
    }

    const feedback = {
      company: this.companyId,
      storeId: this.feedbackForm.get('storeId')?.value,
      tableId: this.feedbackForm.get('tableId')?.value || undefined,      
      provider: {
        email: this.feedbackForm.get('email')?.value || undefined,
        phoneNumber: this.feedbackForm.get('phoneNumber')?.value || undefined,
        name: this.feedbackForm.get('name')?.value || undefined
      },
      feedbackValues: Object.entries(this.feedbackForm.get('feedbackValues')?.value).map(([field, value]) => ({
        field,
        value
      }))
    };

    this.feedbackService.submitFeedback(feedback).subscribe({
      next: () => {
        this.feedbackForm.reset({          
          storeId: '',
          tableId: '',
          email: '',
          name: '',
          phoneNumber: '',
          feedbackValues: {}
        });        
        this.snackBar.open('Feedback submitted successfully', 'Close', { duration: 3000 });
      },
      error: (err) => {
        console.error('Failed to submit feedback:', err);        
        this.snackBar.open('Failed to submit feedback', 'Close', { duration: 3000 });
      }
    });
  }

  getFieldControl(fieldId: string) {
    return (this.feedbackForm.get('feedbackValues') as FormGroup).get(fieldId);
  }

  setRating(fieldId: string, rating: number): void {
    const control = this.getFieldControl(fieldId);
    if (control) {
      control.setValue(rating); // 1 for leftmost, 5 for rightmost
      control.markAsTouched();
      this.previewRatings[fieldId] = null; // Clear preview
    }
  }

  previewRating(fieldId: string, rating: number): void {
    this.previewRatings[fieldId] = rating;
  }

  resetPreview(fieldId: string): void {
    this.previewRatings[fieldId] = null;
  }

  getDisplayedRating(fieldId: string): number | null {
    const controlValue = this.getFieldControl(fieldId)?.value;
    return this.previewRatings[fieldId] !== null ? this.previewRatings[fieldId] : (controlValue || null);
  }
}