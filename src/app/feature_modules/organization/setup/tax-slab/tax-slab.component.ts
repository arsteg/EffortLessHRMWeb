import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
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
  totalRecords: number
  recordsPerPage: number = 10;
  currentPage: number = 1;
  fiscalYears: string[] = [];
  selectedCycle: string;
  isSubmitting: boolean = false;
  columns: TableColumn[] = [
    {key: 'IncomeTaxSlabs', name:'Income Tax Slabs'},
    {key: 'minAmount', name:'Minimum'},
    {key: 'maxAmount', name:'Maximum'},
    {key: 'taxPercentage', name:'Percentage'},
    {key: 'cycle', name:'Cycle'},
    {key: 'regime', name:'Regime'},
    {key: 'action', name: 'Action', isAction: true, options:[
      {label: 'Edit', icon:'edit', visibility:ActionVisibility.BOTH},
      {label: 'Delete', icon:'delete', visibility:ActionVisibility.BOTH, cssClass:'text-danger'},
    ]}
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
      skip: '',
      next: ''
    }
    this.companyService.getTaxSlabByCompany(payload).subscribe((res: any) => {
      this.taxSlabs = res.data;
      this.totalRecords = res.total;
    })
  }

  onTaxSlabChange(event) {
    console.log(event)
    if (!event.value) { this.getTaxSlabs() }
    if (event.value) {
      this.companyService.getTaxSlabByYear(event.value).subscribe((res: any) => {
        this.taxSlabs = res.data;
        this.totalRecords = res.total;
      })
    }
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
    // Set default value for fiscal year in the form
    this.taxSlabForm.controls['cycle'].setValue(this.fiscalYears[0]);
  }

  onPageChange(page: number) {
    this.currentPage = page;
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
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', backdrop: 'static' }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
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
        this.resetTaxSlabForm();this.isSubmitting = false;
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
        this.toast.success(this.translate.instant('organization.setup.tax_slab_added'), this.translate.instant('organization.toast.success'));
       this.resetTaxSlabForm();this.isSubmitting = false;
        this.isEdit = false;
      },
        err => {   const errorMessage = err?.error?.message || err?.message || err 
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
     this.taxSlabs();
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
}
