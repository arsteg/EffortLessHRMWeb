import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core'; // Import TranslateService
import { PayrollService } from 'src/app/_services/payroll.service';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';
import { ActionVisibility, TableColumn } from 'src/app/models/table-column';
import { CustomValidators } from 'src/app/_helpers/custom-validators';

@Component({
  selector: 'app-contribution',
  templateUrl: './contribution.component.html',
  styleUrl: './contribution.component.css'
})
export class ContributionComponent {
  searchText: string = '';
  totalRecords: number;
  recordsPerPage: number = 10;
  currentPage: number = 1;
  isEdit = false;
  closeResult: string = '';
  selectedRecord: any;
  contribution: any;
  contributionForm: FormGroup;
  allData: any;
  dialogRef: MatDialogRef<any>;
  isSubmitting: boolean = false;
  columns: TableColumn[] = [
    { key: 'employeePercentage', name: this.translate.instant('payroll.employee_percentage') },
    { key: 'employerPercentage', name: this.translate.instant('payroll.employer_percentage') },
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
    private translate: TranslateService // Inject TranslateService
  ) {
    this.contributionForm = this.fb.group({
      employeePercentage:  ['', [Validators.required, CustomValidators.GreaterThanZeroValidator()]],
      employerPercentage: ['', [Validators.required, CustomValidators.GreaterThanZeroValidator()]],
    });
  }

  ngOnInit(): void {
    this.getContribution();
  }

  onSearch(search: any) {
    this.contribution = this.allData?.filter(row => {
      const found = this.columns.some(col => {
        return row[col.key]?.toString().toLowerCase().includes(search.toLowerCase());
      });
      return found;
    });
  }


  onPageChange(page: any) {
    this.currentPage = page.pageIndex;
    this.recordsPerPage = page.pageSize
    this.getContribution();
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

  getContribution() {
    const pagination = {
      skip: ((this.currentPage - 1) * this.recordsPerPage).toString(),
      next: this.recordsPerPage.toString()
    };
    this.payroll.getContribution(pagination).subscribe(res => {
      this.contribution = res.data;
      this.allData = res.data;
      this.totalRecords = res.total;
    });
  }

  open(content: any) {
    this.dialogRef = this.dialog.open(content, {width: '500px'});
  }

  closeModal() {
    this.modalService.dismissAll();    
  }

  onSubmission() {
    this.isSubmitting = true;
    if (this.contributionForm.invalid) {            
      this.contributionForm.markAllAsTouched();  // This triggers validation errors
      this.toast.error(this.translate.instant('payroll.RequiredFieldAreMissing'), 'Error!');
      this.isSubmitting = false;
      return;
    }
    if (!this.isEdit) {
      this.payroll.addContribution(this.contributionForm.value).subscribe(
        (res: any) => {     
          this.toast.success(
          this.translate.instant('payroll.toast.success_added')
        );
       
          this.getContribution();
          this.clearForm();
          this.dialogRef.close();
        },
        (err) => {          
          const errorMessage = err?.error?.message || err?.message || err 
          ||  this.translate.instant('payroll.toast.error_add')
          ;
          this.toast.error(errorMessage);
          this.isSubmitting = false;
          this.dialogRef.close();
        }
      );
    } else {
      this.payroll.updateContribution(this.selectedRecord._id, this.contributionForm.value).subscribe(
        (res: any) => {         
          this.toast.success(
            this.translate.instant('payroll.toast.success_updated')
          );        
          this.getContribution();
          this.clearForm();
          this.dialogRef.close();
        },
        (err) => {       
          const errorMessage = err?.error?.message || err?.message || err 
        ||  this.translate.instant('payroll.toast.error_update')
        ;
        this.toast.error(errorMessage);      
          this.isSubmitting = false;
          this.dialogRef.close();
        }
      );
    }
  }

  editRecord() {
    this.contributionForm.patchValue(this.selectedRecord);
  }

  clearForm() {
    this.contributionForm.patchValue({
      employeePercentage: '',
      employerPercentage: '',
    });
      this.isSubmitting = false;
  }

  deleteRecord(_id: string) {
    this.payroll.deleteContribution(_id).subscribe(
      (res: any) => {       
        this.toast.success(
          this.translate.instant('payroll.toast.success_deleted')
        );
        this.getContribution();
      },
      (err) => {       
        const errorMessage = err?.error?.message || err?.message || err 
        ||  this.translate.instant('payroll.toast.error_delete')
        ;
        this.toast.error(errorMessage);
      }
    );
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