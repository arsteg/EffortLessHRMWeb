import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { PayrollService } from 'src/app/_services/payroll.service';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';
import { MatPaginator } from '@angular/material/paginator';
import { TableService } from 'src/app/_services/table.service';

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
  sortOrder: string = '';

  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(
    private toast: ToastrService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private payroll: PayrollService,
    private translate: TranslateService,
    public tableService: TableService<any>
  ) {
    this.fixedContributionForm = this.fb.group({
      label: ['', Validators.required],
      isEffectAttendanceOnEligibility: [false]
    });

    // Set custom filter predicate to search by label
    this.tableService.setCustomFilterPredicate((data: any, filter: string) => {
      return data.label.toLowerCase().includes(filter);
    });
  }

  ngOnInit() {
    this.getFixedDeduction();
  }

  ngAfterViewInit() {
    this.tableService.initializeDataSource([]);
    this.getFixedDeduction();
  }

  clearForm() {
    this.fixedContributionForm.reset({
      label: '',
    });
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
  }

  onSubmission() {
    if (this.fixedContributionForm.valid) {
      if (!this.isEdit) {
        this.payroll.addFixedDeduction(this.fixedContributionForm.value).subscribe({
          next: (res: any) => {
            this.tableService.setData([...this.tableService.dataSource.data, res.data]);
            this.clearForm();
            this.toast.success(
              this.translate.instant('payroll.fixed_deduction.toast.success_added'),
              this.translate.instant('payroll.fixed_deduction.title')
            );
            this.closeModal();
          },
          error: (err) => {
            this.toast.error(
              this.translate.instant('payroll.fixed_deduction.toast.error_add'),
              this.translate.instant('payroll.fixed_deduction.title')
            );
          }
        });
      } else {
        this.payroll.updateFixedDeduction(this.selectedRecord._id, this.fixedContributionForm.value).subscribe({
          next: (res: any) => {
            const updatedData = this.tableService.dataSource.data.map(item =>
              item._id === res.data._id ? res.data : item
            );
            this.tableService.setData(updatedData);
            this.toast.success(
              this.translate.instant('payroll.fixed_deduction.toast.success_updated'),
              this.translate.instant('payroll.fixed_deduction.title')
            );
            this.closeModal();
          },
          error: (err) => {
            this.toast.error(
              this.translate.instant('payroll.fixed_deduction.toast.error_update'),
              this.translate.instant('payroll.fixed_deduction.title')
            );
          }
        });
      }
    } else {
      this.markFormGroupTouched(this.fixedContributionForm);
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
    this.fixedContributionForm.patchValue(this.selectedRecord);
  }

  deleteRecord(_id: string) {
    this.payroll.deleteFixedDeduction(_id).subscribe({
      next: (res: any) => {
        this.tableService.setData(this.tableService.dataSource.data.filter(item => item._id !== _id));
        this.toast.success(
          this.translate.instant('payroll.fixed_deduction.toast.success_deleted'),
          this.translate.instant('payroll.fixed_deduction.title')
        );
      },
      error: (err) => {
        this.toast.error(
          this.translate.instant('payroll.fixed_deduction.toast.error_delete'),
          this.translate.instant('payroll.fixed_deduction.title')
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

  onPageChange(event: any) {
    this.tableService.updatePagination(event);
    this.getFixedDeduction();
  }

  getFixedDeduction() {
    const pagination = {
      skip: ((this.tableService.currentPage - 1) * this.tableService.recordsPerPage).toString(),
      next: this.tableService.recordsPerPage.toString(),
    };
    this.payroll.getFixedDeduction(pagination).subscribe((res: any) => {
      this.tableService.setData(res.data);
      this.tableService.totalRecords = res.total;
    });
  }
}