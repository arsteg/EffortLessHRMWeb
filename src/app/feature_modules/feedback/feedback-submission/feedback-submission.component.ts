import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FeedbackService } from 'src/app/_services/feedback.service';
import { AuthenticationService } from 'src/app/_services/authentication.service';
import { FeedbackField } from 'src/app/models/feedback/feedback-field.model';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { CookieService } from 'src/app/_services/cookie.service';
import {FieldType} from 'src/app/models/feedback/feedback.model';


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
  storeId: string | null = null;
  tableId: string | null = null;
  FieldType = FieldType;
  

  private previewRatings: { [fieldId: string]: number | null } = {};

  constructor(
    private fb: FormBuilder,
    private feedbackService: FeedbackService,
    private authService: AuthenticationService,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute, private cookieService: CookieService
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
    
    // Read query parameters when component initializes
    this.route.queryParams.subscribe(params => {
      this.storeId = params['storeId'];
      this.tableId = params['tableId'];
      this.companyId = params['companyId'];
      
      // Now you can use these values
      console.log('Store ID:', this.storeId);    // "001"
      console.log('Table ID:', this.tableId);    // "003"
      console.log('Company ID:', this.companyId); // "64e2fa0fdcba5e7546d029f5"
    });
  }

  loadFields(): void {
    const companyId = this.cookieService.getCookie('companyId') || 'none';
    this.feedbackService.getFeedbackFieldsByCompany(companyId).subscribe({
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
      storeId: this.storeId,
      tableId: this.tableId,      
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
 
  onTextareaChange(fieldId: string, event: Event): void {
    const value = (event.target as HTMLTextAreaElement).value; // Get the value from the textarea
    this.setTextareaValue(fieldId, value); // Call the setTextareaValue method
  }
  setTextareaValue(fieldId: string, value: string): void {
    const control = this.getFieldControl(fieldId);
    if (control) {
      control.setValue(value); // Set the value of the textarea
      control.markAsTouched(); // Mark the control as touched
    }
  }
  onCheckboxChange(fieldId: string, event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked; // Get the checkbox value
    this.setCheckboxValue(fieldId, isChecked); // Update the form control
  }
  setCheckboxValue(fieldId: string, value: boolean): void {
    const control = this.getFieldControl(fieldId);
    if (control) {
      control.setValue(value); // Set the value of the checkbox
      control.markAsTouched(); // Mark the control as touched
    }
  }
  showValidationError(fieldId: string): boolean {
    const control = this.getFieldControl(fieldId);
    return control?.touched && control?.hasError('required');
  }
  trackByFieldId(index: number, field: FeedbackField): string {
    return field._id!;
  }
}