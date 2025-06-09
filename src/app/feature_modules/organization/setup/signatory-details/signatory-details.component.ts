import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
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
  closeResult: string;
  isEdit: boolean = false;
  searchText: string = '';
  selectedRecord: any;
  public sortOrder: string = '';
  columns: TableColumn[] = [
      {
        key: 'name',
        name: 'Name'
      }, {
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
      this.signatoryDetails = res.data;
    });
  }

  onSubmission() {
    // add Department
    if (!this.isEdit) {
      this.companyService.addSignatoryDetails(this.signatoryDetailForm.value).subscribe(res => {
        this.signatoryDetails.push(res.data);
        this.toast.success('Signatory Detail added successfully', 'Success');
        this.signatoryDetailForm.reset();
      },
        err => { this.toast.error('Signatory Detail Can not be Added', 'Error') }
      );
    }
    // updateZone
    else if (this.isEdit) {
      this.companyService.updateSignatoryDetails(this.selectedRecord._id, this.signatoryDetailForm.value).subscribe(res => {
        this.toast.success('Signatory Detail updated successfully', 'Success');
        const index = this.signatoryDetails.findIndex(z => z._id === this.selectedRecord._id);
        if (index !== -1) {
          this.signatoryDetails[index] = { ...this.selectedRecord, ...this.signatoryDetailForm.value };
        }
        this.signatoryDetailForm.reset();
        this.isEdit = false;
      },
        err => { this.toast.error('Signatory Detail Can not be Updated', 'Error') }
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

    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title',  backdrop: 'static' }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  deleteBand(id: string) {
    this.companyService.deleteSignatoryDetails(id).subscribe((res: any) => {
      this.getSignatoryDetails();
      this.toast.success('Successfully Deleted!!!', 'Signatory Detail')
    },
      (err) => {
        this.toast.error('This Signatory Detail Can not be deleted!', 'Error')
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
        this.toast.error('Can not be Deleted', 'Error!')
      }
    });
  }
}
