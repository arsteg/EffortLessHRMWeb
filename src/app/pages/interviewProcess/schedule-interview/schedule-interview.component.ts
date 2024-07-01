import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, FormsModule, Validators } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { SharedModule } from 'src/app/shared/shared.Module';
import { InterviewProcessService } from 'src/app/_services/interviewProcess.service';
import { ToastrService } from 'ngx-toastr';
import { candidateDataFieldValue } from 'src/app/models/interviewProcess/candidateDataFieldValue';
import { candidate } from 'src/app/models/interviewProcess/candidate';
import { InterviewDetail } from 'src/app/models/interviewProcess/candidateInterviewDetail';
import { interviewer } from 'src/app/models/interviewProcess/interviewer';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import {EditInterviewerDialogComponent} from 'src/app/pages/interviewProcess/schedule-interview/editInterviewerDialog/editInterviewerDialogComponent'
import { CommonService } from 'src/app/_services/common.Service';


@Component({
  selector: 'app-schedule-interview',
  standalone: true,
  imports: [CommonModule,FormsModule,NgxPaginationModule,SharedModule, EditInterviewerDialogComponent],
  templateUrl: './schedule-interview.component.html',
  styleUrl: './schedule-interview.component.css'
})
export class ScheduleInterviewComponent implements OnInit {
  candidates:candidate[]=[];
  candidateList :candidate[]=[];
  interviews: InterviewDetail[] = [];
  interviewers:interviewer[]=[];
  filteredInterviews: InterviewDetail[] = [];
  searchText: string = '';
  isEditing: boolean = false;
  selectedInterviewDetail: InterviewDetail;
  scheduleInterviewForm: FormGroup;
  gridColumns:candidateDataFieldValue[];
  page = 1;
  selectedCustomAttributes: candidateDataFieldValue[] = [];
  commonService: any;
  timeZones:['Asia/Kolkata','America/Los_Angeles'];

  constructor(
    private fb: FormBuilder,
    private interviewProcessService: InterviewProcessService,
    private toast: ToastrService,
    private dialog: MatDialog,
    commonService: CommonService
  ) {
    this.scheduleInterviewForm = this.fb.group({
      _id:['', Validators.required],
      candidate: ['', Validators.required],
      topic: ['', Validators.required],
      type: ['', Validators.required],
      startTime: ['', Validators.required],
      duration: ['', Validators.required],
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['',Validators.required],
      timeZone: ['',Validators.required],
      password: ['',Validators.required],
      customAttributes: this.fb.array([]),
    });
  }

  ngOnInit(): void {
    this.initCandidateForm();
    this.getAllCandidateInterviews();
    this.getAllCandidatesWithData();
    this.getAllCandidates();
    this.getAllInterviewers();
    this.scheduleInterviewForm.statusChanges.subscribe((f)=>{
    });
  }

  getAllCandidateInterviews() {
    this.interviewProcessService.getAllInterviewDetails().subscribe((response: any) => {
      this.interviews = response && response.data;
      this.filteredInterviews = response && response.data;
    });
  }

