import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { CompanyService } from 'src/app/_services/company.service';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-sub-department',
  templateUrl: './sub-department.component.html',
  styleUrl: './sub-department.component.css'
})
export class SubDepartmentComponent {
  subDepartments: any;
  subDepartmentForm: FormGroup;
  closeResult: string;
  isEdit: boolean = false;
  searchText: string = '';
  selectedRecord: any;
  

  constructor(private companyService: CompanyService,
    private modalService: NgbModal,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private toast: ToastrService,
    ) {
    this.subDepartmentForm = this.fb.group({
      subDepartmentName: [''],
      subDepartmentCode: [''],
    });
  }

  ngOnInit() {
    this.getSubDepartments();
  }

  getSubDepartments() {
    this.companyService.getSubDepartments().subscribe(res => {
      this.subDepartments = res.data;
    });
  }

  onSubmission() {
    // add Department
    if (!this.isEdit) {
      this.companyService.addSubDepartments(this.subDepartmentForm.value).subscribe(res => {
        this.subDepartments.push(res.data);
        this.toast.success('Sub Department added successfully', 'Success');
        this.subDepartmentForm.reset();
      },
        err => { this.toast.error('Sub Department Can not be Added', 'Error') }
      );
    }
    // updateZone
    else if (this.isEdit) {
      this.companyService.updateSubDepartments(this.selectedRecord._id, this.subDepartmentForm.value).subscribe(res => {
        this.toast.success('Sub Department updated successfully', 'Success');
        const index = this.subDepartments.findIndex(z => z._id === this.selectedRecord._id);
        if (index !== -1) {
          this.subDepartments[index] = { ...this.selectedRecord, ...this.subDepartmentForm.value };
        }
        this.subDepartmentForm.reset();
        this.isEdit = false;
        this.subDepartmentForm.get('subDepartmentCode').enable();
      },
        err => { this.toast.error('SUb Department Can not be Updated', 'Error') }
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

    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  deleteSubDepartment(id: string) {
    this.companyService.deleteSubDepartments(id).subscribe((res: any) => {
      this.getSubDepartments();
      this.toast.success('Successfully Deleted!!!', 'Sub Department')
    },
      (err) => {
        this.toast.error('This Sub Department Can not be deleted!', 'Error')
      })
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
        this.toast.error('Can not be Deleted', 'Error!')
      }
    });
  }

}
