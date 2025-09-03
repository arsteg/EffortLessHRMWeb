import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { PayrollService } from 'src/app/_services/payroll.service';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';
import { TranslateService } from '@ngx-translate/core';
import { ActionVisibility, TableColumn } from 'src/app/models/table-column';
import { CustomValidators } from 'src/app/_helpers/custom-validators';

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
  isSubmitting: boolean = false;
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
      employeeCount: ['', [Validators.required, CustomValidators.greaterThanOneValidator(),CustomValidators.onlyIntegerValidator()]],
      maxGrossAmount: ['', [Validators.required, CustomValidators.greaterThanOneValidator()]]
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

  closeModal() {
    this.modalService.dismissAll();
    this.isSubmitting = false;
  }

  onSubmission() {
    this.isSubmitting = true;
    if (this.ceilingAmountForm.invalid) {            
      this.ceilingAmountForm.markAllAsTouched();  // This triggers validation errors
      this.toast.error(this.translate.instant('payroll.RequiredFieldAreMissing'), 'Error!');
      this.isSubmitting = false;
      return;
    }
    if (!this.isEdit) {
      this.payroll.addESICCeiling(this.ceilingAmountForm.value).subscribe({
        next: (res: any) => {         
          this.toast.success(
            this.translate.instant('payroll.esic_ceiling_amount_added'),
            this.translate.instant('payroll.esic_ceiling_amount_title')
          );
          this.getCeilingAmount();
          this.dialogRef.close();
          this.clearForm();
        },
        error: (err) => {
          const errorMessage = err?.error?.message || err?.message || err 
          ||  this.translate.instant('payroll.esic_ceiling_amount_add_error')
          ;
          this.toast.error(errorMessage);
        }       
      });
    } else {
      this.payroll.updateESICCeiling(this.selectedRecord._id, this.ceilingAmountForm.value).subscribe({
        next: (res: any) => {
        
          this.toast.success(
            this.translate.instant('payroll.esic_ceiling_amount_updated'),
            this.translate.instant('payroll.esic_ceiling_amount_title')
          );
          this.getCeilingAmount();
          this.isEdit = false;
          this.clearForm();
        },        
        error: (err) => {
          const errorMessage = err?.error?.message || err?.message || err 
          ||  this.translate.instant('payroll.esic_ceiling_amount_update_error')
          ;
          this.toast.error(errorMessage);
        }    
      });
    }
  }

  editRecord() {
    this.ceilingAmountForm.patchValue(this.selectedRecord);
  }

  clearForm() {
    this.ceilingAmountForm.patchValue({
      employeeCount: '',
      maxGrossAmount:''
    });
    this.isSubmitting = false;
  }

  deleteRecord(_id: string) {
    this.payroll.deleteESICCeiling(_id).subscribe({
      next: (res: any) => {       
        this.toast.success(
          this.translate.instant('payroll.esic_ceiling_amount_deleted'),
          this.translate.instant('payroll.esic_ceiling_amount_title')
        );
        this.getCeilingAmount();
      },
      error: (err) => {
        const errorMessage = err?.error?.message || err?.message || err 
        ||  this.translate.instant('payroll.esic_ceiling_amount_delete_error')
        ;
        this.toast.error(errorMessage);
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