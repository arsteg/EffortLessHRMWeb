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
  selector: 'app-band',
  templateUrl: './band.component.html',
  styleUrl: './band.component.css'
})
export class BandComponent {
  @ViewChild('addModal') addModal: ElementRef;
  bands: any;
  bandForm: FormGroup;
  closeResult: string;
  isEdit: boolean = false;
  searchText: string = '';  
  isSubmitting: boolean = false;
  selectedRecord: any;
  public sortOrder: string = '';
  totalRecords: number = 0;
  recordsPerPage: number = 10;
  currentPage: number = 1;
  dialogRef: MatDialogRef<any> | null = null;
  columns: TableColumn[] = [
    {
      key: 'band',
      name: this.translate.instant('organization.band.table.band')
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
    private toast: ToastrService,
    private translate: TranslateService,
  ) {
    this.bandForm = this.fb.group({
      band: ['', Validators.required],
    });
  }

  ngOnInit() {
    this.getBands();
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

  getBands() {
    this.companyService.getBand().subscribe(res => {
      //this.bands = res.data;
      const data = Array.isArray(res.data) ? res.data : [];
      this.bands = [...data];
      this.totalRecords = data.length;
    });
  }

  onSubmission() {
    this.isSubmitting = true;

    this.bandForm.markAllAsTouched();
  
    if (this.bandForm.invalid) {
      this.isSubmitting = false;
      return;
    }
  
    // add Department
    if (this.bandForm.valid) {
      if (!this.isEdit) {
        this.companyService.addBand(this.bandForm.value).subscribe(res => {
          this.getBands();
          this.toast.success(this.translate.instant('organization.setup.band_added'));
          this.isSubmitting = false;
          this.bandForm.reset();
          this.dialogRef.close(true);
        },
          err => { const errorMessage = err?.error?.message || err?.message || err 
            || this.translate.instant('organization.setup.band_update_fail')
            ;
            this.toast.error(errorMessage, 'Error!');
            this.isSubmitting = false;  }
        );
      }
      // updateZone
      else if (this.isEdit) {
        this.companyService.updateBand(this.selectedRecord._id, this.bandForm.value).subscribe(res => {
          this.toast.success(this.translate.instant('organization.setup.band_updated'));
      
          this.getBands();
          this.bandForm.reset();
          this.isSubmitting = false;
          this.isEdit = false;
          this.dialogRef.close(true);
        },
          err => {  const errorMessage = err?.error?.message || err?.message || err 
            || this.translate.instant('organization.setup.band_update_fail')
            ;
            this.toast.error(errorMessage, 'Error!');
            this.isSubmitting = false;  }
        );
      }
    }
    else {
      this.bandForm.markAllAsTouched();
    }
  }

  edit(data: any) {
    this.bandForm.patchValue({
      band: data.band,
    });
  }

  clearselectedRequest() {
    this.isEdit = false;
    this.bandForm.reset();
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
    this.companyService.deleteBand(id).subscribe((res: any) => {
      this.getBands();
      this.toast.success(this.translate.instant('organization.setup.band_deleted'));
      
    },
      (err) => {
        const errorMessage = err?.error?.message || err?.message || err 
        || this.translate.instant('organization.setup.band_delete_fail')
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
        || this.translate.instant('organization.setup.band_delete_fail')
        ;
        this.toast.error(errorMessage, 'Error!'); 
      }
    });
  }

  onClose() {
    this.isEdit = false;
    this.bandForm.reset();
    this.dialogRef.close(true);
  }

  onPageChange(event: any) {
    this.currentPage = event.pageIndex + 1;
    this.recordsPerPage = event.pageSize;
    this.getBands();
  }

  onSearchChange(searchText: string) {
    this.searchText = searchText;
    this.currentPage = 1;
    this.bands.filter = searchText.trim().toLowerCase();
    this.totalRecords = this.bands.filteredData.length;
  }
}
