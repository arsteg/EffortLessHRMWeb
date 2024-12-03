import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { TaxationService } from 'src/app/_services/taxation.service';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-tax-components',
  templateUrl: './tax-components.component.html',
  styleUrl: './tax-components.component.css'
})
export class TaxComponentsComponent {
  searchText: string = '';
  closeResult: string = '';
  taxComponentForm: FormGroup;
  taxComponents: any;
  edit: boolean = false;
  selectedRecord: any;
  totalRecords: number
  recordsPerPage: number = 10;
  currentPage: number = 1;
  sections: any;
  public sortOrder: string = '';

  constructor(private modalService: NgbModal,
    private taxService: TaxationService,
    private toast: ToastrService,
    private fb: FormBuilder,
    private dialog: MatDialog
  ) {
    this.taxComponentForm = this.fb.group({
      componantName: [''],
      section: [''],
      maximumAmount: [0],
      order: [0]
    })
  }

  ngOnInit() {
    this.getTaxComponents();
    this.getAllSections();
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

  onSubmission() {
    if (!this.edit) {
      this.taxService.addTaxComponent(this.taxComponentForm.value).subscribe((res: any) => {
        this.taxComponents.push(res.data);
        this.toast.success('Tax component added successfully');
        this.taxComponentForm.reset();
      },
        err => {
          this.toast.error('Tax Component Can not be Created', 'Error');
        })
    }
    else if (this.edit) {
      this.taxService.updateTaxComponent(this.selectedRecord._id, this.taxComponentForm.value).subscribe((res: any) => {
        const index = this.taxComponents.findIndex(item => item._id === this.selectedRecord._id);
        if (index !== -1) {
          this.taxComponents[index] = res.data;
        }
        this.taxComponentForm.reset();
        this.edit = false;
        this.toast.success('Tax Component Updated', 'Successfully!');
      },
        err => {
          this.toast.error('Tax Component Can not be Updated', 'Error!');
        })
    }
  }
  onPageChange(page: number) {
    this.currentPage = page;
    this.getTaxComponents();
  }

  onRecordsPerPageChange(recordsPerPage: number) {
    this.recordsPerPage = recordsPerPage;
    this.getTaxComponents();
  }


  getTaxComponents() {
    const pagination = {
      skip: ((this.currentPage - 1) * this.recordsPerPage).toString(),
      next: this.recordsPerPage.toString()
    };
    this.taxService.getAllTaxComponents(pagination).subscribe((res: any) => {
      this.taxComponents = res.data;
      this.totalRecords = res.total;
    })
  }
  setFormValues(data) {
    this.taxComponentForm.patchValue(data);
  }

  deleteRecord(id: string) {
    this.taxService.deleteTaxComponent(id).subscribe((res: any) => {
      this.getTaxComponents();
      this.toast.success('Successfully Deleted!!!', 'Attendance Template')
    },
      (err) => {
        this.toast.error('This Attendance Template Can not be deleted'
          , 'Error')
      })
  }

  deleteDialog(id: string): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'delete') {
        this.deleteRecord(id);
      }
      err => {
        this.toast.error('Can not be Deleted', 'Error!')
      }
    });
  }

  getAllSections(){
    this.taxService.getAllTaxSections().subscribe((res: any) => {
      this.sections = res.data;
    })
  }
  getSection(sectionId: string) {
    const section = this.sections.find((section: any) => section._id === sectionId);
    return section ? section.section : '--';
  }
}