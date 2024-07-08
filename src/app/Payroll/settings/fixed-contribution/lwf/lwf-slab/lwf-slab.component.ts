import { Component, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
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
  @Input() selectedRecord: any;

  constructor(private payrollService: PayrollService,
    private fb: FormBuilder,
    private modalService: NgbModal,
    private toast: ToastrService,
    private dialog: MatDialog
  ) {
    this.lwfSLabForm = this.fb.group({
      fixedContribution: ['', Validators.required],
      fromAmount: [this.selectedRecord?._id, Validators.required],
      toAmount: ['', Validators.required],
      employeePercent: [0, Validators.required],
      employeeAmount: [0, Validators.required],
      employerPercentage: [0, Validators.required],
      employerAmount: [0, Validators.required]
    })
  }

  ngOnInit() {
    this.payrollService.getEligibleStates().subscribe((res: any) => {
      this.states = res.data;
    });
    this.getLwfSlab();

  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.getLwfSlab();
  }
  clearForm() {
    this.isEdit = false;
    this.lwfSLabForm.patchValue({
      fixedContribution: this.selectedRecord?._id,
      fromAmount: 0,
      toAmount: 0,
      employeePercent: 0,
      employeeAmount: 0,
      employerPercentage: 0,
      employerAmount: 0
    })
  }
  onRecordsPerPageChange(recordsPerPage: number) {
    this.recordsPerPage = recordsPerPage;
    this.getLwfSlab();
  }

  getLwfSlab() {
    const pagination = {
      skip: ((this.currentPage - 1) * this.recordsPerPage).toString(),
      next: this.recordsPerPage.toString()
    };
    this.payrollService.getLWF(pagination).subscribe((res: any) => {
      this.lwfSlabs = res.data;
      this.totalRecords = res.total;
    })
  }
  editRecord() {
    console.log(this.selectedData);
    this.lwfSLabForm.patchValue(this.selectedData);
  }

  closeModal() {
    this.modalService.dismissAll();
  }

  onSubmission() {
    if (!this.isEdit) {
      this.payrollService.addLWF(this.lwfSLabForm.value).subscribe((res) => {
        this.lwfSlabs.push(res.data);
        this.lwfSLabForm.reset();
        this.toast.success('Successfully Added!!!', 'LWF Slab');
      },
        (err) => {
          this.toast.error('LWF Slab can not be added', 'LWF Slab');
        }
      )
    }
    else {
      this.payrollService.updateLWF(this.selectedData._id,this.lwfSLabForm.value).subscribe((res) => {
        this.lwfSlabs.push(res.data);
        this.lwfSLabForm.reset();
        this.toast.success('Successfully Updated!!!', 'LWF Slab');
      },
        (err) => {
          this.toast.error('LWF Slab can not be updated', 'LWF Slab');
        }
      )
    }
  }

  deleteRecord(_id: string) {
    this.payrollService.deleteLWF(_id).subscribe((res: any) => {
      const index = this.lwfSlabs.findIndex(res => res._id === _id);
      if (index !== -1) {
        this.lwfSlabs.splice(index, 1);
      }
      this.toast.success('Successfully Deleted!!!', 'LWF Slab');
    },
      (err) => {
        this.toast.error('LWF Slab can not be deleted', 'LWF Slab');
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
