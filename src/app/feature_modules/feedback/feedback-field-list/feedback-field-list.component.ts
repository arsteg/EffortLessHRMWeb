import { Component, OnInit } from '@angular/core';
import { FeedbackService } from 'src/app/_services/feedback.service';
import { FeedbackField } from 'src/app/models/feedback/feedback-field.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { FeedbackFieldFormComponent } from '../feedback-field-form/feedback-field-form.component';
import { ReactiveFormsModule,FormsModule  } from '@angular/forms';
import { debounceTime, Subject } from 'rxjs';


@Component({
  selector: 'app-feedback-field-list',
  templateUrl: './feedback-field-list.component.html',
  styleUrls: ['./feedback-field-list.component.css'],
  standalone: true,
  imports: [CommonModule, FeedbackFieldFormComponent,ReactiveFormsModule,FormsModule]
})
export class FeedbackFieldListComponent implements OnInit {
  fields: FeedbackField[] = [];
  fieldsFiltered: FeedbackField[] = [];
  companyId: string = ''; // Set the company ID here
  searchQuery: string = '';
  selectedField: FeedbackField | null = null;
  private _isEdit = false;
  private searchSubject = new Subject<string>();

  constructor(
    private feedbackService: FeedbackService,
    private snackBar: MatSnackBar
  ) {
    this.searchSubject.pipe(debounceTime(300)).subscribe(query => {
      this.searchQuery = query;
      this.filterFields();
    });
  }
  
  onSearchInput(query: string): void {
    this.searchSubject.next(query);
  }

  ngOnInit(): void {
    this.loadFields();
  }

  // Getter and Setter for isEdit
  get isEdit(): boolean {
    return this._isEdit;
  }

  set isEdit(value: boolean) {
    this._isEdit = value;
    if (!value) {
      this.clearForm();
    }
  }

  loadFields(): void {
    this.feedbackService.getFeedbackFieldsByCompany().subscribe({
      next: (response) => {
        this.fields = response.data;
        this.fieldsFiltered = this.fields; // Initialize filtered list
      },
      error: (err) => this.snackBar.open('Failed to load fields', 'Close', { duration: 3000 })
    });
  }

  onFieldCreated(): void {
    this.loadFields();
    this.snackBar.open('Field created successfully', 'Close', { duration: 3000 });
  }

  onFieldUpdated(): void {
    this.loadFields();
    this.isEdit = false;
    this.snackBar.open('Field updated successfully', 'Close', { duration: 3000 });
  }

  editField(field: FeedbackField): void {
    this.isEdit = true;
    this.selectedField = { ...field }; // Create a copy to avoid direct mutation
  }

  deleteField(id: string | undefined): void {
    if (!id) {
      this.snackBar.open('Invalid field ID', 'Close', { duration: 3000 });
      return;
    }
    if (confirm('Are you sure you want to delete this field?')) {
      this.feedbackService.deleteFeedbackField(id).subscribe({
        next: () => {
          this.fields = this.fields.filter(f => f._id !== id);
          this.fieldsFiltered = this.fieldsFiltered.filter(f => f._id !== id);
          this.snackBar.open('Field deleted successfully', 'Close', { duration: 3000 });
        },
        error: () => this.snackBar.open('Failed to delete field', 'Close', { duration: 3000 })
      });
    }
  }  
  filterFields(): void {
    this.fieldsFiltered = this.fields.filter(field =>
      field.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      field.dataType.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      field.description.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  clearForm(): void {
    this.selectedField = null;
    this.isEdit = false;
  }
  trackById(index: number, field: FeedbackField): string {
    return field._id || index.toString();
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Close', { duration: 3000 });
  }

}