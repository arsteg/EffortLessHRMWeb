import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { CompanyService } from 'src/app/_services/company.service';
import { ActionVisibility, TableColumn } from 'src/app/models/table-column';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';
import { CustomValidators } from 'src/app/_helpers/custom-validators';

@Component({
  selector: 'app-tax-slab',
  templateUrl: './tax-slab.component.html',
  styleUrl: './tax-slab.component.css'
})
export class TaxSlabComponent {
  @ViewChild('addModal') addModal: ElementRef;
  taxSlabForm: FormGroup;
  taxSlabs: any;
  selectedRecord: any;
  isEdit: boolean;
  closeResult: string;
  public sortOrder: string = '';
  searchText: string = '';
  totalRecords: number = 0;
  recordsPerPage: number = 10;
  currentPage: number = 1;
  fiscalYears: string[] = [];
  selectedCycle: string;
  isSubmitting: boolean = false;
  allData: any[] = [];
  dialogRef: MatDialogRef<any> | null = null;
  columns: TableColumn[] = [
    { key: 'IncomeTaxSlabs', name: this.translate.instant('organization.tax_slab.table.income_tax_slabs') },
    { key: 'minAmount', name: this.translate.instant('organization.tax_slab.table.min_amount') },
    { key: 'maxAmount', name: this.translate.instant('organization.tax_slab.table.max_amount') },
    { key: 'taxPercentage', name: this.translate.instant('organization.tax_slab.table.tax_percentage') },
    { key: 'cycle', name: this.translate.instant('organization.tax_slab.table.cycle') },
    { key: 'regime', name: this.translate.instant('organization.tax_slab.table.regime') },
    {
      key: 'action', name: 'Action', isAction: true, options: [
        { label: 'Edit', icon: 'edit', visibility: ActionVisibility.LABEL },
        { label: 'Delete', icon: 'delete', visibility: ActionVisibility.LABEL },
      ]
    }
  ]

  constructor(
    private toast: ToastrService,
    private companyService: CompanyService,
    private modalService: NgbModal,
    private fb: FormBuilder,
    private translate: TranslateService,
    private dialog: MatDialog,
  ) {
    this.taxSlabForm = this.fb.group({
      IncomeTaxSlabs: ['', Validators.required],
      minAmount: [0, Validators.required],
      maxAmount: [0, Validators.required],
      taxPercentage: [0, Validators.required],
      cycle: ['', Validators.required],
      regime: ['', Validators.required]
    })
  }

  ngOnInit() {
    this.initializeFiscalYears();
    this.getTaxSlabs();
  }

  onActionClick(event) {
    switch (event.action.label) {
      case 'Edit':
        this.isSubmitting = false;
        this.selectedRecord = event.row;
        this.isEdit = true;
        this.setFormValues();
        this.open(this.addModal);
        break;

      case 'Delete':
        this.deleteDialog(event.row?._id)
        break;
    }
  }

  getTaxSlabs() {
    let payload = {
      skip: (this.currentPage - 1) * this.recordsPerPage,
      next: this.recordsPerPage,
      cycle: this.selectedCycle || ''
    }
    this.companyService.getTaxSlabByCompany(payload).subscribe((res: any) => {
      this.taxSlabs = res.data;
      this.allData = res.data;
      this.totalRecords = res.total;
    })
  }

  onTaxSlabChange(event) {
    this.currentPage = 1;
    this.getTaxSlabs();
  }

  initializeFiscalYears(): void {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();

    const startYear = currentMonth > 2 ? currentYear : currentYear - 1;
    this.fiscalYears = [
      `FY ${startYear - 1}-${startYear}`,
      `FY ${startYear}-${startYear + 1}`,
      `FY ${startYear + 1}-${startYear + 2}`,
    ];
    // Set default value for fiscal year in the form and the filter
    this.selectedCycle = this.fiscalYears[1];
    this.taxSlabForm.controls['cycle'].setValue(this.selectedCycle);
  }

  onPageChange(event: any) {
    this.currentPage = event.pageIndex + 1;
    this.recordsPerPage = event.pageSize;
    this.getTaxSlabs();
  }

  onRecordsPerPageChange(recordsPerPage: number) {
    this.recordsPerPage = recordsPerPage;
    this.getTaxSlabs();
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }

