import { Component, inject, ViewChild, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { PayrollService } from 'src/app/_services/payroll.service';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';
import { TranslateService } from '@ngx-translate/core';
import { TableService } from 'src/app/_services/table.service';
import { map, catchError } from 'rxjs';
import { ActionVisibility, TableColumn } from 'src/app/models/table-column';
import { CustomValidators } from 'src/app/_helpers/custom-validators';

@Component({
  selector: 'app-fixed-allowance',
  templateUrl: './fixed-allowance.component.html',
  styleUrls: ['./fixed-allowance.component.css']
})
export class FixedAllowanceComponent implements AfterViewInit {
  private readonly translate = inject(TranslateService);
  fixedAllowanceForm: FormGroup;
  isEdit = false;
  selectedRecord: any;
  dialogRef: MatDialogRef<any>;
  isSubmitting: boolean = false;
  @ViewChild('modal') modal: any;

  columns: TableColumn[] = [
    {
      key: 'label',
      name: this.translate.instant('payroll.allowance_name'),
      valueFn: (row) => row.label || ''
    },
    {
      key: 'isProvidentFundAffected',
      name: this.translate.instant('payroll.pf'),
      valueFn: (row) => row.isProvidentFundAffected ? '<mat-icon class="text-success">check</mat-icon>' : '<mat-icon class="text-danger">close</mat-icon>',
      isHtml: true
    },
    {
      key: 'isESICAffected',
      name: this.translate.instant('payroll.esic'),
      valueFn: (row) => row.isESICAffected ? '<mat-icon class="text-success">check</mat-icon>' : '<mat-icon class="text-danger">close</mat-icon>',
      isHtml: true
    },
    {
      key: 'isLWFAffected',
      name: this.translate.instant('payroll.lwf'),
      valueFn: (row) => row.isLWFAffected ? '<mat-icon class="text-success">check</mat-icon>' : '<mat-icon class="text-danger">close</mat-icon>',
      isHtml: true
    },
    {
      key: 'isProfessionalTaxAffected',
      name: this.translate.instant('payroll.pt'),
      valueFn: (row) => row.isProfessionalTaxAffected ? '<mat-icon class="text-success">check</mat-icon>' : '<mat-icon class="text-danger">close</mat-icon>',
      isHtml: true
    },
    {
      key: 'isTDSAffected',
      name: this.translate.instant('payroll.tds'),
      valueFn: (row) => row.isTDSAffected ? '<mat-icon class="text-success">check</mat-icon>' : '<mat-icon class="text-danger">close</mat-icon>',
      isHtml: true
    },
    {
      key: 'isGratuityFundAffected',
      name: this.translate.instant('payroll.gratuity'),
      valueFn: (row) => row.isGratuityFundAffected ? '<mat-icon class="text-success">check</mat-icon>' : '<mat-icon class="text-danger">close</mat-icon>',
      isHtml: true
    },
    {
      key: 'actions',
      name: this.translate.instant('payroll.actions'),
      isAction: true,
      options: [
        {
          label: this.translate.instant('payroll.edit'),
          visibility: ActionVisibility.BOTH,
          icon: 'edit',
          hideCondition: (row) => false
        },
        {
          label: this.translate.instant('payroll.delete'),
          visibility: ActionVisibility.BOTH,
          icon: 'delete',
          cssClass: 'delete-btn',
          hideCondition: (row) => !row.isDelete
        }
      ]
    }
  ];

  constructor(
    private payroll: PayrollService,
    private toast: ToastrService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    public tableService: TableService<any>
  ) {
    this.fixedAllowanceForm = this.fb.group({
      label: ['', [Validators.required, CustomValidators.noNumbersOrSymbolsValidator, CustomValidators.noLeadingOrTrailingSpaces.bind(this)]],
      isProvidentFundAffected: [false],
      isESICAffected: [false],
      isGratuityFundAffected: [false],
      isLWFAffected: [false],
      isProfessionalTaxAffected: [false],
      isTDSAffected: [false],
    });

    this.tableService.setCustomFilterPredicate((data: any, filter: string) => {
      return data.label.toLowerCase().includes(filter);
    });
  }

  ngOnInit() {
    this.getFixedAllowance();
  }

  ngAfterViewInit() {
    this.tableService.initializeDataSource([]);
  }

  onPageChange(event: any) {
    this.tableService.updatePagination(event);
    this.getFixedAllowance();
  }

  getFixedAllowance() {
    const pagination = {
      skip: ((this.tableService.currentPage - 1) * this.tableService.recordsPerPage).toString(),
      next: this.tableService.recordsPerPage.toString()
    };
    this.payroll.getFixedAllowance(pagination).pipe(
      map((res: any) => res.data),
      catchError((error) => {
        this.toast.error(this.translate.instant('payroll.fixed_allowance_fetch_error'), 'Error');
        throw error;
      })
    ).subscribe({
      next: (data) => {
        this.tableService.setData(data);
        this.tableService.totalRecords = data.total || data.length;
      },
      error: (error) => {
        console.error('Error while fetching fixed allowances:', error);
      }
    });
  }

  open(content: any) {
    this.dialogRef = this.dialog.open(content, {
      width: '600px',
      disableClose: true,
    });

    this.dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.getFixedAllowance();
      }
    });
  }

  closeModal() {
    this.dialogRef.close(true);
    this.fixedAllowanceForm.reset({
      label: '',
      isProvidentFundAffected: false,
      isESICAffected: false,
      isGratuityFundAffected: false,
      isLWFAffected: false,
      isProfessionalTaxAffected: false,
      isTDSAffected: false,
    });
    this.fixedAllowanceForm.get('label').enable();
    this.isSubmitting = false;
  }

  onSubmission() {
    this.markFormGroupTouched(this.fixedAllowanceForm);
    this.isSubmitting = true;
    if (this.fixedAllowanceForm.invalid) {
      this.toast.error(this.translate.instant('payroll.RequiredFieldAreMissing'), 'Error');
      this.isSubmitting = false;
      return;
    }
    const request$ = this.isEdit
      ? this.payroll.updateAllowanceTemplate(this.selectedRecord._id, this.fixedAllowanceForm.value)
      : this.payroll.addAllowanceTemplate(this.fixedAllowanceForm.value);

    request$.subscribe({
      next: (res: any) => {
        this.toast.success(
          this.translate.instant(this.isEdit ? 'payroll.fixed_allowance_updated' : 'payroll.fixed_allowance_added'),
          this.translate.instant('payroll.fixed_allowance_title')
        );
        this.getFixedAllowance();
        this.closeModal();
      },
      error: (err) => {
        const errorMessage = err?.error?.message || err?.message || this.translate.instant(this.isEdit ? 'payroll.fixed_allowance_update_error' : 'payroll.fixed_allowance_add_error');
        this.toast.error(errorMessage);
        this.isSubmitting = false;
      }
    });
  }

  markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  editRecord() {
    this.fixedAllowanceForm.patchValue({
      label: this.selectedRecord.label,
      isProvidentFundAffected: this.selectedRecord.isProvidentFundAffected,
      isESICAffected: this.selectedRecord.isESICAffected,
      isGratuityFundAffected: this.selectedRecord.isGratuityFundAffected,
      isLWFAffected: this.selectedRecord.isLWFAffected,
      isProfessionalTaxAffected: this.selectedRecord.isProfessionalTaxAffected,
      isTDSAffected: this.selectedRecord.isTDSAffected,
    });
    if (this.selectedRecord.isDelete === false) {
      this.fixedAllowanceForm.get('label').disable();
    } else {
      this.fixedAllowanceForm.get('label').enable();
    }
  }

  deleteRecord(_id: string) {
    this.payroll.deleteAllowanceTemplate(_id).subscribe({
      next: (res: any) => {
        this.tableService.setData(this.tableService.dataSource.data.filter(item => item._id !== _id));
        this.toast.success(
          this.translate.instant('payroll.fixed_allowance_deleted'),
          this.translate.instant('payroll.fixed_allowance_title')
        );
      },
      error: (err) => {
        const errorMessage = err?.error?.message || err?.message || this.translate.instant('payroll.fixed_allowance_delete_error');
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

  onAction(event: any): void {
    this.selectedRecord = event.row;
    if (event.action.label === this.translate.instant('payroll.edit')) {
      this.isEdit = true;
      this.editRecord();
      this.open(this.modal);
    } else if (event.action.label === this.translate.instant('payroll.delete')) {
      this.deleteDialog(event.row._id);
    }
  }
}