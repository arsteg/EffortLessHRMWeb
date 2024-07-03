import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
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
  totalRecords: number;
  currentPage: number = 1;
  searchText: string = '';

  constructor(private fb: FormBuilder,
    private modalService: NgbModal,
    private payroll: PayrollService,
    private toast: ToastrService,
    private dialog: MatDialog) {
    this.ptSlabForm = this.fb.group({
      fromAmount: ['', Validators.required],
      toAmount: ['', Validators.required],
      employeePercentage: [0, Validators.required],
      employeeAmount: [0, Validators.required],
      twelfthMonthValue: [0, Validators.required],
      twelfthMonthAmount: [0, Validators.required]
    })
  }

  ngOnInit() {
    this.getPtSlab();
  }
  onPageChange(page: number) {
    this.currentPage = page;
    this.getPtSlab();
  }
  clearForm(){
    this.ptSlabForm.patchValue({
      fromAmount: '',
      toAmount: '',
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
    this.payroll.getPTSlab(pagination).subscribe((res: any) => {
      this.ptSlab = res.data;
      this.totalRecords = res.total;
    })
  }
  editRecord() {
    this.ptSlabForm.patchValue(this.selectedRecord);
    this.isEdit = true;
  }
  closeModal() {
    this.modalService.dismissAll();
  }

  onSubmission() {
    this.payroll.addPTSlab(this.ptSlabForm.value).subscribe((res) => {
      this.ptSlab.push(res.data);
      this.ptSlabForm.reset();
      this.toast.success('Successfully Added!!!', 'PT Slab');
    },
      (err) => {
        this.toast.error('PT Slab can not be added', 'PT Slab');
      }
    )
  }

  deleteRecord(_id: string) {
    this.payroll.deletePTSlab(_id).subscribe((res: any) => {
      const index = this.ptSlab.findIndex(res => res._id === _id);
      if (index !== -1) {
        this.ptSlab.splice(index, 1);
      }
      this.toast.success('Successfully Deleted!!!', 'Rounding Rules');
    },
      (err) => {
        this.toast.error('This Can not be delete as it is already used in the system', 'Rounding Rules');
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
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {
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
