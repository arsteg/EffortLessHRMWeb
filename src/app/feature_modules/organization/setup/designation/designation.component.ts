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
  selector: 'app-designation',
  templateUrl: './designation.component.html',
  styleUrl: './designation.component.css'
})
export class DesignationComponent {
  @ViewChild('addModal') addModal: ElementRef;
  designations: any;
  designationForm: FormGroup;
  closeResult: string;
  isEdit: boolean = false;
  isSubmitting: boolean = false;
  searchText: string = '';
  selectedRecord: any;
  public sortOrder: string = '';
  totalRecords: number = 0;
  recordsPerPage: number = 10;
  currentPage: number = 1;
  dialogRef: MatDialogRef<any> | null = null;
  columns: TableColumn[] = [
    {
      key: 'designation',
      name: this.translate.instant('organization.designation.table.designation')
    },
    {
      key: 'action',
      name: 'Action',
      options: [
        {
          label: 'Edit',
          icon: 'edit',
          visibility: ActionVisibility.BOTH, // label | icon | both 
          cssClass: 'border-bottom',
        }, {
          label: 'Delete',
          icon: 'delete',
          visibility: ActionVisibility.BOTH,
          cssClass: 'text-danger'
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
    this.designationForm = this.fb.group({
      designation: ['', Validators.required],
    });
  }

  ngOnInit() {
    this.getDesignations();
  }

  getDesignations() {
    this.companyService.getDesignations().subscribe(res => {
      //this.designations = res.data;
      const data = Array.isArray(res.data) ? res.data : [];
      this.designations = [...data];
      this.totalRecords = data.length;
    });
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

  onSubmission() {
    this.isSubmitting = true;
    this.designationForm.markAllAsTouched();
    if (this.designationForm.invalid) {      
      this.toast.error('Please fill all required fields', 'Error!');
      return;
    }
    // Prevent submission if form is invalid
    if (this.designationForm.invalid) {
      this.isSubmitting = false;
      return;
    }
    // add Department
    if (!this.isEdit) {
      this.companyService.addDesignations(this.designationForm.value).subscribe(res => {
        this.getDesignations();
        this.toast.success(this.translate.instant('organization.setup.designation_deleted'));
        this.designationForm.reset();
        this.isSubmitting = false;
        this.dialogRef.close(true);
      },
        err => { 
           const errorMessage = err?.error?.message || err?.message || err 
          || this.translate.instant('organization.setup.designation_add_fail')
          ;
          this.toast.error(errorMessage, 'Error!'); this.isSubmitting = false; }
      );
    }
    // updateZone
    else if (this.isEdit) {
      this.companyService.updateDesignations(this.selectedRecord._id, this.designationForm.value).subscribe(res => {
        this.toast.success(this.translate.instant('organization.setup.designation_updated'));
        this.getDesignations();
        this.designationForm.reset(); this.isSubmitting = false;
        this.isEdit = false;
        this.dialogRef.close(true);
      },
        err => {   const errorMessage = err?.error?.message || err?.message || err 
          || this.translate.instant('organization.setup.designation_update_fail')
          ;
          this.toast.error(errorMessage, 'Error!'); this.isSubmitting = false; }
      );
    }
  }

  edit(data: any) {
    this.designationForm.patchValue({
      designation: data.designation,
    });
  }

  clearselectedRequest() {
    this.isEdit = false;
    this.designationForm.reset();
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

  deleteDesignation(id: string) {
    this.companyService.deleteDesignations(id).subscribe((res: any) => {
      this.getDesignations();
      this.toast.success(this.translate.instant('organization.setup.designation_updated'));
      
    },
      (err) => {
        const errorMessage = err?.error?.message || err?.message || err 
        || this.translate.instant('organization.setup.designation_delete_fail')
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
        this.deleteDesignation(id);
      }
      err => {
        const errorMessage = err?.error?.message || err?.message || err 
        || this.translate.instant('organization.setup.designation_delete_fail')
        ;
        this.toast.error(errorMessage, 'Error!'); 
      }
    });
  }

  onClose() {
    this.isEdit = false;
    this.designationForm.reset();
    this.dialogRef.close(true);
  }

  onPageChange(event: any) {
    this.currentPage = event.pageIndex + 1;
    this.recordsPerPage = event.pageSize;
    this.getDesignations();
  }

  onSearchChange(searchText: string) {
    this.searchText = searchText;
    this.currentPage = 1;
    this.designations.filter = searchText.trim().toLowerCase();
    this.totalRecords = this.designations.filteredData.length;
  }

}
