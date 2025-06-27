import { Component, Input } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { TaxationService } from 'src/app/_services/taxation.service';
import { ActionVisibility, TableColumn } from 'src/app/models/table-column';
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
  columns: TableColumn[] = [
    {
      key: 'section', name: 'Section'
    },
    {
      key: 'action', name: 'Action', isAction: true, options: [
        { label: 'Edit', icon: 'edit', visibility: ActionVisibility.BOTH },
        { label: 'Delete', icon: 'delete', visibility: ActionVisibility.BOTH, cssClass: 'delete-btn' },
      ]
    }
  ];
  dialogRef!: MatDialogRef<any>;

  constructor(private modalService: NgbModal,
    private taxService: TaxationService,
    private toast: ToastrService,
    private fb: FormBuilder,
    private dialog: MatDialog) {
    this.taxSectionForm = this.fb.group({
      section: [''],
      isHRA: [false],
      maximumAmount: [0]
    })
  }

  ngOnInit() {
    this.getAllsections();
  }

  onActionClick(event: any, modal: any) {
    switch (event.action.label) {
      case 'Edit':
        this.edit = true;
        this.selectedRecord = event.row;
        this.setFormValues(event.row);
        this.open(modal);
        break;
      case 'Delete':
        this.deleteDialog(event.row._id);
        break;
    }
  }

  open(content: any) {
    this.dialogRef = this.dialog.open(content, {
      width: '500px'
    });
    this.dialogRef.afterClosed().subscribe(result => {
      this.taxSectionForm.reset();
    })
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
        this.dialogRef.close();
        
        this.toast.success('Tax section added successfully');
        this.getAllsections();
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
