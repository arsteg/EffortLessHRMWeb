import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { PayrollService } from 'src/app/_services/payroll.service';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-loans-advances',
  templateUrl: './loans-advances.component.html',
  styleUrls: ['./loans-advances.component.css'] // Corrected styleUrl to styleUrls
})
export class LoansAdvancesComponent {
  closeResult: string;
  isEdit: boolean = false;
  selectedRecord: any;
  loans: any;
  loansAdvancesForm: FormGroup;
  searchText: string = '';
  totalRecords: number;
  recordsPerPage: number = 10;
  currentPage: number = 1;
  currentUser = JSON.parse(localStorage.getItem('currentUser'));
  user: any;
  public sortOrder: string = '';

  constructor(
    private modalService: NgbModal,
    private toast: ToastrService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private payroll: PayrollService,
    private translate: TranslateService // Added TranslateService
  ) {
    this.loansAdvancesForm = this.fb.group({
      name: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.getLoanAdvances();
  }

  clearForm() {
    this.loansAdvancesForm.patchValue({
      name: ''
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
      this.payroll.addLoans(this.loansAdvancesForm.value).subscribe(
        (res: any) => {
          this.loans.push(res.data);
          this.loansAdvancesForm.reset();
          this.toast.success(
            this.translate.instant('payroll.loans_advances.toast.success_added'),
            this.translate.instant('payroll.loans_advances.title')
          );
        },
        (err) => {
          this.toast.error(
            this.translate.instant('payroll.loans_advances.toast.error_add'),
            this.translate.instant('payroll.loans_advances.title')
          );
        }
      );
    } else {
      this.payroll.updateLoans(this.selectedRecord._id, this.loansAdvancesForm.value).subscribe(
        (res: any) => {
          const reason = res.data;
          const index = this.loans.findIndex((reas: any) => reas._id === reason._id);
          if (index !== -1) {
            this.loans[index] = reason;
          }
          this.loansAdvancesForm.reset();
          this.toast.success(
            this.translate.instant('payroll.loans_advances.toast.success_updated'),
            this.translate.instant('payroll.loans_advances.title')
          );
        },
        (err) => {
          this.toast.error(
            this.translate.instant('payroll.loans_advances.toast.error_update'),
            this.translate.instant('payroll.loans_advances.title')
          );
        }
      );
    }
  }

  editRecord() {
    this.loansAdvancesForm.patchValue(this.selectedRecord);
  }

  deleteRecord(_id: string) {
    this.payroll.deleteLoans(_id).subscribe(
      (res: any) => {
        const index = this.loans.findIndex((res: any) => res._id === _id);
        if (index !== -1) {
          this.loans.splice(index, 1);
          this.totalRecords--;
        }
        this.toast.success(
          this.translate.instant('payroll.loans_advances.toast.success_deleted'),
          this.translate.instant('payroll.loans_advances.title')
        );
      },
      (err) => {
        this.toast.error(
          this.translate.instant('payroll.loans_advances.toast.error_delete'),
          this.translate.instant('payroll.loans_advances.title')
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
    this.getLoanAdvances();
  }

  onRecordsPerPageChange(recordsPerPage: number) {
    this.recordsPerPage = recordsPerPage;
    this.getLoanAdvances();
  }

  getLoanAdvances() {
    const pagination = {
      skip: ((this.currentPage - 1) * this.recordsPerPage).toString(),
      next: this.recordsPerPage.toString()
    };
    this.payroll.getLoans(pagination).subscribe((res: any) => {
      this.loans = res.data;
      this.totalRecords = res.total;
    });
  }
}