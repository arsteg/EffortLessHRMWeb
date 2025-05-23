import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
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
  frequency: any[] = ['Monthly', 'Annually', 'Semi-Annually', 'Bi-Monthly', 'Quarterly']

  constructor(private fb: FormBuilder,
    private modalService: NgbModal,
    private payrollService: PayrollService,
    private companyService: CompanyService,
    private toast: ToastrService,
    private dialog: MatDialog) {
    this.ptSlabForm = this.fb.group({
      state: ['', Validators.required],
      fromAmount: [0],
      toAmount: [0],
      employeePercentage: [0, Validators.required],
      employeeAmount: [0, Validators.required],
      twelfthMonthValue: [0, Validators.required],
      twelfthMonthAmount: [0, Validators.required],
      frequency: ['Monthly', Validators.required],
    })
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
    })
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
    })
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
      this.payrollService.addPTSlab(this.ptSlabForm.value).subscribe((res) => {
        this.getPtSlab();
        this.clearForm();
        this.toast.success('Successfully Added!!!', 'PT Slab');
      },
        (err) => {
          this.toast.error('PT Slab can not be added', 'PT Slab');
        }
      )
    }
    else if (this.isEdit) {
      this.payrollService.updatePTSlab(this.selectedRecord._id, payload).subscribe((res) => {
        this.getPtSlab();
        this.clearForm();
        this.toast.success('Successfully Updated!!!', 'PT Slab');
      },
        (err) => {
          this.toast.error('PT Slab can not be updated', 'PT Slab');
        }
      )
    }
  }

  deleteRecord(_id: string) {
    this.payrollService.deletePTSlab(_id).subscribe((res: any) => {
      const index = this.ptSlab.findIndex(res => res._id === _id);
      if (index !== -1) {
        this.ptSlab.splice(index, 1);
      }
      this.toast.success('Successfully Deleted!!!', 'PT Slab');
    },
      (err) => {
        this.toast.error('PT Slab can not be deleted', 'Error');
      })
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
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', backdrop: 'static' }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
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