  open(content: any) {
    this.dialogRef = this.dialog.open(content, {
      disableClose: true,
      width: '50%'
    });

    this.dialogRef.afterClosed().subscribe(result => {
      this.dialogRef = null;
    });
  }

  setFormValues() {
    if (this.isEdit) { this.taxSlabForm.patchValue(this.selectedRecord) }
    if (!this.isEdit) {
      this.taxSlabForm.reset({
        IncomeTaxSlabs: '',
        minAmount: 0,
        maxAmount: 0,
        taxPercentage: 0,
        cycle: '',
        regime: ''
      })
    }
  }

  onSubmission() {
    this.isSubmitting = true;
    this.taxSlabForm.markAllAsTouched();

    // Prevent submission if form is invalid
    if (this.taxSlabForm.invalid) {
      this.isSubmitting = false;
      return;
    }
    if (!this.isEdit) {
      this.companyService.addTaxSlab(this.taxSlabForm.value).subscribe((res: any) => {
        this.toast.success(this.translate.instant('organization.setup.tax_slab_added'), this.translate.instant('organization.toast.success'));
        this.resetTaxSlabForm(); this.isSubmitting = false;
        this.dialogRef.close(true);
        this.getTaxSlabs();
      },
        err => {
          const errorMessage = err?.error?.message || err?.message || err
            || this.translate.instant('organization.setup.tax_slab_add_fail')
            ;
          this.toast.error(errorMessage, 'Error!');
          this.isSubmitting = false;
        })
    }
    if (this.isEdit) {
      this.companyService.updateTaxSlab(this.selectedRecord?._id, this.taxSlabForm.value).subscribe((res: any) => {
        this.getTaxSlabs();
        this.toast.success(this.translate.instant('organization.setup.tax_slab_updated'), this.translate.instant('organization.toast.success'));
        this.resetTaxSlabForm(); this.isSubmitting = false;
        this.dialogRef.close(true);
        this.isEdit = false;
      },
        err => {
          const errorMessage = err?.error?.message || err?.message || err
            || this.translate.instant('organization.setup.tax_slab_add_fail')
            ;
          this.toast.error(errorMessage, 'Error!');
          this.isSubmitting = false;
        })
    }
  }
  resetTaxSlabForm(): void {
    this.taxSlabForm.reset({
      IncomeTaxSlabs: '',
      minAmount: 0,
      maxAmount: 0,
      taxPercentage: 0,
      cycle: '',
      regime: ''
    });

    this.taxSlabForm.markAsPristine();
    this.taxSlabForm.markAsUntouched();
  }

  deleteTaxSlab(id: string) {
    this.companyService.deleteTaxSlab(id).subscribe((res: any) => {
      this.getTaxSlabs();
      this.toast.success(this.translate.instant('organization.setup.deleted'), this.translate.instant('organization.toast.success'));

    },
      (err) => {
        const errorMessage = err?.error?.message || err?.message || err
          || this.translate.instant('organization.setup.delete_fail')
          ;
        this.toast.error(errorMessage, 'Error!');

      })
  }

  deleteDialog(id: string): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'delete') {
        this.deleteTaxSlab(id);
      }
      err => {
        const errorMessage = err?.error?.message || err?.message || err
          || this.translate.instant('organization.setup.delete_fail')
          ;
        this.toast.error(errorMessage, 'Error!');
      }
    });
  }

  onClose() {
    this.isEdit = false;
    this.isSubmitting = false;
    this.resetTaxSlabForm();
    this.dialogRef.close(true);
  }

  onSortChange(event: any) {
    const sorted = this.allData.slice().sort((a: any, b: any) => {
      const valueA = this.getNestedValue(a, event.active);
      const valueB = this.getNestedValue(b, event.active);
      if (valueA < valueB) return event.direction === 'asc' ? -1 : 1;
      if (valueA > valueB) return event.direction === 'asc' ? 1 : -1;
      return 0;
    });
    this.taxSlabs = sorted;
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((o, key) => (o ? o[key] : undefined), obj);
  }

  onSearchChange(search: any) {
    const data = this.allData?.filter(row => {
      return this.columns.some(col => {
        return row[col.key]?.toString().toLowerCase().includes(search.toLowerCase());
      });
    });
    this.taxSlabs = data;
    this.totalRecords = data.length;
  }
}
