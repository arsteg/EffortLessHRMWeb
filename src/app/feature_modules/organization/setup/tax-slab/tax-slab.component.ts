import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { CompanyService } from 'src/app/_services/company.service';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-tax-slab',
  templateUrl: './tax-slab.component.html',
  styleUrl: './tax-slab.component.css'
})
export class TaxSlabComponent {
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

  constructor(
    private toast: ToastrService,
    private companyService: CompanyService,
    private modalService: NgbModal,
    private fb: FormBuilder,
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
    if (!event) { this.getTaxSlabs() }
    if (event) {
      this.companyService.getTaxSlabByYear(event).subscribe((res: any) => {
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
    if (!this.isEdit) {
      this.companyService.addTaxSlab(this.taxSlabForm.value).subscribe((res: any) => {
        this.toast.success('Income Tax Slab Created', 'Successfully!');
        this.taxSlabForm.reset({
          IncomeTaxSlabs: '',
          minAmount: 0,
          maxAmount: 0,
          taxPercentage: 0,
          cycle: '',
          regime: ''
        });
        this.taxSlabs.push(res.data);
      },
        err => { this.toast.error('Income Tax Slab Can not be Created', 'Error!') })
    }
    if (this.isEdit) {
      this.companyService.updateTaxSlab(this.selectedRecord?._id, this.taxSlabForm.value).subscribe((res: any) => {
        const index = this.taxSlabs.findIndex((z) => z._id === this.selectedRecord._id);
        if (index !== -1) {
          this.taxSlabs[index] = { ...res.data };
        }
        this.toast.success('Income Tax Slab Updated', 'Successfully!');

        this.taxSlabForm.reset({
          IncomeTaxSlabs: '',
          minAmount: 0,
          maxAmount: 0,
          taxPercentage: 0,
          cycle: '',
          regime: ''
        })
        this.isEdit = false;
      },
        err => { this.toast.error('Income Tax Slab Can not be Updated', 'Error!') })
    }
  }

  deleteTaxSlab(id: string) {
    this.companyService.deleteTaxSlab(id).subscribe((res: any) => {
      const index = this.taxSlabs.findIndex(temp => temp._id === id);
      if (index !== -1) {
        this.taxSlabs.splice(index, 1);
      }
      this.toast.success('Successfully Deleted!!!', 'Income Tax Slab')
    },
      (err) => {
        this.toast.error('This Income Tax Slab Can not be deleted!', 'Error')
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
        this.toast.error('Can not be Deleted', 'Error!')
      }
    });
  }
}
