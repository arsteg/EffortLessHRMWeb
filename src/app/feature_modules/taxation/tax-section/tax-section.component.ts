import { Component, Input } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { TaxationService } from 'src/app/_services/taxation.service';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-tax-section',
  templateUrl: './tax-section.component.html',
  styleUrl: './tax-section.component.css'
})
export class TaxSectionComponent {
  @Input() isEdit: boolean = false;
  searchText: string = '';
  closeResult: string = '';
  taxSectionForm: FormGroup;
  taxComponents: any;
  edit: boolean = false;
  selectedRecord: any;
  totalRecords: number
  recordsPerPage: number = 10;
  currentPage: number = 1;
  sections: any[];
  public sortOrder: string = '';

  constructor(private modalService: NgbModal,
    private taxService: TaxationService,
    private toast: ToastrService,
    private fb: FormBuilder,
    private dialog: MatDialog) {
    this.taxSectionForm = this.fb.group({
      section: [''],
      isHRA: [false]
    })
  }

  ngOnInit() {
    this.getAllsections();
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

  onSubmit() {
    const formValue = this.taxSectionForm.value;

    // Check if the section is marked as HRA
    if (formValue.isHRA) {
      const hraSection = this.sections.find(section => section.isHRA);
      if (hraSection) {
        this.toast.error('HRA already exists! You cannot create multiple HRA sections.');
        return;
      }
    }

    if (!this.isEdit) {
      this.taxService.addTaxSection(formValue).subscribe((res: any) => {
        this.sections.push(res.data);
        this.taxSectionForm.reset({
          section: '',
          isHRA: false
        });
        this.toast.success('Tax section added successfully');
      },
        err => {
          this.toast.error('Tax Section Can not be Created', 'Error');
        })
    }
    else if (this.isEdit) {
      this.taxService.updateTaxSection(this.selectedRecord._id, formValue).subscribe((res: any) => {
        this.toast.success('Tax section updated successfully');
        this.isEdit = false;
        this.taxSectionForm.reset();
        this.getAllsections();
      },
        err => {
          this.toast.error('Tax Section Can not be Updated', 'Error');
        })
    }
  }

  getAllsections() {
    this.taxService.getAllTaxSections().subscribe((res: any) => {
      this.sections = res.data;
    })
  }
  setFormValues(data) {
    this.isEdit = true;
    this.taxSectionForm.patchValue(data);
  }

  deleteRecord(id: string) {
    this.taxService.deleteTaxSection(id).subscribe((res: any) => {
      this.getAllsections();
      this.toast.success('Successfully Deleted!!!', 'Tax Section')
    },
      (err) => {
        this.toast.error('This Tax Section Can not be deleted'
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
}
