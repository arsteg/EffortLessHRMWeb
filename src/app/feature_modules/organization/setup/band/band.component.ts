import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
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
  selectedRecord: any;
  public sortOrder: string = '';
  columns: TableColumn[] = [
    {
      key: 'band',
      name: 'Band'
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
      this.bands = res.data;
    });
  }

  onSubmission() {
    // add Department
    if (this.bandForm.valid) {
      if (!this.isEdit) {
        this.companyService.addBand(this.bandForm.value).subscribe(res => {
          this.bands.push(res.data);
          this.toast.success('Band added successfully', 'Success');
          this.bandForm.reset();
        },
          err => { this.toast.error('Band Can not be Added', 'Error') }
        );
      }
      // updateZone
      else if (this.isEdit) {
        this.companyService.updateBand(this.selectedRecord._id, this.bandForm.value).subscribe(res => {
          this.toast.success('Band updated successfully', 'Success');
          const index = this.bands.findIndex(z => z._id === this.selectedRecord._id);
          if (index !== -1) {
            this.bands[index] = { ...this.selectedRecord, ...this.bandForm.value };
          }
          this.bandForm.reset();
          this.isEdit = false;
        },
          err => { this.toast.error('Band Can not be Updated', 'Error') }
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

    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', backdrop: 'static' }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  deleteBand(id: string) {
    this.companyService.deleteBand(id).subscribe((res: any) => {
      this.getBands();
      this.toast.success('Successfully Deleted!!!', 'Band')
    },
      (err) => {
        this.toast.error('This Band Can not be deleted!', 'Error')
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
