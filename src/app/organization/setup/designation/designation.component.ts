import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { CompanyService } from 'src/app/_services/company.service';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-designation',
  templateUrl: './designation.component.html',
  styleUrl: './designation.component.css'
})
export class DesignationComponent {
  designations: any;
  designationForm: FormGroup;
  closeResult: string;
  isEdit: boolean = false;
  searchText: string = '';
  selectedRecord: any;
  public sortOrder: string = '';

  constructor(private companyService: CompanyService,
    private modalService: NgbModal,
    private fb: FormBuilder,
    private dialog: MatDialog,
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

  onSubmission() {
    // add Department
    if (!this.isEdit) {
      this.companyService.addDesignations(this.designationForm.value).subscribe(res => {
        this.designations.push(res.data);
        this.toast.success('Designation added successfully', 'Success');
        this.designationForm.reset();
      },
        err => { this.toast.error('Designation Can not be Added', 'Error') }
      );
    }
    // updateZone
    else if (this.isEdit) {
      this.companyService.updateDesignations(this.selectedRecord._id, this.designationForm.value).subscribe(res => {
        this.toast.success('Designation updated successfully', 'Success');
        const index = this.designations.findIndex(z => z._id === this.selectedRecord._id);
        if (index !== -1) {
          this.designations[index] = { ...this.selectedRecord, ...this.designationForm.value };
        }
        this.designationForm.reset();
        this.isEdit = false;
      },
        err => { this.toast.error('Designation Can not be Updated', 'Error') }
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

    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title',  backdrop: 'static' }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  deleteDesignation(id: string) {
    this.companyService.deleteDesignations(id).subscribe((res: any) => {
      this.getDesignations();
      this.toast.success('Successfully Deleted!!!', 'Designation')
    },
      (err) => {
        this.toast.error('This Designation Can not be deleted!', 'Error')
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
        this.toast.error('Can not be Deleted', 'Error!')
      }
    });
  }

}
