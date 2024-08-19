import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, FormsModule, Validators } from '@angular/forms';

import { SharedModule } from 'src/app/shared/shared.Module';
import { InterviewProcessService } from 'src/app/_services/interviewProcess.service';
import { ToastrService } from 'ngx-toastr';
import { candidateDataFieldValue } from 'src/app/models/interviewProcess/candidateDataFieldValue';
import { candidate, candidateFeedback, feedbackField } from 'src/app/models/interviewProcess/candidate';


@Component({
  selector: 'app-candidate-feedback',
  standalone: true,
  imports: [CommonModule,FormsModule,SharedModule],
  templateUrl: './candidate-feedback.component.html',
  styleUrl: './candidate-feedback.component.css'
})
export class CandidateFeedbackComponent implements OnInit {
  candidateList: candidateFeedback[] = [];
  candidates: candidateFeedback[] = [];
  filteredCandidates: candidateFeedback[] = [];
  searchText: string = '';
  isEditing: boolean = false;
  selectedCandidate: candidateFeedback;
  candidateForm: FormGroup;
  gridColumns:feedbackField[];
  page = 1;
  selectedCustomAttributes: feedbackField[] = [];

  constructor(
    private fb: FormBuilder,
    private interviewProcessService: InterviewProcessService,
    private toast: ToastrService
  ) {
    this.candidateForm = this.fb.group({
      _id:['', Validators.required],
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['',Validators.required],
      customAttributes: this.fb.array([]),
    });
  }

  ngOnInit(): void {
    this.initCandidateForm();
    this.getAllCandidatesWithData();
    this.getAllCandidates();
    this.candidateForm.statusChanges.subscribe((f)=>{
    });
  }
  getAllCandidatesWithData() {
    this.interviewProcessService.feedbackFieldsWithData().subscribe((response: any) => {
      this.candidates = response && response.data;
      this.filteredCandidates = response && response.data;
      if (this.candidates.length > 0) {
        this.gridColumns = this.candidates[0].feedbackFields;
        this.selectedCustomAttributes = this.candidates[0].feedbackFields;
        this.populateCustomFieldsForNewCandidate();
      }
    });
  }

  addCustomAttribute(): void {
    const customAttribute = this.fb.group({
      attributeName: ['', Validators.required],
      description: [''],
      dataType: [''],
      isRequired: [false],
      value: [''],
    });
    (this.candidateForm.get('customAttributes') as FormArray).push(customAttribute);
  }

  editCandidate(candidate: candidateFeedback) {
    this.isEditing = true;
    this.selectedCandidate = candidate;
    this.candidateForm.patchValue({
      name: candidate.name,
      email: candidate.email,
      phoneNumber: candidate.phoneNumber,
      // Additional logic to set customAttributes values
    });
  }

  addCandidate() {
    if (this.candidateForm.valid) {
      const excludedKeys = ['candidateDataFields'];
      const newCandidate = Object.assign({}, this.candidateForm.value, ...Object.entries(this.candidateForm.value).filter(([key]) => !excludedKeys.includes(key)));
      this.interviewProcessService.addCandidate(newCandidate).subscribe(
        (response) => {
          this.candidateForm.value.customAttributes.forEach(dataField => {
            dataField.candidate = response.data._id;
            this.interviewProcessService.addDataFieldValue(dataField).subscribe(
              (response) => {
              },
              (error) => {
                this.toast.error('Error adding candidate', 'Error!');
              }
            );
          });
          this.toast.success('Candidate added successfully!');
                this.isEditing = false;
                this.resetCandidateForm();
                this.getAllCandidates();
        },
        (error) => {
          this.toast.error('Error adding candidate', 'Error!');
        }
      );
    }
  }

  updateCandidate() {
    if (this.candidateForm.valid) {
      this.candidateForm.value.customAttributes.forEach(feedbackField => {
        feedbackField.candidate=this.candidateForm.value._id;
        this.interviewProcessService.updateFeedbackFieldValue(feedbackField).subscribe(
          (response) => {
          },
          (error) => {
            this.toast.error('Error adding candidate', 'Error!');
          }
        );
      });
      this.toast.success('Candidate feedback fields updated successfully!');
            this.isEditing = false;
            this.resetCandidateForm();
            this.getAllCandidatesWithData();
    }
  }

  resetCandidateForm() {
    this.candidateForm.reset();
    this.candidateForm.setControl('customAttributes', this.fb.array([]));
  }

