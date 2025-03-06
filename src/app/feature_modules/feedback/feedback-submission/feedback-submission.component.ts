import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FeedbackService } from 'src/app/_services/feedback.service';
import { AuthenticationService } from 'src/app/_services/authentication.service';
import { FeedbackField } from 'src/app/models/feedback/feedback-field.model';
import  {ReactiveFormsModule} from '@angular/forms';

@Component({
  selector: 'app-feedback-submission',
  templateUrl: './feedback-submission.component.html',
  standalone: true,
  imports: [ReactiveFormsModule],
  styleUrls: ['./feedback-submission.component.css']
})
export class FeedbackSubmissionComponent implements OnInit {
  feedbackForm: FormGroup;
  fields: FeedbackField[] = [];
  companyId: string;

  constructor(
    private fb: FormBuilder,
    private feedbackService: FeedbackService,
    private authService: AuthenticationService    
  ) {
    this.companyId = '';
    this.feedbackForm = this.fb.group({
      storeId: ['', Validators.required],
      tableId: [''],
      email: ['', [Validators.email]],
      phoneNumber: ['', [Validators.pattern(/^\+?[1-9]\d{1,14}$/)]],
      feedbackValues: this.fb.group({})
    });
  }

  ngOnInit(): void {
    this.loadFields();
  }

  loadFields(): void {
    // this.feedbackService.getFeedbackFieldsByCompany(this.companyId).subscribe({
    //   next: (fields) => {
    //     this.fields = fields;
    //     const feedbackValues = this.feedbackForm.get('feedbackValues') as FormGroup;
    //     fields.forEach(field => {
    //       feedbackValues.addControl(
    //         field._id!,
    //         this.fb.control('', field.isRequired ? Validators.required : null)
    //       );
    //     });
    //   },
    //   //error: (err) => this.snackBar.open('Failed to load feedback fields', 'Close', { duration: 3000 })
    // });
  }

  onSubmit(): void {
    if (this.feedbackForm.invalid) return;

    const feedback = {
      company: this.companyId,
      storeId: this.feedbackForm.get('storeId')?.value,
      tableId: this.feedbackForm.get('tableId')?.value || undefined,
      provider: {
        email: this.feedbackForm.get('email')?.value || undefined,
        phoneNumber: this.feedbackForm.get('phoneNumber')?.value || undefined
      },
      feedbackValues: Object.entries(this.feedbackForm.get('feedbackValues')?.value).map(([field, value]) => ({
        field,
        value
      }))
    };

    this.feedbackService.submitFeedback(feedback).subscribe({
      next: () => {
        this.feedbackForm.reset();
        //this.snackBar.open('Feedback submitted successfully', 'Close', { duration: 3000 });
      },
      error: (err) => 
        alert('Failed to submit feedback')
    });
  }

  getFieldControl(fieldId: string) {
    return (this.feedbackForm.get('feedbackValues') as FormGroup).get(fieldId);
  }
}