import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { PayrollService } from 'src/app/_services/payroll.service';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-fixed-deduction',
  templateUrl: './fixed-deduction.component.html',
  styleUrl: './fixed-deduction.component.css'
})
export class FixedDeductionComponent {
  closeResult: string;
  isEdit: boolean = false;
  selectedRecord: any;
  fixedContributions: any;
  fixedContributionForm: FormGroup;
  searchText: string = '';
  totalRecords: number
  recordsPerPage: number = 10;
  currentPage: number = 1;

  constructor(private modalService: NgbModal,
    private toast: ToastrService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private payroll: PayrollService
  ) {
    this.fixedContributionForm = this.fb.group({
      label: ['', Validators.required],
      isEffectAttendanceOnEligibility: [true, Validators.required]
    })
  }

  ngOnInit() {
    this.getFixedDeduction();
  }
  clearForm(){
    this.fixedContributionForm.patchValue({
      label: '',
      isEffectAttendanceOnEligibility: true
    })
  }
  open(content: any) {
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title',  backdrop: 'static' }).result.then((result) => {
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
      this.payroll.addFixedDeduction(this.fixedContributionForm.value).subscribe((res: any) => {
        this.fixedContributions.push(res.data);
        this.toast.success('Successfully Added!!!', 'Fixed Deduction');
      },
        (err) => {
          this.toast.error('Fixed Deduction Can not be added', 'Fixed Deduction');
        })
    }
    else {
      this.payroll.updateFixedDeduction(this.selectedRecord._id, this.fixedContributionForm.value).subscribe((res: any) => {
        this.toast.success('Successfully Updated!!!', 'Fixed Deduction');
        const reason = res.data;
        const index = this.fixedContributions.findIndex(reas => reas._id === reason._id);
        if (index !== -1) {
          this.fixedContributions[index] = reason;
        }
      },
        (err) => {
          this.toast.error('Fixed Deduction Can not be Updated', 'Fixed Deduction');
        })
    }
  }
  editRecord() {
    this.fixedContributionForm.patchValue(this.selectedRecord)
   }

  deleteRecord(_id: string) {
    this.payroll.deleteFixedDeduction(_id).subscribe((res: any) => {
      const index = this.fixedContributions.findIndex(res => res._id === _id);
      if (index !== -1) {
        this.fixedContributions.splice(index, 1);
        this.totalRecords--;
      }
      this.toast.success('Successfully Deleted!!!', 'Fixed Deduction');
    },
      (err) => {
        this.toast.error('Fixed Deduction Can not be deleted', 'Fixed Deduction');
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

  onPageChange(page: number) {
    this.currentPage = page;
    this.getFixedDeduction();
  }

  onRecordsPerPageChange(recordsPerPage: number) {
    this.recordsPerPage = recordsPerPage;
    this.getFixedDeduction();
  }

  getFixedDeduction() {
    const pagination = {
      skip: ((this.currentPage - 1) * this.recordsPerPage).toString(),
      next: this.recordsPerPage.toString()
    };
    this.payroll.getFixedDeduction(pagination).subscribe(res => {
      this.fixedContributions = res.data;
      this.totalRecords = res.total;
    })
  }
}