  getAllCandidatesWithData(){
    this.interviewProcessService.getAllCandidatesWithData().subscribe((response: any) => {
      this.candidates = response && response.data;
    });
  }
  getAllInterviewers(){
    this.interviewProcessService.getAllInterviewers().subscribe((response: any) => {
      this.interviewers = response && response.data;
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
    (this.scheduleInterviewForm.get('customAttributes') as FormArray).push(customAttribute);
  }

  editCandidate(interviewDetail: InterviewDetail) {
    this.isEditing = true;
    this.selectedInterviewDetail = interviewDetail;
    this.scheduleInterviewForm.patchValue({
      //name: candidate.name,
      //email: candidate.email,
      //phoneNumber: candidate.phoneNumber,
      // Additional logic to set customAttributes values
    });
  }

  addCandidate() {
    if (this.scheduleInterviewForm.valid) {
      const excludedKeys = ['candidateDataFields'];
      const newCandidate = Object.assign({}, this.scheduleInterviewForm.value, ...Object.entries(this.scheduleInterviewForm.value).filter(([key]) => !excludedKeys.includes(key)));
      this.interviewProcessService.addCandidate(newCandidate).subscribe(
        (response) => {
          this.scheduleInterviewForm.value.customAttributes.forEach(dataField => {
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
                this.getAllCandidateInterviews();
        },
        (error) => {
          this.toast.error('Error adding candidate', 'Error!');
        }
      );
    }
  }

  updateCandidate() {
    if (this.scheduleInterviewForm.valid) {
      const excludedKeys = ['candidateDataFields'];
      const newCandidate = Object.assign({}, this.scheduleInterviewForm.value, ...Object.entries(this.scheduleInterviewForm.value).filter(([key]) => !excludedKeys.includes(key)));
      this.interviewProcessService.updateCandidate(newCandidate).subscribe(
        (response) => {
          this.scheduleInterviewForm.value.customAttributes.forEach(dataField => {
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
                this.getAllCandidateInterviews();
        },
        (error) => {
          this.toast.error('Error adding candidate', 'Error!');
        }
      );
    }
  }

  resetCandidateForm() {
    this.scheduleInterviewForm.reset();
    this.scheduleInterviewForm.setControl('customAttributes', this.fb.array([]));
  }

  initCandidateForm() {
    this.scheduleInterviewForm = this.fb.group({
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
    this.scheduleInterviewForm = this.fb.group({
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
    (<FormArray>this.scheduleInterviewForm.get('customAttributes')).clear();
    this.selectedCustomAttributes.forEach((attribute) => {
      const attributeFormGroup = new FormGroup({
        _id:new FormControl(this.selectedInterviewDetail.candidate._id),
        candidate: new FormControl(attribute.candidate),
        candidateDataField : new FormControl(attribute._id),
        topic : new FormControl(""),
        fieldName : new FormControl(attribute.fieldName),
        fieldType : new FormControl(attribute.fieldType),
        fieldValue : new FormControl(attribute.fieldValue),
        isRequired : new FormControl(attribute.isRequired),
      });
      (<FormArray>this.scheduleInterviewForm.get('customAttributes')).push(attributeFormGroup);
    });
}

  editField(candidate: any) {
    this.isEditing = true;
    this.selectedInterviewDetail = candidate;
    this.selectedCustomAttributes = candidate.candidateDataFields;
    this.scheduleInterviewForm.patchValue(candidate);

    if (candidate.candidateDataFields && candidate.candidateDataFields.length > 0) {
      (<FormArray>this.scheduleInterviewForm.get('customAttributes')).clear();
      candidate.candidateDataFields.forEach((attribute) => {
        const attributeFormGroup = new FormGroup({
          _id:new FormControl(this.selectedInterviewDetail.candidate._id),
          candidate: new FormControl(attribute.candidate),
          candidateDataField : new FormControl(attribute._id),
          fieldName : new FormControl(attribute.fieldName),
          fieldType : new FormControl(attribute.fieldType),
          fieldValue : new FormControl(attribute.fieldValue),
          isRequired : new FormControl(attribute.isRequired),
        });
        (<FormArray>this.scheduleInterviewForm.get('customAttributes')).push(attributeFormGroup);
      });
    }
  }


  async addDataField() {
    try {
      await this.interviewProcessService.addCandidateDataField(this.scheduleInterviewForm.value).toPromise();
      this.toast.success('Candidate data field added successfully!');
      this.getAllCandidateInterviews();
      this.initDataFieldForm(); // Reset the form after adding a field
    } catch (err) {
      this.toast.error('Error adding data field', 'Error!');
    }
  }

  async updateDataField() {
    try {
      const updatedCandidate = this.interviews.find(field => field._id === this.selectedInterviewDetail._id);
      await this.interviewProcessService.updateInterviewDetail(updatedCandidate).toPromise();
      this.toast.success('Candidate data field updated successfully!');
      this.getAllCandidateInterviews();
      this.isEditing = false;
      this.initDataFieldForm(); // Reset the form after updating a field
    } catch (err) {
      this.toast.error('Error updating field', 'Error!');
    }
  }

  deleteDataField(candidate: any) {
    try {
      const result = this.confirmAction();
      if (result) {

        this.interviewProcessService.deleteCandidate(candidate._id).subscribe((response: any) => {

          candidate.candidateDataFields.forEach(df=>{
            this.interviewProcessService.deleteDataFieldValue(df.dataFieldValue._id).subscribe((response: any) => {
            });
          })
          this.toast.success('Candidate has been deleted successfully!');
            this.getAllCandidateInterviews();
        });
      }
    } catch (err) {
      this.toast.error('Error deleting tag', 'Error!');
    }
  }
  removeInterviewer(interviewer:interviewer){
  }
  openAddInterviewerPopup(){
    const dialogRef = this.dialog.open(EditInterviewerDialogComponent, {
      width: '400px', // You can customize the width
      height:'500px',
      // Other MatDialog options if needed
    });

    dialogRef.afterClosed().subscribe(result => {
      // Handle the result if needed (result is what the dialog component might pass when closed)
      this.getAllInterviewers();
    });
  }

  createMeeting(): void {
    const meetingData = this.scheduleInterviewForm.value;

    this.commonService.createMeeting(meetingData).subscribe(
      (response: any) => {
        // Handle the successful response from the API
        console.log('Meeting created successfully:', response);
        //this.meetingCreated = true;
        // Store MeetingId and Password if needed
        //this.password = response.password;

        // Store the meeting number
        //this.meetingNumber = response.meetingId;
      },
      (error: any) => {
        // Handle the error from the API
        console.error('Error creating meeting:', error);
      }
    );
}

  confirmAction(): boolean {
    return window.confirm('Are you sure you want to perform this action?');
  }
  getAllCandidates(){
    this.interviewProcessService.getAllCandidates().subscribe((response: any) => {
      this.candidateList = response && response.data;
    });
  }
}

