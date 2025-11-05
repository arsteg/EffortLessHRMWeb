import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { PayrollService } from 'src/app/_services/payroll.service';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';
import { MatPaginator } from '@angular/material/paginator';
import { TableService } from 'src/app/_services/table.service';
import { ActionVisibility, TableColumn } from 'src/app/models/table-column';
import { CustomValidators } from 'src/app/_helpers/custom-validators';

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
  isSubmitting: boolean = false;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  columns: TableColumn[] = [
    { key: 'name', name: this.translate.instant('payroll.flexi_benefits.table.category_name') },
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
  allData: any = [];

  constructor(
    private toast: ToastrService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private payroll: PayrollService,
    private translate: TranslateService,
    public tableService: TableService<any>
  ) {
    this.flexiBenefitsForm = this.fb.group({
        name: ['', [Validators.required, CustomValidators.noNumbersOrSymbolsValidator, CustomValidators.noLeadingOrTrailingSpaces.bind(this)]],
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

  onSearch(search: any) {
    const data = this.allData?.filter(row => {
      const found = this.columns.some(col => {
        return row[col.key]?.toString().toLowerCase().includes(search.toLowerCase());
      });
      return found;
    });
    this.tableService.setData(data);
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

  clearForm() {
    this.flexiBenefitsForm.reset({
      name: ''
    });
    this.isSubmitting = false;
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
    this.markFormGroupTouched(this.flexiBenefitsForm);
    this.isSubmitting = true;
    if (this.flexiBenefitsForm.invalid) {
      this.toast.error(this.translate.instant('payroll.RequiredFieldAreMissing'), 'Error!');   
      this.isSubmitting = false;
      return;
    }
    if (this.flexiBenefitsForm.valid) {   

      if (!this.isEdit) {
        this.payroll.addFlexiBenefits(this.flexiBenefitsForm.value).subscribe({
          next: (res: any) => {
            this.getFlexiBenefits();
            this.clearForm();
            this.toast.success(
              this.translate.instant('payroll.flexi_benefits.toast.success_added'),
              this.translate.instant('payroll.flexi_benefits.title')
            );
            this.closeModal();
          },
          error: (err) => {           
            const errorMessage = err?.error?.message || err?.message || err 
            ||  this.translate.instant('payroll.variable_deduction.toast.error_add')
            ;
            this.toast.error(errorMessage);
            this.isSubmitting = false;
          }
        });
      } else {
       

        this.payroll.updateFlexiBenefits(this.selectedRecord._id, this.flexiBenefitsForm.value).subscribe({
          next: (res: any) => {
            this.getFlexiBenefits();
            this.toast.success(
              this.translate.instant('payroll.flexi_benefits.toast.success_updated'),
              this.translate.instant('payroll.flexi_benefits.title')
            );
            this.closeModal();
          },
          error: (err) => {          
            const errorMessage = err?.error?.message || err?.message || err 
            ||  this.translate.instant('payroll.variable_deduction.toast.error_update')
            ;
            this.toast.error(errorMessage);
            this.isSubmitting = false;
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
        this.getFlexiBenefits();
           this.toast.success(
          this.translate.instant('payroll.flexi_benefits.toast.success_deleted'),
          this.translate.instant('payroll.flexi_benefits.title')
        );
      },
      error: (err) => {       
        const errorMessage = err?.error?.message || err?.message || err 
        ||  this.translate.instant('payroll.variable_deduction.toast.error_delete')
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
    this.getFlexiBenefits();
  }

  getFlexiBenefits() {
    const pagination = {
      skip: ((this.tableService.currentPage - 1) * this.tableService.recordsPerPage).toString(),
      next: this.tableService.recordsPerPage.toString()
    };
    this.payroll.getFlexiBenefits(pagination).subscribe((res: any) => {
      this.tableService.setData(res.data);
      this.allData = res.data;
      this.tableService.totalRecords = res.total;
    });
  }
}
