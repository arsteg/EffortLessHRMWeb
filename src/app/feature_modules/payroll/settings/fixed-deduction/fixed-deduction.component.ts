import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core'; // Added for translation
import { PayrollService } from 'src/app/_services/payroll.service';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-fixed-deduction',
  templateUrl: './fixed-deduction.component.html',
  styleUrls: ['./fixed-deduction.component.css'] // Corrected styleUrl to styleUrls
})
export class FixedDeductionComponent {
  closeResult: string;
  isEdit: boolean = false;
  selectedRecord: any;
  fixedContributions: any;
  fixedContributionForm: FormGroup;
  searchText: string = '';
  totalRecords: number;
  recordsPerPage: number = 10;
  currentPage: number = 1;
  public sortOrder: string = '';

  constructor(
    private modalService: NgbModal,
    private toast: ToastrService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private payroll: PayrollService,
    private translate: TranslateService // Added TranslateService
  ) {
    this.fixedContributionForm = this.fb.group({
      label: ['', Validators.required],
    });
  }

  ngOnInit() {
    this.getFixedDeduction();
  }

  clearForm() {
    this.fixedContributionForm.patchValue({
      label: '',
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

  closeModal() {
    this.modalService.dismissAll();
  }

  onSubmission() {
    if (!this.isEdit) {
      this.payroll.addFixedDeduction(this.fixedContributionForm.value).subscribe(
        (res: any) => {
          this.fixedContributions.push(res.data);
          this.fixedContributionForm.reset({});
          this.toast.success(
            this.translate.instant('payroll.fixed_deduction.toast.success_added'),
            this.translate.instant('payroll.fixed_deduction.title')
          );
        },
        (err) => {
          this.toast.error(
            this.translate.instant('payroll.fixed_deduction.toast.error_add'),
            this.translate.instant('payroll.fixed_deduction.title')
          );
        }
      );
    } else {
      this.payroll.updateFixedDeduction(this.selectedRecord._id, this.fixedContributionForm.value).subscribe(
        (res: any) => {
          this.toast.success(
            this.translate.instant('payroll.fixed_deduction.toast.success_updated'),
            this.translate.instant('payroll.fixed_deduction.title')
          );
          const reason = res.data;
          const index = this.fixedContributions.findIndex((reas: any) => reas._id === reason._id);
          if (index !== -1) {
            this.fixedContributions[index] = reason;
          }
        },
        (err) => {
          this.toast.error(
            this.translate.instant('payroll.fixed_deduction.toast.error_update'),
            this.translate.instant('payroll.fixed_deduction.title')
          );
        }
      );
    }
  }

  editRecord() {
    this.fixedContributionForm.patchValue(this.selectedRecord);
  }

  deleteRecord(_id: string) {
    this.payroll.deleteFixedDeduction(_id).subscribe(
      (res: any) => {
        const index = this.fixedContributions.findIndex((res: any) => res._id === _id);
        if (index !== -1) {
          this.fixedContributions.splice(index, 1);
          this.totalRecords--;
        }
        this.toast.success(
          this.translate.instant('payroll.fixed_deduction.toast.success_deleted'),
          this.translate.instant('payroll.fixed_deduction.title')
        );
      },
      (err) => {
        this.toast.error(
          this.translate.instant('payroll.fixed_deduction.toast.error_delete'),
          this.translate.instant('payroll.fixed_deduction.title')
        );
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
      next: this.recordsPerPage.toString(),
    };
    this.payroll.getFixedDeduction(pagination).subscribe((res: any) => {
      this.fixedContributions = res.data;
      this.totalRecords = res.total;
    });
  }
}