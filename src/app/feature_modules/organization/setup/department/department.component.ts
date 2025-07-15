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
  selector: 'app-department',
  templateUrl: './department.component.html',
  styleUrl: './department.component.css'
})
export class DepartmentComponent {
  @ViewChild('addModal') addModal: ElementRef;
  @ViewChild('subDepartment') subDepartment: ElementRef;
  
  departments: any;
  departmentForm: FormGroup;
  closeResult: string;
  isEdit: boolean = false;
  searchText: string = '';
  selectedRecord: any;
  public sortOrder: string = '';
  isSubmitting: boolean = false;
  totalRecords: number = 0;
  recordsPerPage: number = 10;
  currentPage: number = 1;
  dialogRef: MatDialogRef<any> | null = null;

  columns: TableColumn[] = [
    {
      key: 'departmentCode',
      name: this.translate.instant('organization.department.table.department_code')
    }, {
      key: 'departmentName',
      name: this.translate.instant('organization.department.table.department_name')
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
          cssClass: 'text-danger border-bottom'
        }
        // ,
        // {
        //   label: 'Assign Sub-Department',
        //   icon: '',
        //   visibility: ActionVisibility.LABEL
        // }
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
    this.departmentForm = this.fb.group({
      departmentName: ['', Validators.required],
      departmentCode: ['', Validators.required],
    });
  }

  ngOnInit() {
    this.getDepartments();
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

      case 'Assign Sub-Department':
        this.selectedRecord = event.row;
        this.isEdit = true;
        this.edit(event.row);
        this.open(this.subDepartment);
        break;
    }
  }

  getDepartments() {
    this.companyService.getDepartments().subscribe(res => {
      //this.departments = res.data;
      const data = Array.isArray(res.data) ? res.data : [];
        this.departments = [...data];
        this.totalRecords = data.length;
    });
  }

  onSubmission() {
    this.isSubmitting = true;

    this.departmentForm.markAllAsTouched();
  
    if (this.departmentForm.invalid) {
      this.isSubmitting = false;
      return;
    }
  
    // add Department
    if (!this.isEdit) {
      this.companyService.addDepartments(this.departmentForm.value).subscribe(res => {
        this.getDepartments();
        this.toast.success(this.translate.instant('organization.setup.department_added'));

        this.isSubmitting = false;
        this.departmentForm.reset();
        this.dialogRef.close(true);
      },
        err => { const errorMessage = err?.error?.message || err?.message || err 
          || this.translate.instant('organization.setup.department_add_fail')
          ;
          this.toast.error(errorMessage, 'Error!'); 
          this.isSubmitting = false;
        }
      );
    }
    // updateZone
    else if (this.isEdit) {
      this.companyService.updateDepartments(this.selectedRecord._id, this.departmentForm.value).subscribe(res => {
        this.toast.success(this.translate.instant('organization.setup.department_updated'));
        this.getDepartments();
        this.departmentForm.reset();
        this.isEdit = false;
        this.departmentForm.get('departmentCode').enable();
        this.isSubmitting = false;
        this.dialogRef.close(true);

      },
        err => { const errorMessage = err?.error?.message || err?.message || err 
          || this.translate.instant('organization.setup.department_update_fail')
          ;
          this.toast.error(errorMessage, 'Error!'); 
          this.isSubmitting = false;
        }
      );
    }
  }

  edit(data: any) {
    this.departmentForm.patchValue({
      departmentCode: data.departmentCode,
      departmentName: data.departmentName
    });
    this.departmentForm.get('departmentCode').disable();
  }

  clearselectedRequest() {
    this.isEdit = false;
    this.departmentForm.get('departmentCode').enable();
    this.departmentForm.reset();
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

  deleteDepartments(id: string) {
    this.companyService.deleteDepartments(id).subscribe((res: any) => {
      this.getDepartments();
      this.toast.success(this.translate.instant('organization.setup.department_deleted'));

    },
      (err) => {
        const errorMessage = err?.error?.message || err?.message || err 
        || this.translate.instant('organization.setup.department_delete_fail')
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
        this.deleteDepartments(id);
      }
      err => {
        const errorMessage = err?.error?.message || err?.message || err 
        || this.translate.instant('organization.setup.department_delete_fail')
        ;
        this.toast.error(errorMessage, 'Error!'); 
      }
    });
  }

  onClose() {
    this.isEdit = false;
    this.departmentForm.reset();
    this.dialogRef.close(true);
  }

  onPageChange(event: any) {
    this.currentPage = event.pageIndex + 1;
    this.recordsPerPage = event.pageSize;
    this.getDepartments();
  }

  onSearchChange(searchText: string) {
    this.searchText = searchText;
    this.currentPage = 1;
    this.departments.filter = searchText.trim().toLowerCase();
    this.totalRecords = this.departments.filteredData.length;
  }

}
