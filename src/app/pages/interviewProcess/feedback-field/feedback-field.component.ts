import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InterviewProcessService } from 'src/app/_services/interviewProcess.service';
import { ToastrService } from 'ngx-toastr';
import { candidateDataField } from 'src/app/models/interviewProcess/candidateDataField';
import { SharedModule } from 'src/app/shared/shared.Module';
import { feedbackField } from 'src/app/models/interviewProcess/feedbackField';

const FIELD_TYPES = ['string', 'number', 'date', 'boolean'];

@Component({
  selector: 'app-feedback-field',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './feedback-field.component.html',
  styleUrls: ['./feedback-field.component.css']
})
export class FeedbackFieldComponent implements OnInit {
  feedbackFields: feedbackField[] = [];
  filteredFeedbackFields: feedbackField[] = [];
  searchText: string = '';
  isEditing: boolean = false;
  selectedField: candidateDataField;
  feedbackFieldForm: FormGroup;
  page = 1;

  constructor(
    private fb: FormBuilder,
    private interviewProcessService: InterviewProcessService,
    private toast: ToastrService
  ) {
    this.feedbackFieldForm = this.fb.group({
      fieldName: ['', Validators.required],
      fieldType: ['', Validators.required],
      subType: [''],
      isRequired: [false],
    });
  }

  ngOnInit(): void {
    this.getFeedbackDataFields();
  }

  initFeedbackFieldForm() {
    this.feedbackFieldForm = this.fb.group({
      fieldName: ['', Validators.required],
      fieldType: ['', Validators.required],
      subType: [''],
      isRequired: [false], // Set the default value to false for the checkbox
    });
  }

  getFeedbackDataFields() {
    this.interviewProcessService.getAllFeedbackFields().subscribe((response: any) => {
      this.feedbackFields = response && response.data;
      this.filteredFeedbackFields = response && response.data;
    });
  }

  editField(feedbackField: feedbackField) {
    this.isEditing = true;
    this.selectedField = feedbackField;
    this.feedbackFieldForm.patchValue({
      fieldName: feedbackField.fieldName,
      fieldType: feedbackField.fieldType,
      subType: feedbackField.subType,
      isRequired: feedbackField.isRequired
    });
  }

  async addFeedbackField() {
    try {
      await this.interviewProcessService.addFeedbackField(this.feedbackFieldForm.value).toPromise();
      this.toast.success('Feedback field added successfully!');
      this.getFeedbackDataFields();
      this.initFeedbackFieldForm(); // Reset the form after adding a field
    } catch (err) {
      this.toast.error('Error adding feedback field', 'Error!');
    }
  }

  async updateFeedbackField() {
    try {
      const updatedFeedbackField = this.feedbackFields.find(field => field._id === this.selectedField._id);
      updatedFeedbackField.fieldName = this.feedbackFieldForm.value.fieldName;
      updatedFeedbackField.fieldType = this.feedbackFieldForm.value.fieldType;
      updatedFeedbackField.subType = this.feedbackFieldForm.value.subType;
      updatedFeedbackField.isRequired = this.feedbackFieldForm.value.isRequired;

      await this.interviewProcessService.updateFeedbackField(updatedFeedbackField).toPromise();
      this.toast.success('Feedback field updated successfully!');
      this.getFeedbackDataFields();
      this.isEditing = false;
      this.initFeedbackFieldForm(); // Reset the form after updating a field
    } catch (err) {
      this.toast.error('Error updating field', 'Error!');
    }
  }

  deleteFeedbackField(dataField: candidateDataField) {
    try {
      const result = this.confirmAction();
      if (result) {
        this.interviewProcessService.deleteFeedbackField(dataField._id).subscribe((response: any) => {
          this.toast.success('Feedback field has been deleted successfully!');
          this.getFeedbackDataFields();
        });
      }
    } catch (err) {
      this.toast.error('Error deleting tag', 'Error!');
    }
  }
  confirmAction(): boolean {
    return window.confirm('Are you sure you want to perform this action?');
  }
}
