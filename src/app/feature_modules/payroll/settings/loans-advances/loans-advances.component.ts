import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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
  selector: 'app-loans-advances',
  templateUrl: './loans-advances.component.html',
  styleUrls: ['./loans-advances.component.css']
})
export class LoansAdvancesComponent implements AfterViewInit {
  isEdit: boolean = false;
  selectedRecord: any;
  loansAdvancesForm: FormGroup;
  dialogRef: MatDialogRef<any>;
  sortOrder: string = '';
  currentUser = JSON.parse(localStorage.getItem('currentUser'));
  isSubmitting: boolean = false;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  columns: TableColumn[] = [
    { key: 'name', name: this.translate.instant('payroll.loans_advances.table.category_name') },
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
  allData: any = []

  constructor(
    private toast: ToastrService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private payroll: PayrollService,
    private translate: TranslateService,
    public tableService: TableService<any>
  ) {
    this.loansAdvancesForm = this.fb.group({
       name: ['', [Validators.required, CustomValidators.noNumbersOrSymbolsValidator, CustomValidators.noLeadingOrTrailingSpaces.bind(this)]],
    });

    // Set custom filter predicate to search by name
    this.tableService.setCustomFilterPredicate((data: any, filter: string) => {
      return data.name.toLowerCase().includes(filter);
    });
  }

  ngOnInit() {
    this.getLoanAdvances();
  }

  ngAfterViewInit() {
    this.tableService.initializeDataSource([]);
    this.getLoanAdvances();
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
    this.loansAdvancesForm.reset({
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
        this.getLoanAdvances();
      }
    });
  }

  closeModal() {
    this.dialogRef.close(true);
  }

  onSubmission() {
    this.markFormGroupTouched(this.loansAdvancesForm);
    this.isSubmitting = true;
    if (this.loansAdvancesForm.invalid) {
      this.toast.error(this.translate.instant('payroll.RequiredFieldAreMissing'), 'Error!');   
      this.isSubmitting = false;
      return;
    }
    if (this.loansAdvancesForm.valid) {
      if (!this.isEdit) {
        this.payroll.addLoans(this.loansAdvancesForm.value).subscribe({
          next: (res: any) => {
            this.getLoanAdvances();
            this.dialogRef.close(true);
            this.clearForm();
            this.toast.success(
              this.translate.instant('payroll.loans_advances.toast.success_added'),
              this.translate.instant('payroll.loans_advances.title')
            );
          },
          error: (err) => {           
            const errorMessage = err?.error?.message || err?.message || err 
            ||  this.translate.instant('payroll.loans_advances.toast.error_add')
            ;
            this.toast.error(errorMessage);
            this.isSubmitting = false;
          }
        });
      } else {
        this.payroll.updateLoans(this.selectedRecord._id, this.loansAdvancesForm.value).subscribe({
          next: (res: any) => {
            this.getLoanAdvances();  
            this.dialogRef.close(true);        
            this.clearForm();
            this.toast.success(
              this.translate.instant('payroll.loans_advances.toast.success_updated'),
              this.translate.instant('payroll.loans_advances.title')
            );
          },
          error: (err) => {           
            const errorMessage = err?.error?.message || err?.message || err 
            ||  this.translate.instant('payroll.loans_advances.toast.error_update')
            ;
            this.toast.error(errorMessage);
            this.isSubmitting = false;
          }
        });
      }
    } else {
      this.markFormGroupTouched(this.loansAdvancesForm);
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
    this.loansAdvancesForm.patchValue(this.selectedRecord);
  }

  deleteRecord(_id: string) {
    this.payroll.deleteLoans(_id).subscribe({
      next: (res: any) => {
        this.getLoanAdvances();
        this.toast.success(
          this.translate.instant('payroll.loans_advances.toast.success_deleted'),
          this.translate.instant('payroll.loans_advances.title')
        );
      },
      error: (err) => {        
        const errorMessage = err?.error?.message || err?.message || err 
        ||  this.translate.instant('payroll.loans_advances.toast.error_delete')
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
    this.getLoanAdvances();
  }

  getLoanAdvances() {
    const pagination = {
      skip: ((this.tableService.currentPage - 1) * this.tableService.recordsPerPage).toString(),
      next: this.tableService.recordsPerPage.toString()
    };
    this.payroll.getLoans(pagination).subscribe((res: any) => {
      this.tableService.setData(res.data);
      this.allData = res.data;
      this.tableService.totalRecords = res.total;
    });
  }
}