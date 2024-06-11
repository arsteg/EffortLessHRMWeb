import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.css']
})
export class PaginationComponent {
  @Input() recordsPerPageOptions: number[] = [5, 10, 25, 50, 100];
  @Input() totalRecords: number = 0;
  @Input() recordsPerPage: number = 10;
  @Input() currentPage: number = 1;
  @Output() pageChange: EventEmitter<number> = new EventEmitter();
  @Output() recordsPerPageChange: EventEmitter<number> = new EventEmitter();

  get skip(): string {
    return ((this.currentPage - 1) * this.recordsPerPage).toString();
  }

  nextPagination() {
    if (!this.isNextButtonDisabled()) {
      this.currentPage++;
      this.pageChange.emit(this.currentPage);
    }
  }

  previousPagination() {
    if (!this.isPreviousButtonDisabled()) {
      this.currentPage--;
      this.pageChange.emit(this.currentPage);
    }
  }

  firstPagePagination() {
    if (this.currentPage !== 1) {
      this.currentPage = 1;
      this.pageChange.emit(this.currentPage);
    }
  }

  lastPagePagination() {
    const totalPages = this.getTotalPages();
    if (this.currentPage !== totalPages) {
      this.currentPage = totalPages;
      this.pageChange.emit(this.currentPage);
    }
  }

  updateRecordsPerPage(recordsPerPage: number) {
    this.currentPage = 1;
    this.recordsPerPage = recordsPerPage;
    this.recordsPerPageChange.emit(this.recordsPerPage);
    this.pageChange.emit(this.currentPage);
  }

  isNextButtonDisabled(): boolean {
    return this.currentPage === this.getTotalPages();
  }

  isPreviousButtonDisabled(): boolean {
    return this.currentPage === 1;
  }

  getTotalPages(): number {
    return Math.ceil(this.totalRecords / this.recordsPerPage);
  }
}
