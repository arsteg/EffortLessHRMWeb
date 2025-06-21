import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { PayrollService } from 'src/app/_services/payroll.service';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';
import { TranslateService } from '@ngx-translate/core';
import { ActionVisibility, TableColumn } from 'src/app/models/table-column';

@Component({
  selector: 'app-ceiling-amount',
  templateUrl: './ceiling-amount.component.html',
  styleUrls: ['./ceiling-amount.component.css']
})
export class CeilingAmountComponent {
  allData: any;
  searchText: string = '';
  totalRecords: number;
  recordsPerPage: number = 10;
  currentPage: number = 1;
  isEdit = false;
  closeResult: string = '';
  ceilingAmount: any;
  ceilingAmountForm: FormGroup;
  selectedRecord: any;
  dialogRef: MatDialogRef<any>;
  columns: TableColumn[] = [
    { key: 'employeeCount', name: this.translate.instant('payroll.minimum_employee_count') },
    { key: 'maxGrossAmount', name: this.translate.instant('payroll.gross_monthly_salary_limit') },
    {
      key: 'action',
      name: this.translate.instant('payroll.actions'),
      isAction: true,
      options: [
        { label: 'Edit', icon: 'edit', visibility: ActionVisibility.BOTH },
        { label: 'Delete', icon: 'delete', visibility: ActionVisibility.BOTH, cssClass: "delete-btn" },
      ]
    },
  ];

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

  onSearch(search: any) {
    this.ceilingAmount = this.allData?.filter(row => {
      const found = this.columns.some(col => {
        return row[col.key]?.toString().toLowerCase().includes(search.toLowerCase());
      });
      return found;
    });
  }

  onAction(event: any, modal: any) {
    switch (event.action.label) {
      case 'Edit':
        this.selectedRecord = event.row;
        this.open(modal);
        this.isEdit = true;
        this.editRecord();
        break;
      case 'Delete': this.deleteDialog(event.row?._id); break;
    }
  }

  onPageChange(page: any) {
    this.currentPage = page.pageIndex;
    this.recordsPerPage = page.pageSize;
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
      this.allData = res.data;
      this.totalRecords = res.total;
    });
  }

  open(content: any) {
    this.dialogRef = this.dialog.open(content, {width: '500px'});

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
          this.dialogRef.close();
        },
        error: () => {
          this.toast.error(
            this.translate.instant('payroll.esic_ceiling_amount_add_error'),
            this.translate.instant('payroll.esic_ceiling_amount_title')
          );
          this.dialogRef.close();
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