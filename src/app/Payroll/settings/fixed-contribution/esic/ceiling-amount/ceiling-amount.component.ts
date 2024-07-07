import { Component, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { PayrollService } from 'src/app/_services/payroll.service';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-ceiling-amount',
  templateUrl: './ceiling-amount.component.html',
  styleUrl: './ceiling-amount.component.css'
})
export class CeilingAmountComponent {
  searchText: string = '';
  totalRecords: number
  recordsPerPage: number = 10;
  currentPage: number = 1;
  isEdit = false;
  closeResult: string = '';
  selectedData: any;
  ceilingAmount: any;
  ceilingAmountForm: FormGroup;
  @Input() selectedRecord: any;

  constructor(private payroll: PayrollService,
    private modalService: NgbModal,
    private toast: ToastrService,
    private fb: FormBuilder,
    private dialog: MatDialog
  ) {
    this.ceilingAmountForm = this.fb.group({
      defaultValue: [0, Validators.required],
      maxAmount: [0, Validators.required],
      company: [this.selectedRecord?._id, Validators.required],
    });
    console.log(this.selectedRecord);
  }

  ngOnInit(): void {
    console.log(this.payroll.generalSettings.getValue())
    this.getCeilingAmount();
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.getCeilingAmount();
  }

  onRecordsPerPageChange(recordsPerPage: number) {
    this.recordsPerPage = recordsPerPage;
    this.getCeilingAmount();
  }

  getCeilingAmount() {
    const pagination = {
      skip: ((this.currentPage - 1) * this.recordsPerPage).toString(),
      next: this.recordsPerPage.toString()
    };
    this.payroll.getESICCeiling(pagination).subscribe((res: any) => {
      this.ceilingAmount = res.data;
      this.totalRecords = res.total;
    })
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
  closeModal() {
    this.modalService.dismissAll();
  }

  onSubmission() {
    if (!this.isEdit) {
      this.payroll.addESICCeiling(this.ceilingAmountForm.value).subscribe((res: any) => {
        this.ceilingAmount.push(res.data);
        this.toast.success('Successfully Added!!!', 'ESIC Ceiling Amount');
        this.ceilingAmountForm.patchValue({ defaultValue: 0, maxAmount: 0 })
      },
        (err) => {
          this.toast.error('ESIC Ceiling Amount Can not be Added', 'ESIC Ceiling Amount');
        })
    }
    else {
      this.payroll.updateESICCeiling(this.selectedRecord._id, this.ceilingAmountForm.value).subscribe((res: any) => {
        const index = this.ceilingAmount.findIndex(item => item._id === this.selectedRecord._id);
        if (index !== -1) {
          this.ceilingAmount[index] = res.data;
        }
        this.toast.success('Successfully Updated!!!', 'ESIC Ceiling Amount');
        this.isEdit = false;
        this.ceilingAmountForm.patchValue({ defaultValue: 0, maxAmount: 0 })

      },
        (err) => {
          this.toast.error('ESIC Ceiling Amount Can not be Updated', 'ESIC Ceiling Amount');
        })
    }
  }

  editRecord() {
    this.ceilingAmountForm.patchValue(this.selectedData);
  }

  clearForm() {
    this.ceilingAmountForm.patchValue({
      defaultValue: 0,
      maxAmount: 0,
    })
  }

  deleteRecord(_id: string) {
    this.payroll.deleteESICCeiling(_id).subscribe((res: any) => {
      const index = this.ceilingAmount.findIndex(res => res._id === _id);
      if (index !== -1) {
        this.ceilingAmount.splice(index, 1);
      }
      this.toast.success('Successfully Deleted!!!', 'ESIC Ceiling Amount');
    },
      (err) => {
        this.toast.error('ESIC Ceiling Amount Can not be Deleted', 'ESIC Ceiling Amount');
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


}
