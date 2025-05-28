import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { AuthenticationService } from 'src/app/_services/authentication.service';
import { PayrollService } from 'src/app/_services/payroll.service';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-flexi-benefits',
  templateUrl: './flexi-benefits.component.html',
  styleUrls: ['./flexi-benefits.component.css'] // Corrected styleUrl to styleUrls
})
export class FlexiBenefitsComponent {
  closeResult: string;
  isEdit: boolean = false;
  selectedRecord: any;
  flexiBenefits: any;
  flexiBenefitsForm: FormGroup;
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
    private auth: AuthenticationService,
    private translate: TranslateService // Added TranslateService
  ) {
    this.flexiBenefitsForm = this.fb.group({
      name: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.getFlexiBenefits();
  }

  clearForm() {
    this.flexiBenefitsForm.patchValue({
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
      this.payroll.addFlexiBenefits(this.flexiBenefitsForm.value).subscribe(
        (res: any) => {
          this.flexiBenefits.push(res.data);
          this.flexiBenefitsForm.reset();
          this.toast.success(
            this.translate.instant('payroll.flexi_benefits.toast.success_added'),
            this.translate.instant('payroll.flexi_benefits.title')
          );
        },
        (err) => {
          this.toast.error(
            this.translate.instant('payroll.flexi_benefits.toast.error_add'),
            this.translate.instant('payroll.flexi_benefits.title')
          );
        }
      );
    } else {
      this.payroll.updateFlexiBenefits(this.selectedRecord._id, this.flexiBenefitsForm.value).subscribe(
        (res: any) => {
          const reason = res.data;
          const index = this.flexiBenefits.findIndex((reas: any) => reas._id === reason._id);
          if (index !== -1) {
            this.flexiBenefits[index] = reason;
          }
          this.toast.success(
            this.translate.instant('payroll.flexi_benefits.toast.success_updated'),
            this.translate.instant('payroll.flexi_benefits.title')
          );
        },
        (err) => {
          this.toast.error(
            this.translate.instant('payroll.flexi_benefits.toast.error_update'),
            this.translate.instant('payroll.flexi_benefits.title')
          );
        }
      );
    }
  }

  editRecord() {
    this.flexiBenefitsForm.patchValue(this.selectedRecord);
  }

  deleteRecord(_id: string) {
    this.payroll.deleteFlexiBenefits(_id).subscribe(
      (res: any) => {
        const index = this.flexiBenefits.findIndex((res: any) => res._id === _id);
        if (index !== -1) {
          this.flexiBenefits.splice(index, 1);
          this.totalRecords--;
        }
        this.toast.success(
          this.translate.instant('payroll.flexi_benefits.toast.success_deleted'),
          this.translate.instant('payroll.flexi_benefits.title')
        );
      },
      (err) => {
        this.toast.error(
          this.translate.instant('payroll.flexi_benefits.toast.error_delete'),
          this.translate.instant('payroll.flexi_benefits.title')
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
    this.getFlexiBenefits();
  }

  onRecordsPerPageChange(recordsPerPage: number) {
    this.recordsPerPage = recordsPerPage;
    this.getFlexiBenefits();
  }

  getFlexiBenefits() {
    const pagination = {
      skip: ((this.currentPage - 1) * this.recordsPerPage).toString(),
      next: this.recordsPerPage.toString()
    };
    this.payroll.getFlexiBenefits(pagination).subscribe((res: any) => {
      this.flexiBenefits = res.data;
      this.totalRecords = res.total;
    });
  }
}