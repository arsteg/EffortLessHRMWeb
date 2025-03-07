// src/app/components/feedback-viewer/feedback-viewer.component.ts
import { Component, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { FeedbackService } from 'src/app/_services/feedback.service';
import { Feedback } from 'src/app/models/feedback/feedback.model';

@Component({
  selector: 'app-feedback-viewer',
  standalone: true,
  templateUrl: './feedback-viewer.component.html',
  styleUrls: ['./feedback-viewer.component.css'],
  imports: [ReactiveFormsModule, CommonModule]
})
export class FeedbackViewerComponent implements OnInit {
  displayedColumns: string[] = ['storeId', 'providerEmail', 'submittedAt', 'feedbackValues', 'actions'];
  dataSource: Feedback[] = [];
  pageSize = 10;
  pageIndex = 0;
  totalFeedbacks = 0;

  // Filters
  searchControl = new FormControl('');
  startDateControl = new FormControl('');
  endDateControl = new FormControl('');

  constructor(private feedbackService: FeedbackService) {}

  ngOnInit(): void {
    this.setDefaultDates();
    this.loadFeedbacks();
    this.setupSearch();
    this.setupFilters();
  }
// Method to set default dates
private setDefaultDates(): void {
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  // Format dates as YYYY-MM-DD for input[type="date"]
  const formatDate = (date: Date) => date.toISOString().split('T')[0];
  
  this.startDateControl.setValue(formatDate(firstDayOfMonth));
  this.endDateControl.setValue(formatDate(today));
}

loadFeedbacks(): void {
  let startDate = this.startDateControl.value || '';
  let endDate = this.endDateControl.value || '';
  const skip = this.pageIndex * this.pageSize;
  const limit = this.pageSize;

  // Convert dates to UTC if they exist
  if (startDate) {
    startDate = new Date(startDate).toISOString(); // e.g., "2025-03-01T00:00:00.000Z"
  }
  if (endDate) {
    // Set endDate to the end of the day in UTC
    const endDateObj = new Date(endDate);
    endDateObj.setUTCHours(23, 59, 59, 999); // End of the day
    endDate = endDateObj.toISOString(); // e.g., "2025-03-07T23:59:59.999Z"
  }

  this.feedbackService.getFeedbackByCompany(startDate, endDate).subscribe({
    next: (response) => {
      this.dataSource = response.data.slice(skip, skip + limit);
      this.totalFeedbacks = response.data.length;
    },
    error: (err) => {
      console.error('Error loading feedbacks:', err);
      this.dataSource = [];
    }
  });
}

  setupSearch(): void {
    this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((searchTerm) => {
        this.applyFilter(searchTerm || '');
        this.pageIndex = 0;
        this.loadFeedbacks();
      });
  }

  setupFilters(): void {
    this.startDateControl.valueChanges
      .pipe(debounceTime(300))
      .subscribe(() => {
        this.pageIndex = 0;
        this.loadFeedbacks();
      });

    this.endDateControl.valueChanges
      .pipe(debounceTime(300))
      .subscribe(() => {
        this.pageIndex = 0;
        this.loadFeedbacks();
      });
  }

  applyFilter(searchTerm: string): void {
    // Implement filtering logic here if needed
    // Currently handled by loadFeedbacks via date filters
  }

  onPageChange(event: { pageIndex?: number; pageSize?: number }): void {
    if (event.pageSize !== undefined) {
      this.pageSize = event.pageSize;
      this.pageIndex = 0;
    }
    if (event.pageIndex !== undefined) {
      this.pageIndex = event.pageIndex;
    }
    this.loadFeedbacks();
  }

  clearFilters(): void {
    this.searchControl.setValue('');
    this.startDateControl.setValue('');
    this.endDateControl.setValue('');
    this.pageIndex = 0;
    this.loadFeedbacks();
  }

  getFeedbackValueDisplay(feedback: Feedback): string {
    if (!feedback.feedbackValues || feedback.feedbackValues.length === 0) {
      return 'N/A';
    }
    return feedback.feedbackValues
      .map((fv) => {
        if (fv.field?.dataType === 'rating' && typeof fv.value === 'number') {
          const stars = '★'.repeat(fv.value) + '☆'.repeat(5 - fv.value);
          return `${fv.field?.name}: <span class="text-warning">${stars}</span>`;
        }
        return `${fv.field?.name}: ${fv.value || 'N/A'}`;
      })
      .join('<br>');
    return "";
  }
}