  initCandidateForm() {
    this.candidateForm = this.fb.group({
      _id:[''],
      name: [''],
      email: [''],
      phoneNumber: [''],
      customAttributes: new FormArray([]),
    });
  }
  initCustomAttributes() {
    return this.fb.group({
      attributeName: ['', Validators.required],
      description: [''],
      dataType: [''],
      isRequired: [false],
      value: [''],
    });
  }
  validateDate(control: AbstractControl) {
    const enteredDate = new Date(control.value);
    if (isNaN(enteredDate.getTime())) {
      control.setErrors({ invalidDate: true });
    } else {
      control.setErrors(null);
    }
  }

  initDataFieldForm() {
    this.candidateForm = this.fb.group({
      fieldName: ['', Validators.required],
      fieldType: ['', Validators.required],
      subType: [''],
      isRequired: [false], // Set the default value to false for the checkbox
    });
  }

  validateOption(dataType:string, fieldValue:string ): boolean {
    if (dataType?.toLowerCase() === 'string' || dataType?.toLowerCase() === 'number') {
      // Implement your validation logic here
      // Example: Return false if the value is empty
      return fieldValue !== '';
    } else if (dataType?.toLowerCase() === 'boolean') {
      // No specific validation needed for boolean options
      return true;
    } else if (dataType?.toLowerCase() === 'date') {
      // Implement your validation logic for date
      // Example: Return false if the date is not valid
      return this.isValidDate(fieldValue);
    }
    // ... Implement similar logic for other data types ...
    return true;
  }

  isValidDate(date: any): boolean {
    if (typeof date === 'string') {
      const parsedDate = new Date(date);
      return !isNaN(parsedDate.getTime());
    } else if (date instanceof Date) {
      return !isNaN(date.getTime());
    }
    return false;
  }

  populateCustomFieldsForNewCandidate() {
    (<FormArray>this.candidateForm.get('customAttributes')).clear();
    this.selectedCustomAttributes.forEach((attribute) => {
      const attributeFormGroup = new FormGroup({
        _id:new FormControl(attribute._id),
        //candidate: new FormControl(attribute.candidate),
        feedbackField : new FormControl(attribute._id),
        fieldName : new FormControl(attribute.fieldName),
        fieldType : new FormControl(attribute.fieldType),
        fieldValue : new FormControl(attribute.fieldValue),
        isRequired : new FormControl(attribute.isRequired),
      });
      (<FormArray>this.candidateForm.get('customAttributes')).push(attributeFormGroup);
    });
}

  editField(candidate: any) {
    this.isEditing = true;
    this.selectedCandidate = candidate;
    this.selectedCustomAttributes = candidate.feedbackFields;
    this.candidateForm.patchValue(candidate);

    if (candidate.feedbackFields && candidate.feedbackFields.length > 0) {
      (<FormArray>this.candidateForm.get('customAttributes')).clear();
      candidate.feedbackFields.forEach((attribute) => {
        const attributeFormGroup = new FormGroup({
          _id:new FormControl(attribute._id),
          candidate: new FormControl(attribute.candidate),
          feedbackField : new FormControl(attribute._id),
          fieldName : new FormControl(attribute.fieldName),
          fieldType : new FormControl(attribute.fieldType),
          fieldValue : new FormControl(attribute.fieldValue),
          isRequired : new FormControl(attribute.isRequired),
        });
        (<FormArray>this.candidateForm.get('customAttributes')).push(attributeFormGroup);
      });
    }
  }
  deleteDataField(candidate: any) {
    try {
      const result = this.confirmAction();
      if (result) {
        candidate.feedbackFields.forEach(df=>{
          this.interviewProcessService.deleteFeedbackFieldValue(df.feedbackFieldValue._id).subscribe((response: any) => {
          });
        })
        this.toast.success('Candidate feedback has been deleted successfully!');
          this.getAllCandidatesWithData();
      }
    } catch (err) {
      this.toast.error('Error deleting tag', 'Error!');
    }
  }
  confirmAction(): boolean {
    return window.confirm('Are you sure you want to perform this action?');
  }
  getAllCandidates(){
    this.interviewProcessService.getAllCandidatesWithData().subscribe((response: any) => {
      this.candidateList = response && response.data;
    });
  }
  refreshCandidates(){
    this.getAllCandidatesWithData();
  }
}

