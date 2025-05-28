import { Component, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core'; // Import TranslateService
import { CompanyService } from 'src/app/_services/company.service';
import { PayrollService } from 'src/app/_services/payroll.service';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-lwf-slab',
  templateUrl: './lwf-slab.component.html',
  styleUrl: './lwf-slab.component.css'
})
export class LwfSlabComponent {
  states: any;
  lwfSlabs: any;
  selectedData: any;
  isEdit: boolean = false;
  lwfSLabForm: FormGroup;
  closeResult: string = '';
  recordsPerPage: number = 10;
  totalRecords: number;
  currentPage: number = 1;
  searchText: string = '';
  selectedState: string = '';
  stateTouched: boolean = false;
  @Input() selectedRecord: any;
  eligibleStates: any;
  route: any;

  constructor(
    private payrollService: PayrollService,
    private companyService: CompanyService,
    private fb: FormBuilder,
    private modalService: NgbModal,
    private toast: ToastrService,
    private dialog: MatDialog,
    private translate: TranslateService // Inject TranslateService
  ) {
    this.lwfSLabForm = this.fb.group({
      fixedContribution: ['', Validators.required],
      employeeAmount: [0, Validators.required],
      employerAmount: [0, Validators.required],
      employeePercentage: [0],
      employerPercentage: [0],
      maxContribution: [0],
      minAmount: [0],
      maxAmount: [0]
    });
  }

  ngOnInit() {
    this.payrollService.getAllStates().subscribe((res: any) => {
      this.eligibleStates = res.data;
    }); 
    this.getCompanyState();
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.getLwfSlab();
  }

  clearForm() {
    this.isEdit = false;
    this.lwfSLabForm.patchValue({
      fixedContribution: this.selectedRecord?._id,
      employeeAmount: 0,
      employerAmount: 0,
      employeePercentage: 0,
      employerPercentage: 0,
      maxContribution: 0,
      minAmount: 0,
      maxAmount: 0
    });
  }

  onRecordsPerPageChange(recordsPerPage: number) {
    this.recordsPerPage = recordsPerPage;
    this.getLwfSlab();
  }

  getLwfSlab() {
    const pagination = {
      skip: ((this.currentPage - 1) * this.recordsPerPage).toString(),
      next: this.recordsPerPage.toString(),
      state: this.selectedState
    };
    this.payrollService.getLWFByState(pagination).subscribe((res: any) => {
      this.lwfSlabs = res.data;
      this.totalRecords = res.total;
    });
  }

  getCompanyState() {
    this.companyService.getCompany().subscribe((res: any) => {
      this.selectedState = res.data.company.state;
      this.getLwfSlab();
    });
  }

  editRecord() {
    console.log(this.selectedData);
    this.lwfSLabForm.patchValue(this.selectedData);
  }

  closeModal() {
    this.modalService.dismissAll();
  }

  onSubmission() {
    const payload = {
      ...this.lwfSLabForm.value,
      state: this.selectedState
    };
  
    if (!this.isEdit) {
      this.payrollService.addLWF(payload).subscribe(
        (res) => {  
          this.getLwfSlab();     
          this.translate.get(['payroll._lwf.slab.success_added', 'payroll.lwf_title']).subscribe(translations => {
            this.toast.success(translations['payroll._lwf.slab.success_added'], translations['payroll.lwf_title']);
          });
        },
        (err) => {
          const errorMessage = err?.error?.message || err?.message || this.translate.instant('payroll._lwf.slab.error_add');
          this.translate.get('payroll.lwf_title').subscribe(title => {
            this.toast.error(errorMessage, title);
          });
        }
      );
    } else {
      this.payrollService.updateLWF(this.selectedData._id, payload).subscribe(
        (res) => {      
          this.getLwfSlab();   
          this.lwfSLabForm.reset();
          this.translate.get(['payroll._lwf.slab.success_updated', 'payroll.lwf_title']).subscribe(translations => {
            this.toast.success(translations['payroll._lwf.slab.success_updated'], translations['payroll.lwf_title']);
          });
        },
        (err) => {
          const errorMessage = err?.error?.message || err?.message || this.translate.instant('payroll._lwf.slab.error_update');
          this.translate.get('payroll.lwf_title').subscribe(title => {
            this.toast.error(errorMessage, title);
          });
        }
      );
    }  
    this.closeModal();
  }  

  deleteRecord(_id: string) {
    this.payrollService.deleteLWF(_id).subscribe(
      (res: any) => {
        const index = this.lwfSlabs.findIndex(res => res._id === _id);
        if (index !== -1) {
          this.lwfSlabs.splice(index, 1);
        }
        this.translate.get(['payroll._lwf.slab.success_deleted', 'payroll.lwf_title']).subscribe(translations => {
          this.toast.success(translations['payroll._lwf.slab.success_deleted'], translations['payroll.lwf_title']);
        });
      },
      (err) => {
        const errorMessage = err?.error?.message || err?.message || this.translate.instant('payroll._lwf.slab.error_delete');
        this.translate.get('payroll.lwf_title').subscribe(title => {
          this.toast.error(errorMessage, title);
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

  handleAdd(modal: any) {
    this.stateTouched = true;
    if (!this.selectedState) {
      this.translate.get('payroll._lwf.slab.warning_state').subscribe(message => {
        this.toast.warning(message);
      });
      return;
    }
  
    this.isEdit = false;
    this.clearForm();
    this.open(modal);
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