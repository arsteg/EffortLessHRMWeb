import { Component, Input } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { TaxationService } from 'src/app/_services/taxation.service';
import { ActionVisibility, TableColumn } from 'src/app/models/table-column';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';
import { CustomValidators } from 'src/app/_helpers/custom-validators';

@Component({
  selector: 'app-tax-section',
  templateUrl: './tax-section.component.html',
  styleUrl: './tax-section.component.css'
})
export class TaxSectionComponent {
  @Input() isEdit: boolean = false;
  searchText: string = '';
  closeResult: string = '';
  taxSectionForm: FormGroup;
  taxComponents: any;
  edit: boolean = false;
  selectedRecord: any;
  totalRecords: number
  recordsPerPage: number = 10;
  currentPage: number = 1;
  sections: any[];  
  isSubmitting: boolean = false;
  public sortOrder: string = '';
  columns: TableColumn[] = [
    {
      key: 'section', name: 'Section'
    },
    {
      key: 'action', name: 'Action', isAction: true, options: [
        { label: 'Edit', icon: 'edit', visibility: ActionVisibility.BOTH },
        { label: 'Delete', icon: 'delete', visibility: ActionVisibility.BOTH, cssClass: 'delete-btn' },
      ]
    }
  ];
  dialogRef!: MatDialogRef<any>;

  constructor(private modalService: NgbModal,
    private taxService: TaxationService,
    private toast: ToastrService,    
    private translate: TranslateService,
    private fb: FormBuilder,
    private dialog: MatDialog) {   
    this.taxSectionForm = this.fb.group({
      section: ['', [Validators.required, CustomValidators.noLeadingOrTrailingSpaces.bind(this)]],
      isHRA: [false],
      maximumAmount: ['0', [Validators.required, CustomValidators.digitsOnly]]
    })
    this.isEdit = false;
  }

  ngOnInit() {
    this.getAllsections();
  }

  onActionClick(event: any, modal: any) {
    switch (event.action.label) {
      case 'Edit':
        this.edit = true;
        this.selectedRecord = event.row;
        this.setFormValues(event.row);
        this.open(modal);
        break;
      case 'Delete':
        this.deleteDialog(event.row._id);
        break;
    }
  }

  open(content: any) {
    this.dialogRef = this.dialog.open(content, {
      width: '500px'
    });
    this.dialogRef.afterClosed().subscribe(result => {
      this.resetForm(); 
    })
  }
  resetForm() {
    this.taxSectionForm.reset({
      section: '',
      isHRA: false,
      maximumAmount: 0
    });
    this.isEdit = false;
    this.isSubmitting = false;   
    this.selectedRecord = null;
    this.getAllsections();
  }
  onSubmit() {
    this.isSubmitting = true;
    this.taxSectionForm.markAllAsTouched();
  
    if (this.taxSectionForm.invalid) {
      this.isSubmitting = false;
      this.toast.error('Please fill all required fields', 'Error!');
      return;
    }
    const formValue = this.taxSectionForm.value;
   
    if (!this.isEdit) {
      this.taxService.addTaxSection(formValue).subscribe((res: any) => {
        this.dialogRef.close();
        this.toast.success(this.translate.instant('taxation.tax_section_added'), this.translate.instant('taxation.toast.success'));
       
        this.resetForm(); 
       
      },
        err => {
          const errorMessage = err?.error?.message || err?.message || err 
        || this.translate.instant('taxation.tax_section_add_fail')
        ;
        this.toast.error(errorMessage, 'Error!'); 
        this.isSubmitting = false;        
        })
    }
    else if (this.isEdit) {
      this.taxService.updateTaxSection(this.selectedRecord._id, formValue).subscribe((res: any) => {       
        this.toast.success(this.translate.instant('taxation.tax_section_updated'), this.translate.instant('taxation.toast.success'));
        this.resetForm(); 
      },
        err => {
          const errorMessage = err?.error?.message || err?.message || err 
          || this.translate.instant('taxation.tax_section_update_fail')
          ;
          this.toast.error(errorMessage, 'Error!'); 
          this.isSubmitting = false;        
        })
    }
  }

  getAllsections() {
    this.taxService.getAllTaxSections().subscribe((res: any) => {
      this.sections = res.data;
    })
  }
  setFormValues(data) {
    this.isEdit = true;
    this.taxSectionForm.patchValue(data);
  }

  deleteRecord(id: string) {
    this.taxService.deleteTaxSection(id).subscribe((res: any) => {
      this.getAllsections();
      this.toast.success(this.translate.instant('taxation.deleted'), this.translate.instant('taxation.toast.success'));
    },
      (err) => {
        const errorMessage = err?.error?.message || err?.message || err 
        || this.translate.instant('taxation.delete_fail')
        ;
        this.toast.error(errorMessage, 'Error!');    
      })
  }

  deleteDialog(id: string): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'delete') {
        this.deleteRecord(id);
      }
      err => {
        const errorMessage = err?.error?.message || err?.message || err 
        || this.translate.instant('taxation.delete_fail')
        ;
        this.toast.error(errorMessage, 'Error!');        
      }
    });
  }
}
