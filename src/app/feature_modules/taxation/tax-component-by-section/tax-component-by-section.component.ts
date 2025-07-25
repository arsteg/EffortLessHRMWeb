import { Component } from '@angular/core';
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
  selector: 'app-tax-component-by-section',
  templateUrl: './tax-component-by-section.component.html',
  styleUrls: ['./tax-component-by-section.component.css']
})
export class TaxComponentBySectionComponent {
  searchText: string = '';
  closeResult: string = '';
  taxComponentForm: FormGroup;
  taxComponents: any;
  edit: boolean = false;
  selectedRecord: any;
  totalRecords: number
  recordsPerPage: number = 10;
  currentPage: number = 1;
  isSubmitting: boolean = false;
  sections: any;
  public sortOrder: string = '';
  columns: TableColumn[] = [
    { key: 'componantName', name: 'Component Name' },
    { key: 'section', name: 'Section', valueFn: (row: any) => { return row?.section?.section } },
    { key: 'maximumAmount', name: 'Maximum Amount' },
    { key: 'order', name: 'Order' },
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
    private dialog: MatDialog
  ) {   
    this.taxComponentForm = this.fb.group({
      componantName: ['', [Validators.required, CustomValidators.noLeadingOrTrailingSpaces.bind(this)]],
      section:['', Validators.required],
      maximumAmount: ['0', [Validators.required, CustomValidators.digitsOnly]],
      order:  ['0', [Validators.required, CustomValidators.digitsOnly]]
    })
  }

  ngOnInit() {
    this.getTaxComponents();
    this.getAllSections();
  }

  onActionClick(event: any, modal: any) {
    switch (event.action.label) {
      case 'Edit':
        this.edit = true;
        this.selectedRecord = structuredClone(event.row);
        this.selectedRecord.section = this.selectedRecord.section._id;
        this.setFormValues(this.selectedRecord);
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
      this.taxComponentForm.reset();
    });
  }
  resetForm() {
    this.taxComponentForm.reset({
      section: '',
      componantName: '',
      maximumAmount: 0,
      order: 0
    });
    this.edit = false;
    this.isSubmitting = false;
    this.selectedRecord = null;    
    this.getTaxComponents();
  }
  onSubmission() {
    this.isSubmitting = true;
    this.taxComponentForm.markAllAsTouched();
    if (this.taxComponentForm.invalid) {
      this.isSubmitting = false;
      this.toast.error('Please fill all required fields', 'Error!');  return;
    }
    const formValue = this.taxComponentForm.value;
    if (!this.edit) {
      this.taxService.addTaxComponent(this.taxComponentForm.value).subscribe((res: any) => {       
        this.toast.success(this.translate.instant('taxation.tax_componant_added'), this.translate.instant('taxation.toast.success'));
        this.resetForm();
      },
        err => {
          const errorMessage = err?.error?.message || err?.message || err 
          || this.translate.instant('taxation.taxcomponant_add_fail')
          ;
          this.toast.error(errorMessage, 'Error!');         
          this.isSubmitting = false;
        })
    }
    else if (this.edit) {
      this.taxService.updateTaxComponent(this.selectedRecord._id, this.taxComponentForm.value).subscribe((res: any) => {           
        this.resetForm();
        this.toast.success(this.translate.instant('taxation.tax_componant_updated'), this.translate.instant('taxation.toast.success'));
      },
        err => {
          const errorMessage = err?.error?.message || err?.message || err 
          || this.translate.instant('taxation.tax_componant_update_fail')
          ;
          this.toast.error(errorMessage, 'Error!'); 
          this.isSubmitting = false;
        })
    }
  }
  onPageChange(page: any) {
    this.currentPage = page.pageIndex + 1;
    this.recordsPerPage = page.pageSize;
    this.getTaxComponents();
  }

  onRecordsPerPageChange(recordsPerPage: number) {
    this.recordsPerPage = recordsPerPage;
    this.getTaxComponents();
  }


  getTaxComponents() {
    const pagination = {
      skip: ((this.currentPage - 1) * this.recordsPerPage).toString(),
      next: this.recordsPerPage.toString()
    };
    this.taxService.getAllTaxComponents(pagination).subscribe((res: any) => {
      this.taxComponents = res.data;
      this.totalRecords = res.total;
    })
  }

  checkForHRARecord() {
    const formValue = this.taxComponentForm.value;

    if (formValue.section) {
      const selectedSection = this.taxComponents.find(section => section.section._id === formValue.section);

      if (selectedSection && selectedSection.section.isHRA) {
        const existingHRAComponent = this.taxComponents.some(component => component.section.isHRA);

        if (existingHRAComponent) {
          this.toast.error('HRA already exists! You cannot create multiple HRA Components.');
          return;
        }
      }
    }
  }

  setFormValues(data) {
    this.taxComponentForm.patchValue(data);
  }

  deleteRecord(id: string) {
    this.taxService.deleteTaxComponent(id).subscribe((res: any) => {
      this.getTaxComponents();
    
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

  getAllSections() {
    this.taxService.getAllTaxSections().subscribe((res: any) => {
      this.sections = res.data;
    })
  }
  getSection(sectionId: string) {
    const section = this.sections.find((section: any) => section._id === sectionId);
    return section ? section.section : '--';
  }
}