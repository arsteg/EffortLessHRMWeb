import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { PayrollService } from 'src/app/_services/payroll.service';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-ceiling-amount',
  templateUrl: './ceiling-amount.component.html',
  styleUrls: ['./ceiling-amount.component.css']
})
export class CeilingAmountComponent {
  searchText: string = '';
  totalRecords: number;
  recordsPerPage: number = 10;
  currentPage: number = 1;
  isEdit = false;
  closeResult: string = '';
  ceilingAmount: any;
  ceilingAmountForm: FormGroup;
  selectedRecord: any;

  constructor(
    private payroll: PayrollService,
    private modalService: NgbModal,
    private toast: ToastrService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private translate: TranslateService
  ) {
    this.ceilingAmountForm = this.fb.group({
      employeeCount: [0, Validators.required],
      maxGrossAmount: [0, Validators.required]
    });
  }

  ngOnInit(): void {
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

    // Delay DOM access to ensure modal is rendered
    setTimeout(() => {
      const focusableElement = document.querySelector('input[formControlName="employeeCount"]');
      if (focusableElement) {
        (focusableElement as HTMLElement).focus();
      }
    }, 100);
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
      this.payroll.addESICCeiling(this.ceilingAmountForm.value).subscribe({
        next: (res: any) => {
          this.ceilingAmount.push(res.data);
          this.toast.success(
            this.translate.instant('payroll.esic_ceiling_amount_added'),
            this.translate.instant('payroll.esic_ceiling_amount_title')
          );
          this.ceilingAmountForm.patchValue({ employeeCount: 0, maxGrossAmount: 0 });
        },
        error: () => {
          this.toast.error(
            this.translate.instant('payroll.esic_ceiling_amount_add_error'),
            this.translate.instant('payroll.esic_ceiling_amount_title')
          );
        }
      });
    } else {
      this.payroll.updateESICCeiling(this.selectedRecord._id, this.ceilingAmountForm.value).subscribe({
        next: (res: any) => {
          const index = this.ceilingAmount.findIndex(item => item._id === this.selectedRecord._id);
          if (index !== -1) {
            this.ceilingAmount[index] = res.data;
          }
          this.toast.success(
            this.translate.instant('payroll.esic_ceiling_amount_updated'),
            this.translate.instant('payroll.esic_ceiling_amount_title')
          );
          this.isEdit = false;
          this.ceilingAmountForm.patchValue({ employeeCount: 0, maxGrossAmount: 0 });
        },
        error: () => {
          this.toast.error(
            this.translate.instant('payroll.esic_ceiling_amount_update_error'),
            this.translate.instant('payroll.esic_ceiling_amount_title')
          );
        }
      });
    }
  }

  editRecord() {
    this.ceilingAmountForm.patchValue(this.selectedRecord);
  }

  clearForm() {
    this.ceilingAmountForm.patchValue({
      employeeCount: 0,
      maxGrossAmount: 0
    });
  }

  deleteRecord(_id: string) {
    this.payroll.deleteESICCeiling(_id).subscribe({
      next: (res: any) => {
        const index = this.ceilingAmount.findIndex(res => res._id === _id);
        if (index !== -1) {
          this.ceilingAmount.splice(index, 1);
        }
        this.toast.success(
          this.translate.instant('payroll.esic_ceiling_amount_deleted'),
          this.translate.instant('payroll.esic_ceiling_amount_title')
        );
      },
      error: () => {
        this.toast.error(
          this.translate.instant('payroll.esic_ceiling_amount_delete_error'),
          this.translate.instant('payroll.esic_ceiling_amount_title')
        );
      }
    });
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