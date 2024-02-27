import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InterviewProcessService } from 'src/app/_services/interviewProcess.service';
import { ToastrService } from 'ngx-toastr';
import { candidateDataField } from 'src/app/models/interviewProcess/candidateDataField';
import { SharedModule } from 'src/app/shared/shared.Module';

const FIELD_TYPES = ['string', 'number', 'date', 'range', 'boolean', 'list'];

@Component({
  selector: 'app-candidate-data-field',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './candidate-data-field.component.html',
  styleUrls: ['./candidate-data-field.component.css']
})
export class CandidateDataFieldComponent implements OnInit {
  candidateDataFields: candidateDataField[] = [];
  filteredCandidateDataFields: candidateDataField[] = [];
  searchText: string = '';
  isEditing: boolean = false;
  selectedField: candidateDataField;
  dataFieldForm: FormGroup;
  page = 1;

  constructor(
    private fb: FormBuilder,
    private interviewProcessService: InterviewProcessService,
    private toast: ToastrService
  ) {
    this.dataFieldForm = this.fb.group({
      fieldName: ['', Validators.required],
      fieldType: ['', Validators.required],
      subType: [''],
      isRequired: [false],
    });
  }

  ngOnInit(): void {
    this.getCandidateDataFields();
  }

  initDataFieldForm() {
    this.dataFieldForm = this.fb.group({
      fieldName: ['', Validators.required],
      fieldType: ['', Validators.required],
      subType: [''],
      isRequired: [false], // Set the default value to false for the checkbox
    });
  }

  getCandidateDataFields() {
    this.interviewProcessService.getAllCandidateDataFields().subscribe((response: any) => {
      this.candidateDataFields = response && response.data;
      this.filteredCandidateDataFields = response && response.data;
    });
  }

  editField(dataField: candidateDataField) {
    this.isEditing = true;
    this.selectedField = dataField;
    this.dataFieldForm.patchValue({
      fieldName: dataField.fieldName,
      fieldType: dataField.fieldType,
      subType: dataField.subType,
      isRequired: dataField.isRequired
    });
  }

  async addDataField() {
    try {
      await this.interviewProcessService.addCandidateDataField(this.dataFieldForm.value).toPromise();
      this.toast.success('Candidate data field added successfully!');
      this.getCandidateDataFields();
      this.initDataFieldForm(); // Reset the form after adding a field
    } catch (err) {
      this.toast.error('Error adding data field', 'Error!');
    }
  }

  async updateDataField() {
    try {
      const updatedDataField = this.candidateDataFields.find(field => field._id === this.selectedField._id);
      updatedDataField.fieldName = this.dataFieldForm.value.fieldName;
      updatedDataField.fieldType = this.dataFieldForm.value.fieldType;
      updatedDataField.subType = this.dataFieldForm.value.subType;
      updatedDataField.isRequired = this.dataFieldForm.value.isRequired;

      await this.interviewProcessService.updateCandidateDataField(updatedDataField).toPromise();
      this.toast.success('Candidate data field updated successfully!');
      this.getCandidateDataFields();
      this.isEditing = false;
      this.initDataFieldForm(); // Reset the form after updating a field
    } catch (err) {
      this.toast.error('Error updating field', 'Error!');
    }
  }

  deleteDataField(dataField: candidateDataField) {
    try {
      const result = this.confirmAction();
      if (result) {
        this.interviewProcessService.deleteDataField(dataField._id).subscribe((response: any) => {
          this.toast.success('Data field has been deleted successfully!');
          this.getCandidateDataFields();
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
