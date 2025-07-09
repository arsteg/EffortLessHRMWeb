import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
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
  columns: TableColumn[] = [
    {
      key: 'designation',
      name: 'Designation'
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
      this.designations = res.data;
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

    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', backdrop: 'static' }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
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

}
