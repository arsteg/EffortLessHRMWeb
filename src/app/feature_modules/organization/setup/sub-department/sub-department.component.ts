import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { CompanyService } from 'src/app/_services/company.service';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';
import { TableColumn, ActionVisibility } from 'src/app/models/table-column';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-sub-department',
  templateUrl: './sub-department.component.html',
  styleUrl: './sub-department.component.css'
})
export class SubDepartmentComponent {
  @ViewChild('addModal') addModal: ElementRef;
  subDepartments: any;
  subDepartmentForm: FormGroup;
  closeResult: string;
  isEdit: boolean = false;
  searchText: string = '';
  selectedRecord: any;
  public sortOrder: string = '';
  isSubmitting: boolean = false;
  columns: TableColumn[] = [
    {
      key: 'subDepartmentCode',
      name: 'Sub Department Code'
    }, {
      key: 'subDepartmentName',
      name: 'Sub Department Name'
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
    this.subDepartmentForm = this.fb.group({
      subDepartmentName: ['', Validators.required],
      subDepartmentCode: ['', Validators.required],
    });
  }

  ngOnInit() {
    this.getSubDepartments();
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

  getSubDepartments() {
    this.companyService.getSubDepartments().subscribe(res => {
      this.subDepartments = res.data;
    });
  }

  onSubmission() {
    this.isSubmitting = true;
    this.subDepartmentForm.markAllAsTouched();

    // Prevent submission if form is invalid
    if (this.subDepartmentForm.invalid) {
      this.isSubmitting = false;
      return;
    }
    // add Department
    if (!this.isEdit) {
      this.companyService.addSubDepartments(this.subDepartmentForm.value).subscribe(res => {
        this.getSubDepartments();
        this.toast.success(this.translate.instant('organization.setup.Sub_department_added'));
        this.isSubmitting = false;     
        this.subDepartmentForm.reset();
      },
        err => {  const errorMessage = err?.error?.message || err?.message || err 
          || this.translate.instant('organization.setup.Sub_department_add_fail')
          ;
          this.toast.error(errorMessage, 'Error!');    this.isSubmitting = false; }
      );
    }
    // updateZone
    else if (this.isEdit) {
      this.companyService.updateSubDepartments(this.selectedRecord._id, this.subDepartmentForm.value).subscribe(res => {
        this.toast.success(this.translate.instant('organization.setup.Sub_department_updated'));
        this.getSubDepartments();
        this.subDepartmentForm.reset();
        this.isEdit = false;    this.isSubmitting = false;
        this.subDepartmentForm.get('subDepartmentCode').enable();
      },
        err => {  const errorMessage = err?.error?.message || err?.message || err 
          || this.translate.instant('organization.setup.Sub_department_update_fail')
          ;
          this.toast.error(errorMessage, 'Error!');    this.isSubmitting = false;  }
      );
    }
  }

  edit(data: any) {
    this.subDepartmentForm.patchValue({
      subDepartmentCode: data.subDepartmentCode,
      subDepartmentName: data.subDepartmentName
    });
    this.subDepartmentForm.get('subDepartmentCode').disable();
  }

  clearselectedRequest() {
    this.isEdit = false;
    this.subDepartmentForm.get('subDepartmentCode').enable();
    this.subDepartmentForm.reset();
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

  deleteSubDepartment(id: string) {
    this.companyService.deleteSubDepartments(id).subscribe((res: any) => {
      this.getSubDepartments();
      this.toast.success(this.translate.instant('organization.setup.sub_department_deleted'), this.translate.instant('toast.success'));
    },
      (err) => {
        const errorMessage = err?.error?.message || err?.message || err 
        || this.translate.instant('organization.setup.sub_department_delete_fail')
        ;
        this.toast.error(errorMessage, 'Error!');     })
  }

  deleteDialog(id: string): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'delete') {
        this.deleteSubDepartment(id);
      }
      err => {
        const errorMessage = err?.error?.message || err?.message || err 
        || this.translate.instant('organization.setup.sub_department_delete_fail')
        ;
        this.toast.error(errorMessage, 'Error!');  }
    });
  }

}
