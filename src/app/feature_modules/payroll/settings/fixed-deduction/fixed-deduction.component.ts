import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { PayrollService } from 'src/app/_services/payroll.service';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';
import { TableService } from 'src/app/_services/table.service';
import { map, catchError } from 'rxjs';
import { ActionVisibility, TableColumn } from 'src/app/models/table-column';
import { CustomValidators } from 'src/app/_helpers/custom-validators';

@Component({
  selector: 'app-fixed-deduction',
  templateUrl: './fixed-deduction.component.html',
  styleUrls: ['./fixed-deduction.component.css']
})
export class FixedDeductionComponent implements AfterViewInit {
  isEdit: boolean = false;
  selectedRecord: any;
  fixedContributionForm: FormGroup;
  dialogRef: MatDialogRef<any>;
  isSubmitting: boolean = false;
  @ViewChild('modal') modal: any;

  columns: TableColumn[] = [
    {
      key: 'label',
      name: this.translate.instant('payroll.fixed_deduction.table.deduction_name'),
      valueFn: (row) => row.label || ''
    },
    {
      key: 'isEffectAttendanceOnEligibility', // Changed from 'eligibility'
      name: this.translate.instant('payroll.fixed_deduction.table.deduction_eligilibity'),
      icons: [
        { name: 'check', value: true, class: 'text-success' },
        { name: 'close', value: false, class: 'text-danger' }
      ]
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
          hideCondition: (row) => false
        }
      ]
    }
  ];

  constructor(
    private toast: ToastrService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private payroll: PayrollService,
    private translate: TranslateService,
    public tableService: TableService<any>
  ) {
    this.fixedContributionForm = this.fb.group({
      label: ['', [Validators.required, CustomValidators.noNumbersOrSymbolsValidator, CustomValidators.noLeadingOrTrailingSpaces.bind(this)]],
      isEffectAttendanceOnEligibility: [false]
    });

    this.tableService.setCustomFilterPredicate((data: any, filter: string) => {
      return data.label.toLowerCase().includes(filter);
    });
  }

  ngOnInit() {
    this.getFixedDeduction();
  }

  ngAfterViewInit() {
    this.tableService.initializeDataSource([]);
  }

  clearForm() {
    this.fixedContributionForm.reset({
      label: '',
      isEffectAttendanceOnEligibility: false
    });
    this.fixedContributionForm.get('label').enable();
    this.isSubmitting = false;
  }

  open(content: any) {
    this.dialogRef = this.dialog.open(content, {
      width: '600px',
      disableClose: true,
    });

    this.dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.getFixedDeduction();
      }
    });
  }

  closeModal() {
    this.dialogRef.close(true);
    this.isSubmitting = false;
  }

  onSubmission() {
    this.markFormGroupTouched(this.fixedContributionForm);
    this.isSubmitting = true;
    if (this.fixedContributionForm.invalid) {
      this.toast.error(this.translate.instant('payroll.RequiredFieldAreMissing'), 'Error');
      this.isSubmitting = false;
      return;
    }

    const request$ = this.isEdit
      ? this.payroll.updateFixedDeduction(this.selectedRecord._id, this.fixedContributionForm.value)
      : this.payroll.addFixedDeduction(this.fixedContributionForm.value);

    request$.subscribe({
      next: () => {
        this.toast.success(
          this.translate.instant(this.isEdit ? 'payroll.fixed_deduction.toast.success_updated' : 'payroll.fixed_deduction.toast.success_added'),
          this.translate.instant('payroll.fixed_deduction.title')
        );
        this.getFixedDeduction();
        this.closeModal();
      },
      error: (err) => {
        const errorMessage = err?.error?.message || err?.message || this.translate.instant(this.isEdit ? 'payroll.fixed_deduction.toast.error_update' : 'payroll.fixed_deduction.toast.error_add');
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
    this.fixedContributionForm.patchValue(this.selectedRecord);
    if (this.selectedRecord.isDelete === false) {
      this.fixedContributionForm.get('label').disable();
    } else {
      this.fixedContributionForm.get('label').enable();
    }
  }

  deleteRecord(_id: string) {
    this.payroll.deleteFixedDeduction(_id).subscribe({
      next: () => {
        this.tableService.setData(this.tableService.dataSource.data.filter(item => item._id !== _id));
        this.toast.success(
          this.translate.instant('payroll.fixed_deduction.toast.success_deleted'),
          this.translate.instant('payroll.fixed_deduction.title')
        );
      },
      error: (err) => {
        const errorMessage = err?.error?.message || err?.message || this.translate.instant('payroll.fixed_deduction.toast.error_delete');
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

  onPageChange(event: any) {
    this.tableService.updatePagination(event);
    this.getFixedDeduction();
  }

  getFixedDeduction() {
    const pagination = {
      skip: ((this.tableService.currentPage - 1) * this.tableService.recordsPerPage).toString(),
      next: this.tableService.recordsPerPage.toString(),
    };
    this.payroll.getFixedDeduction(pagination).pipe(
      map((res: any) => res.data),
      catchError((error) => {
        this.toast.error(this.translate.instant('payroll.fixed_deduction.toast.error_fetch'), 'Error');
        throw error;
      })
    ).subscribe({
      next: (data) => {
        this.tableService.setData(data);
        this.tableService.totalRecords = data.total || data.length;
      },
      error: (error) => {
        console.error('Error while fetching fixed deductions:', error);
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