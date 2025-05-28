import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core'; // Import TranslateService
import { CompanyService } from 'src/app/_services/company.service';
import { PayrollService } from 'src/app/_services/payroll.service';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-pt-slab',
  templateUrl: './pt-slab.component.html',
  styleUrl: './pt-slab.component.css'
})
export class PtSlabComponent {
  ptSlab: any;
  selectedRecord: any;
  isEdit: boolean = false;
  ptSlabForm: FormGroup;
  closeResult: string = '';
  recordsPerPage: number = 10;
  selectedState: string = '';
  totalRecords: number;
  currentPage: number = 1;
  searchText: string = '';
  states: any;
  frequency: string[] = []; // Initialize as empty, to be populated with translated values

  constructor(
    private fb: FormBuilder,
    private modalService: NgbModal,
    private payrollService: PayrollService,
    private companyService: CompanyService,
    private toast: ToastrService,
    private dialog: MatDialog,
    private translate: TranslateService // Inject TranslateService
  ) {
    this.ptSlabForm = this.fb.group({
      state: ['', Validators.required],
      fromAmount: [0],
      toAmount: [0],
      employeePercentage: [0, Validators.required],
      employeeAmount: [0, Validators.required],
      twelfthMonthValue: [0, Validators.required],
      twelfthMonthAmount: [0, Validators.required],
      frequency: ['Monthly', Validators.required],
    });

    // Translate frequency options
    this.translate.get([
      'payroll.professional-tax.frequency.monthly',
      'payroll.professional-tax.frequency.annually',
      'payroll.professional-tax.frequency.semi_annually',
      'payroll.professional-tax.frequency.bi_monthly',
      'payroll.professional-tax.frequency.quarterly'
    ]).subscribe(translations => {
      this.frequency = [
        translations['payroll.professional-tax.frequency.monthly'],
        translations['payroll.professional-tax.frequency.annually'],
        translations['payroll.professional-tax.frequency.semi_annually'],
        translations['payroll.professional-tax.frequency.bi_monthly'],
        translations['payroll.professional-tax.frequency.quarterly']
      ];
    });
  }

  ngOnInit() {
    this.getCompanyState();
    this.getPtSlab();
  }

  getCompanyState() {
    this.companyService.getCompany().subscribe((res: any) => {
      const companyState = res?.data?.company?.state;
      this.ptSlabForm.patchValue({ state: companyState });
    });
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.getPtSlab();
  }

  clearForm() {
    this.ptSlabForm.patchValue({
      state: '',
      fromAmount: 0,
      toAmount: 0,
      employeePercentage: 0,
      employeeAmount: 0,
      twelfthMonthValue: 0,
      twelfthMonthAmount: 0
    });
  }

  onRecordsPerPageChange(recordsPerPage: number) {
    this.recordsPerPage = recordsPerPage;
    this.getPtSlab();
  }

  getPtSlab() {
    const pagination = {
      skip: ((this.currentPage - 1) * this.recordsPerPage).toString(),
      next: this.recordsPerPage.toString()
    };
    this.payrollService.getPTSlab(pagination).subscribe((res: any) => {
      this.ptSlab = res.data;
      this.totalRecords = res.total;
    });
  }

  editRecord() {
    this.isEdit = true;
    this.ptSlabForm.patchValue(this.selectedRecord);
  }

  closeModal() {
    this.modalService.dismissAll();
  }

  onSubmission() {
    const payload = {
      ...this.ptSlabForm.value
    };
    if (!this.isEdit) {
      this.payrollService.addPTSlab(this.ptSlabForm.value).subscribe(
        (res) => {
          this.getPtSlab();
          this.clearForm();
          this.translate.get(['payroll.professional-tax.toast.success_added', 'payroll.professional-tax.title']).subscribe(translations => {
            this.toast.success(translations['payroll.professional-tax.toast.success_added'], translations['payroll.professional-tax.title']);
          });
        },
        (err) => {
          this.translate.get(['payroll.professional-tax.toast.error_add', 'payroll.professional-tax.title']).subscribe(translations => {
            this.toast.error(translations['payroll.professional-tax.toast.error_add'], translations['payroll.professional-tax.title']);
          });
        }
      );
    } else {
      this.payrollService.updatePTSlab(this.selectedRecord._id, payload).subscribe(
        (res) => {
          this.getPtSlab();
          this.clearForm();
          this.translate.get(['payroll.professional-tax.toast.success_updated', 'payroll.professional-tax.title']).subscribe(translations => {
            this.toast.success(translations['payroll.professional-tax.toast.success_updated'], translations['payroll.professional-tax.title']);
          });
        },
        (err) => {
          this.translate.get(['payroll.professional-tax.toast.error_update', 'payroll.professional-tax.title']).subscribe(translations => {
            this.toast.error(translations['payroll.professional-tax.toast.error_update'], translations['payroll.professional-tax.title']);
          });
        }
      );
    }
  }

  deleteRecord(_id: string) {
    this.payrollService.deletePTSlab(_id).subscribe(
      (res: any) => {
        const index = this.ptSlab.findIndex(res => res._id === _id);
        if (index !== -1) {
          this.ptSlab.splice(index, 1);
        }
        this.translate.get(['payroll.professional-tax.toast.success_deleted', 'payroll.professional-tax.title']).subscribe(translations => {
          this.toast.success(translations['payroll.professional-tax.toast.success_deleted'], translations['payroll.professional-tax.title']);
        });
      },
      (err) => {
        this.translate.get(['payroll.professional-tax.toast.error_delete', 'payroll.professional-tax.title']).subscribe(translations => {
          this.toast.error(translations['payroll.professional-tax.toast.error_delete'], translations['payroll.professional-tax.title']);
        });
      }
    );
  }

  deleteDialog(id: string): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'delete') {
        this.deleteRecord(id);
      }
    });
  }

  open(content: any) {
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', backdrop: 'static' }).result.then(
      (result) => {
        this.closeResult = `Closed with: ${result}`;
      },
      (reason) => {
        this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
      }
    );
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
}