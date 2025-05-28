import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core'; // Import TranslateService
import { PayrollService } from 'src/app/_services/payroll.service';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-contribution',
  templateUrl: './contribution.component.html',
  styleUrl: './contribution.component.css'
})
export class ContributionComponent {
  searchText: string = '';
  totalRecords: number;
  recordsPerPage: number = 10;
  currentPage: number = 1;
  isEdit = false;
  closeResult: string = '';
  selectedRecord: any;
  contribution: any;
  contributionForm: FormGroup;

  constructor(
    private payroll: PayrollService,
    private modalService: NgbModal,
    private toast: ToastrService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private translate: TranslateService // Inject TranslateService
  ) {
    this.contributionForm = this.fb.group({
      employeePercentage: [0, Validators.required],
      employerPercentage: [0, Validators.required],
    });
  }

  ngOnInit(): void {
    this.getContribution();
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.getContribution();
  }

  onRecordsPerPageChange(recordsPerPage: number) {
    this.recordsPerPage = recordsPerPage;
    this.getContribution();
  }

  getContribution() {
    const pagination = {
      skip: ((this.currentPage - 1) * this.recordsPerPage).toString(),
      next: this.recordsPerPage.toString()
    };
    this.payroll.getContribution(pagination).subscribe(res => {
      this.contribution = res.data;
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
      this.payroll.addContribution(this.contributionForm.value).subscribe(
        (res: any) => {
          this.contribution.push(res.data);
          this.translate.get(['esic.toast.success_added', 'esic.title']).subscribe(translations => {
            this.toast.success(translations['esic.toast.success_added'], translations['esic.title']);
          });
          this.clearForm();
        },
        (err) => {
          this.translate.get(['esic.toast.error_add', 'esic.title']).subscribe(translations => {
            this.toast.error(translations['esic.toast.error_add'], translations['esic.title']);
          });
        }
      );
    } else {
      this.payroll.updateContribution(this.selectedRecord._id, this.contributionForm.value).subscribe(
        (res: any) => {
          const index = this.contribution.findIndex(item => item._id === this.selectedRecord._id);
          if (index !== -1) {
            this.contribution[index] = res.data;
          }
          this.translate.get(['esic.toast.success_updated', 'esic.title']).subscribe(translations => {
            this.toast.success(translations['esic.toast.success_updated'], translations['esic.title']);
          });
          this.clearForm();
        },
        (err) => {
          this.translate.get(['esic.toast.error_update', 'esic.title']).subscribe(translations => {
            this.toast.error(translations['esic.toast.error_update'], translations['esic.title']);
          });
        }
      );
    }
  }

  editRecord() {
    this.contributionForm.patchValue(this.selectedRecord);
  }

  clearForm() {
    this.contributionForm.patchValue({
      employeePercentage: 0,
      employerPercentage: 0,
    });
  }

  deleteRecord(_id: string) {
    this.payroll.deleteContribution(_id).subscribe(
      (res: any) => {
        const index = this.contribution.findIndex(res => res._id === _id);
        if (index !== -1) {
          this.contribution.splice(index, 1);
        }
        this.translate.get(['esic.toast.success_deleted', 'esic.title']).subscribe(translations => {
          this.toast.success(translations['esic.toast.success_deleted'], translations['esic.title']);
        });
      },
      (err) => {
        this.translate.get(['esic.toast.error_delete', 'esic.title']).subscribe(translations => {
          this.toast.error(translations['esic.toast.error_delete'], translations['esic.title']);
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
}