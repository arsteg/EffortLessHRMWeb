import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
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

  columns: TableColumn[] = [
    {
      key: 'departmentCode',
      name: 'Department Code'
    }, {
      key: 'departmentName',
      name: 'Department Name'
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
        },
        {
          label: 'Assign Sub-Department',
          icon: '',
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
      this.departments = res.data;
    });
  }

  onSubmission() {
    // add Department
    if (!this.isEdit) {
      this.companyService.addDepartments(this.departmentForm.value).subscribe(res => {
        this.departments.push(res.data);
        this.toast.success('Department added successfully', 'Success');
        this.departmentForm.reset();
      },
        err => { this.toast.error('Department Can not be Added', 'Error') }
      );
    }
    // updateZone
    else if (this.isEdit) {
      this.companyService.updateDepartments(this.selectedRecord._id, this.departmentForm.value).subscribe(res => {
        this.toast.success('Department updated successfully', 'Success');
        const index = this.departments.findIndex(z => z._id === this.selectedRecord._id);
        if (index !== -1) {
          this.departments[index] = { ...this.selectedRecord, ...this.departmentForm.value };
        }
        this.departmentForm.reset();
        this.isEdit = false;
        this.departmentForm.get('departmentCode').enable();

      },
        err => { this.toast.error('Department Can not be Updated', 'Error') }
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

    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', backdrop: 'static' }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  deleteDepartments(id: string) {
    this.companyService.deleteDepartments(id).subscribe((res: any) => {
      this.getDepartments();
      this.toast.success('Successfully Deleted!!!', 'Department')
    },
      (err) => {
        this.toast.error('This Department Can not be deleted!', 'Error')
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
        this.toast.error('Can not be Deleted', 'Error!')
      }
    });
  }

}
