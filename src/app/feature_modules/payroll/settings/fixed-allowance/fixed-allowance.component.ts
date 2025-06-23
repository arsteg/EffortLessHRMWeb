import { Component, inject, ViewChild, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidatorFn } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { PayrollService } from 'src/app/_services/payroll.service';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';
import { TranslateService } from '@ngx-translate/core';
import { MatPaginator } from '@angular/material/paginator';
import { TableService } from 'src/app/_services/table.service';
import { MatSort } from '@angular/material/sort';

const labelValidator: ValidatorFn = (control: AbstractControl) => {
  const value = control.value as string;
  // Check if the value is empty or only whitespace
  if (!value || /^\s*$/.test(value)) {
    return { required: true }; // Treat empty or only whitespace as required error
  }
  // Ensure at least one letter and only allowed characters (letters, spaces, (), /)
  const valid = /^(?=.*[a-zA-Z])[a-zA-Z\s(),/]*$/.test(value);
  return valid ? null : { invalidLabel: true };
};

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

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(
    private payroll: PayrollService,
    private toast: ToastrService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    public tableService: TableService<any>
  ) {
    this.fixedAllowanceForm = this.fb.group({
      label: ['', [Validators.required, labelValidator]],
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
    this.tableService.paginator = this.paginator;
    this.tableService.dataSource.sort = this.sort;
    this.getFixedAllowance();
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
    this.payroll.getFixedAllowance(pagination).subscribe((res: any) => {
      this.tableService.setData(res.data);
      this.tableService.totalRecords = res.total;
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
    // Explicitly set all boolean form controls to false and clear the label
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
  }

  onSubmission() {
    this.markFormGroupTouched(this.fixedAllowanceForm);

    if (this.fixedAllowanceForm.invalid) {
      return;
    }

    const newLabel = this.fixedAllowanceForm.get('label').value;

    const isDuplicate = this.tableService.dataSource.data.some((allowance: any) =>
      allowance.label.toLowerCase() === newLabel.toLowerCase() &&
      (this.isEdit ? allowance._id !== this.selectedRecord._id : true)
    );

    if (isDuplicate) {
      this.toast.error(
        this.translate.instant('payroll.duplicate_allowance_label_error'),
        this.translate.instant('payroll.fixed_allowance_title')
      );
      return;
    }

    if (!this.isEdit) {
      this.payroll.addAllowanceTemplate(this.fixedAllowanceForm.value).subscribe({
        next: (res: any) => {
          this.toast.success(
            this.translate.instant('payroll.fixed_allowance_added'),
            this.translate.instant('payroll.fixed_allowance_title')
          );
          this.closeModal();
        },
        error: (err) => {
          this.toast.error(
            this.translate.instant('payroll.fixed_allowance_add_error'),
            this.translate.instant('payroll.fixed_allowance_title')
          );
        }
      });
    } else {
      this.payroll.updateAllowanceTemplate(this.selectedRecord._id, this.fixedAllowanceForm.value).subscribe({
        next: (res: any) => {
          this.toast.success(
            this.translate.instant('payroll.fixed_allowance_updated'),
            this.translate.instant('payroll.fixed_allowance_title')
          );
          this.closeModal();
        },
        error: (err) => {
          this.toast.error(
            this.translate.instant('payroll.fixed_allowance_update_error'),
            this.translate.instant('payroll.fixed_allowance_title')
          );
        }
      });
    }
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
        this.toast.error(
          this.translate.instant('payroll.fixed_allowance_delete_error'),
          this.translate.instant('payroll.fixed_allowance_title')
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