// src/app/components/barcode-list/barcode-list.component.ts
import { Component, OnInit } from '@angular/core';
import { FeedbackService } from 'src/app/_services/feedback.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { debounceTime, Subject } from 'rxjs';
import { Barcode } from 'src/app/models/feedback/barcode';

@Component({
  selector: 'app-barcode-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './barcode-list.component.html',
  styleUrls: ['./barcode-list.component.css']
})
export class BarcodeListComponent implements OnInit {
  barcodes: Barcode[] = [];
  barcodesFiltered: Barcode[] = [];
  searchQuery = '';
  selectedBarcode: Barcode | null = null;
  isEdit = false;
  barcodeForm: FormGroup;
  private searchSubject = new Subject<string>();
  baseUrl = 'http://localhost:4200'; // Adjust to your base URL

  constructor(
    private feedbackService: FeedbackService,
    private snackBar: MatSnackBar,
    private fb: FormBuilder
  ) {
    this.barcodeForm = this.fb.group({      
      name: ['', Validators.required],
      storeId: ['', Validators.required],
      tableId: ['', Validators.required]
    });
    this.searchSubject.pipe(debounceTime(300)).subscribe(query => {
      this.searchQuery = query;
      this.filterBarcodes();
    });
  }

  ngOnInit(): void {
    this.loadBarcodes();
  }

  onSearchInput(query: string): void {
    this.searchSubject.next(query);
  }

  loadBarcodes(): void {
    this.feedbackService.getBarcodesByCompany().subscribe({
      next: (response) => {
        this.barcodes = response.data;
        this.barcodesFiltered = this.barcodes;
      },
      error: () => this.showError('Failed to load barcodes')
    });
  }

  onBarcodeCreated(): void {
    this.loadBarcodes();
    this.clearForm();
    this.showSuccess('Barcode created successfully');
  }

  onBarcodeUpdated(): void {
    this.loadBarcodes();
    this.isEdit = false;
    this.clearForm();
    this.showSuccess('Barcode updated successfully');
  }

  addBarcode(): void {
    if (this.barcodeForm.invalid) {
      this.barcodeForm.markAllAsTouched();
      this.showError('Please fill in all required fields');
      return;
    }

    const barcodeData = this.barcodeForm.value;
    const url = `${this.baseUrl}/#/submit-feedback?storeId=${barcodeData.storeId}&tableId=${barcodeData.tableId}`;

    if (this.isEdit && this.selectedBarcode?._id) {
      this.feedbackService.updateBarcode(this.selectedBarcode._id, { ...barcodeData, url }).subscribe({
        next: () => this.onBarcodeUpdated(),
        error: () => this.showError('Failed to update barcode')
      });
    } else {
      this.feedbackService.createBarcode({ ...barcodeData, url }).subscribe({
        next: () => this.onBarcodeCreated(),
        error: () => this.showError('Failed to create barcode')
      });
    }
  }

  editBarcode(barcode: Barcode): void {
    this.isEdit = true;
    this.selectedBarcode = { ...barcode };
    this.barcodeForm.patchValue({      
      name: barcode.name,
      storeId: barcode.storeId,
      tableId: barcode.tableId
    });
  }

  deleteBarcode(id: string | undefined): void {
    if (!id) {
      this.showError('Invalid barcode ID');
      return;
    }
    if (confirm('Are you sure you want to delete this barcode?')) {
      this.feedbackService.deleteBarcode(id).subscribe({
        next: () => {
          this.barcodes = this.barcodes.filter(b => b._id !== id);
          this.barcodesFiltered = this.barcodesFiltered.filter(b => b._id !== id);
          this.showSuccess('Barcode deleted successfully');
        },
        error: () => this.showError('Failed to delete barcode')
      });
    }
  }

  filterBarcodes(): void {
    this.barcodesFiltered = this.barcodes.filter(barcode =>
      barcode.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      barcode.companyId.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      barcode.storeId.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      barcode.tableId.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      barcode.url.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  clearForm(): void {
    this.selectedBarcode = null;
    this.isEdit = false;
    this.barcodeForm.reset();
  }

  trackById(index: number, barcode: Barcode): string {
    return barcode._id || index.toString();
  }

  printBarcode(barcode: Barcode): void {
    const printWindow = window.open('', '_blank');
    printWindow?.document.write(`
      <html>
        <body onload="window.print(); window.close()">
          <div style="text-align: center;">
            <h3>Scan to Submit Feedback</h3>
            <img src="${barcode.qrCodeDataUrl}" alt="QR Code" />
            <p>${barcode.url}</p>
          </div>
        </body>
      </html>
    `);
    printWindow?.document.close();
  }

  downloadBarcode(barcode: Barcode): void {
    const link = document.createElement('a');
    link.href = barcode.qrCodeDataUrl;
    link.download = `barcode-${barcode.companyId}-${barcode.storeId}-${barcode.tableId}.png`;
    link.click();
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Close', { duration: 3000 });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Close', { duration: 3000 });
  }
}