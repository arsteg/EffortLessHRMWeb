import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidatorFn } from '@angular/forms'; // Import AbstractControl, ValidatorFn
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { PayrollService } from 'src/app/_services/payroll.service';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';
import { MatPaginator } from '@angular/material/paginator';
import { TableService } from 'src/app/_services/table.service';
import { MatSort } from '@angular/material/sort';
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
  sortOrder: string = '';
  isSubmitting: boolean = false;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

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
    this.tableService.paginator = this.paginator; // Initialize paginator here
    this.tableService.dataSource.sort = this.sort;
    this.getFixedDeduction();
  }

  clearForm() {
    this.fixedContributionForm.reset({
      label: '',
      isEffectAttendanceOnEligibility: false // Reset toggle as well
    });
    this.fixedContributionForm.get('label').enable(); // Ensure label is enabled for new additions
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
    this.isSubmitting = true;
    if (this.fixedContributionForm.invalid) {
      this.isSubmitting = false;
      this.markFormGroupTouched(this.fixedContributionForm); // Mark all fields as touched
      this.toast.error(this.translate.instant('payroll.RequiredFieldAreMissing'), 'Error!');   
      return; // Stop submission if form is invalid
    }

    if (!this.isEdit) {
      this.payroll.addFixedDeduction(this.fixedContributionForm.value).subscribe({
        next: (res: any) => {
          // No need to manually add to dataSource.data if getFixedDeduction() is called
          this.toast.success(
            this.translate.instant('payroll.fixed_deduction.toast.success_added'),
            this.translate.instant('payroll.fixed_deduction.title')
          );
          this.closeModal();
        },
        error: (err) => {     
          this.isSubmitting = false;  
          const errorMessage = err?.error?.message || err?.message || err 
          ||  this.translate.instant('payroll.fixed_deduction.toast.error_add')
          ;
          this.toast.error(errorMessage);
         
        }
      });
    } else {
      this.payroll.updateFixedDeduction(this.selectedRecord._id, this.fixedContributionForm.value).subscribe({
        next: (res: any) => {
          // No need to manually update dataSource.data if getFixedDeduction() is called
          this.toast.success(
            this.translate.instant('payroll.fixed_deduction.toast.success_updated'),
            this.translate.instant('payroll.fixed_deduction.title')
          );
          this.closeModal();
        },
        error: (err) => {      
          this.isSubmitting = false;  
          const errorMessage = err?.error?.message || err?.message || err 
          ||  this.translate.instant('payroll.fixed_deduction.toast.error_update')
          ;
          this.toast.error(errorMessage);
         
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
    this.fixedContributionForm.patchValue(this.selectedRecord);
    // Disable label if isDelete is false, otherwise enable it
    // Assuming 'isDelete' indicates if a record can be deleted/modified.
    // If your logic is different (e.g., if a fixed deduction is "in use"), adjust this.
    if (this.selectedRecord.isDelete === false) { // Assuming 'isDelete' flag determines if label can be edited
        this.fixedContributionForm.get('label').disable();
    } else {
        this.fixedContributionForm.get('label').enable();
    }
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
        const errorMessage = err?.error?.message || err?.message || err 
        ||  this.translate.instant('payroll.fixed_deduction.toast.error_delete')
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