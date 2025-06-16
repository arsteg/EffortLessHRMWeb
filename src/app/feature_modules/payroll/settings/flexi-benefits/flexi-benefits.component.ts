import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { PayrollService } from 'src/app/_services/payroll.service';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';
import { MatPaginator } from '@angular/material/paginator';
import { TableService } from 'src/app/_services/table.service';

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
  selector: 'app-flexi-benefits',
  templateUrl: './flexi-benefits.component.html',
  styleUrls: ['./flexi-benefits.component.css']
})
export class FlexiBenefitsComponent implements AfterViewInit {
  isEdit: boolean = false;
  selectedRecord: any;
  flexiBenefitsForm: FormGroup;
  dialogRef: MatDialogRef<any>;
  sortOrder: string = '';
  currentUser = JSON.parse(localStorage.getItem('currentUser'));

  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(
    private toast: ToastrService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private payroll: PayrollService,
    private translate: TranslateService,
    public tableService: TableService<any>
  ) {
    this.flexiBenefitsForm = this.fb.group({
      name: ['', [Validators.required, labelValidator]]
    });

    // Set custom filter predicate to search by name
    this.tableService.setCustomFilterPredicate((data: any, filter: string) => {
      return data.name.toLowerCase().includes(filter);
    });
  }

  ngOnInit() {
    this.getFlexiBenefits();
  }

  ngAfterViewInit() {
    this.tableService.initializeDataSource([]);
    this.getFlexiBenefits();
  }

  clearForm() {
    this.flexiBenefitsForm.reset({
      name: ''
    });
  }

  open(content: any) {
    this.dialogRef = this.dialog.open(content, {
      width: '600px',
      disableClose: true,
    });

    this.dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.getFlexiBenefits();
      }
    });
  }

  closeModal() {
    this.dialogRef.close(true);
  }
  isDuplicate: boolean = false;
  onSubmission() {
    if (this.flexiBenefitsForm.valid) {
      const newBenefitName = this.flexiBenefitsForm.value.name.toLowerCase();

      // Check for duplicate name if not in edit mode
      if (!this.isEdit) {
        this.isDuplicate = this.tableService.dataSource.data.some(
          (benefit: any) => benefit.name.toLowerCase() === newBenefitName
        );
      
        if (this.isDuplicate) {
          this.toast.error(
            this.translate.instant('payroll.flexi_benefits.toast.duplicate_name_error'),
            this.translate.instant('payroll.flexi_benefits.title')
          );
          return; // Stop submission if duplicate is found
        }
      }

      if (!this.isEdit) {
        this.payroll.addFlexiBenefits(this.flexiBenefitsForm.value).subscribe({
          next: (res: any) => {
            this.tableService.setData([...this.tableService.dataSource.data, res.data]);
            this.clearForm();
            this.toast.success(
              this.translate.instant('payroll.flexi_benefits.toast.success_added'),
              this.translate.instant('payroll.flexi_benefits.title')
            );
            this.closeModal();
          },
          error: (err) => {
            this.toast.error(
              this.translate.instant('payroll.flexi_benefits.toast.error_add'),
              this.translate.instant('payroll.flexi_benefits.title')
            );
          }
        });
      } else {
        // In edit mode, check for duplicate only if the name has changed and it conflicts with another existing benefit
        const originalName = this.selectedRecord.name.toLowerCase();
        if (newBenefitName !== originalName) {
          this.isDuplicate = this.tableService.dataSource.data.some(
            (benefit: any) => benefit.name.toLowerCase() === newBenefitName && benefit._id !== this.selectedRecord._id
          );
          if (this.isDuplicate) {
            this.toast.error(
              this.translate.instant('payroll.flexi_benefits.toast.duplicate_name_error'),
              this.translate.instant('payroll.flexi_benefits.title')
            );
            return;
          }
        }

        this.payroll.updateFlexiBenefits(this.selectedRecord._id, this.flexiBenefitsForm.value).subscribe({
          next: (res: any) => {
            const updatedData = this.tableService.dataSource.data.map(item =>
              item._id === res.data._id ? res.data : item
            );
            this.tableService.setData(updatedData);
            this.toast.success(
              this.translate.instant('payroll.flexi_benefits.toast.success_updated'),
              this.translate.instant('payroll.flexi_benefits.title')
            );
            this.closeModal();
          },
          error: (err) => {
            this.toast.error(
              this.translate.instant('payroll.flexi_benefits.toast.error_update'),
              this.translate.instant('payroll.flexi_benefits.title')
            );
          }
        });
      }
    } else {
      this.markFormGroupTouched(this.flexiBenefitsForm);
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
    this.flexiBenefitsForm.patchValue(this.selectedRecord);
  }

  deleteRecord(_id: string) {
    this.payroll.deleteFlexiBenefits(_id).subscribe({
      next: (res: any) => {
        this.tableService.setData(this.tableService.dataSource.data.filter(item => item._id !== _id));
        this.toast.success(
          this.translate.instant('payroll.flexi_benefits.toast.success_deleted'),
          this.translate.instant('payroll.flexi_benefits.title')
        );
      },
      error: (err) => {
        this.toast.error(
          this.translate.instant('payroll.flexi_benefits.toast.error_delete'),
          this.translate.instant('payroll.flexi_benefits.title')
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
    this.getFlexiBenefits();
  }

  getFlexiBenefits() {
    const pagination = {
      skip: ((this.tableService.currentPage - 1) * this.tableService.recordsPerPage).toString(),
      next: this.tableService.recordsPerPage.toString()
    };
    this.payroll.getFlexiBenefits(pagination).subscribe((res: any) => {
      this.tableService.setData(res.data);
      this.tableService.totalRecords = res.total;
    });
  }
}
