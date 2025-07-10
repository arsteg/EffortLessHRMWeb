import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { CompanyService } from 'src/app/_services/company.service';
import { ActionVisibility, TableColumn } from 'src/app/models/table-column';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-signatory-details',
  templateUrl: './signatory-details.component.html',
  styleUrl: './signatory-details.component.css'
})
export class SignatoryDetailsComponent {
  @ViewChild('addModal') addModal: ElementRef;
  signatoryDetails: any;
  signatoryDetailForm: FormGroup;  
  isSubmitting: boolean = false;
  closeResult: string;
  isEdit: boolean = false;
  searchText: string = '';
  selectedRecord: any;
  public sortOrder: string = '';
  totalRecords: number = 0;
  recordsPerPage: number = 10;
  currentPage: number = 1;
  dialogRef: MatDialogRef<any> | null = null;
  columns: TableColumn[] = [
      {
        key: 'name',
         name: this.translate.instant('organization.signatory.table.name')
      }, {
        key: 'designation',
        name: this.translate.instant('organization.signatory.table.designation')
      },
      {
        key: 'action',
        name: 'Action',
        options: [
          {
            label: 'Edit',
            icon: 'edit',
            visibility: ActionVisibility.LABEL, // label | icon | both 
          }, {
            label: 'Delete',
            icon: 'delete',
            visibility: ActionVisibility.LABEL
          }
        ],
        isAction: true
      }
    ];

  constructor(private companyService: CompanyService,
    private modalService: NgbModal,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private translate: TranslateService,
    private toast: ToastrService,
    ) {
    this.signatoryDetailForm = this.fb.group({
      name: ['', Validators.required],
      designation: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.getSignatoryDetails();
  }

  onActionClick(event) {
    switch (event.action.label) {
      case 'Edit':
        this.selectedRecord = event.row;
        this.isEdit = true;
        this.edit(event.row);
        this.open(this.addModal);
        break;

      case 'Delete':
        this.deleteDialog(event.row?._id)
        break;
    }
  }

  getSignatoryDetails() {
    this.companyService.getSignatoryDetails().subscribe(res => {
      //this.signatoryDetails = res.data;
      const data = Array.isArray(res.data) ? res.data : [];
      this.signatoryDetails = [...data];
      this.totalRecords = data.length;
    });
  }

  onSubmission() {
    this.isSubmitting = true;

    this.signatoryDetailForm.markAllAsTouched();
  
    if (this.signatoryDetailForm.invalid) {
      this.isSubmitting = false;
      return;
    }
    // add Department
    if (!this.isEdit) {
      this.companyService.addSignatoryDetails(this.signatoryDetailForm.value).subscribe(res => {
        this.getSignatoryDetails();      
        this.toast.success(this.translate.instant('organization.setup.signatory_updated'));
          this.signatoryDetailForm.reset();
        this.isSubmitting = false;
        this.dialogRef.close(true);
      },
        err => { const errorMessage = err?.error?.message || err?.message || err 
          || this.translate.instant('organization.setup.signatory_update_fail')
          ;
          this.toast.error(errorMessage, 'Error!');
          this.isSubmitting = false; }
      );
    }
    // updateZone
    else if (this.isEdit) {
      this.companyService.updateSignatoryDetails(this.selectedRecord._id, this.signatoryDetailForm.value).subscribe(res => {
          this.toast.success(this.translate.instant('organization.setup.signatory_updated'));
        this.getSignatoryDetails();
        this.isSubmitting = false;
        this.signatoryDetailForm.reset();
        this.isEdit = false;
        this.dialogRef.close(true);
      },
        err => { 
          const errorMessage = err?.error?.message || err?.message || err 
          || this.translate.instant('organization.setup.signatory_update_fail')
          ;
          this.toast.error(errorMessage, 'Error!');
          this.isSubmitting = false;  }
      );
    }
  }

  edit(data: any) {
    this.signatoryDetailForm.patchValue({
     name: data.name,
     designation: data.designation
    });
  }

  clearselectedRequest() {
    this.isEdit = false;
    this.signatoryDetailForm.reset();
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }

  open(content: any) {
    this.dialogRef = this.dialog.open(content, {
      disableClose: true,
      width: '50%'
    });

    this.dialogRef.afterClosed().subscribe(result => {
      this.dialogRef = null;
    });
  }

  deleteBand(id: string) {
    this.companyService.deleteSignatoryDetails(id).subscribe((res: any) => {
      this.getSignatoryDetails();
      this.toast.success(this.translate.instant('organization.setup.signatory_deleted'));
    
    },
      (err) => {
        const errorMessage = err?.error?.message || err?.message || err 
        || this.translate.instant('organization.setup.signatory_delete_fail')
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
        this.deleteBand(id);
      }
      err => {
        const errorMessage = err?.error?.message || err?.message || err 
        || this.translate.instant('organization.setup.signatory_delete_fail')
        ;
        this.toast.error(errorMessage, 'Error!');
      }
    });
  }

  onClose() {
    this.isEdit = false;
    this.signatoryDetailForm.reset();
    this.dialogRef.close(true);
  }

  onPageChange(event: any) {
    this.currentPage = event.pageIndex + 1;
    this.recordsPerPage = event.pageSize;
    this.getSignatoryDetails();
  }

  onSearchChange(searchText: string) {
    this.searchText = searchText;
    this.currentPage = 1;
    this.signatoryDetails.filter = searchText.trim().toLowerCase();
    this.totalRecords = this.signatoryDetails.filteredData.length;
  }
}
