import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { AuthenticationService } from 'src/app/_services/authentication.service';
import { PayrollService } from 'src/app/_services/payroll.service';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-flexi-benefits',
  templateUrl: './flexi-benefits.component.html',
  styleUrl: './flexi-benefits.component.css'
})
export class FlexiBenefitsComponent {
  closeResult: string;
  isEdit: boolean = false;
  selectedRecord: any;
  flexiBenefits: any;
  flexiBenefitsForm: FormGroup;
  searchText: string = '';
  totalRecords: number
  recordsPerPage: number = 10;
  currentPage: number = 1;
  currentUser = JSON.parse(localStorage.getItem('currentUser'));
  user: any;

  constructor(private modalService: NgbModal,
    private toast: ToastrService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private payroll: PayrollService,
    private auth: AuthenticationService
  ) {
    this.flexiBenefitsForm = this.fb.group({
      name: ['', Validators.required]      
    });
    
  }

  ngOnInit() {
    this.getFlexiBenefits();
  }

  clearForm() {
    this.flexiBenefitsForm.patchValue({
     name: ''
    })
  }
  open(content: any) {
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;

    }, (reason) => {

      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
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
  closeModal() {
    this.modalService.dismissAll();
  }

  onSubmission() {
  
    if (!this.isEdit) {
      this.payroll.addFlexiBenefits(this.flexiBenefitsForm.value).subscribe((res: any) => {
        this.flexiBenefits.push(res.data);
        this.toast.success('Successfully Added!!!', 'Flexi Benefits');
        this.flexiBenefitsForm.reset();
      },
        (err) => {
          this.toast.error('Flexi Benefits Can not be added', 'Flexi Benefits');
        })
    }
    else {
      this.payroll.updateFlexiBenefits(this.selectedRecord._id, this.flexiBenefitsForm.value).subscribe((res: any) => {
        this.toast.success('Successfully Updated!!!', 'Flexi Benefits');
        const reason = res.data;
        const index = this.flexiBenefits.findIndex(reas => reas._id === reason._id);
        if (index !== -1) {
          this.flexiBenefits[index] = reason;
        }
      },
        (err) => {
          this.toast.error('Flexi Benefits Can not be Updated', 'Flexi Benefits');
        })
    }
  }
  editRecord() {
    this.flexiBenefitsForm.patchValue(this.selectedRecord)
  }

  deleteRecord(_id: string) {
    this.payroll.deleteFlexiBenefits(_id).subscribe((res: any) => {
      const index = this.flexiBenefits.findIndex(res => res._id === _id);
      if (index !== -1) {
        this.flexiBenefits.splice(index, 1);
        this.totalRecords--;
      }
      this.toast.success('Successfully Deleted!!!', 'Flexi Benefits');
    },
      (err) => {
        this.toast.error('Flexi Benefits Can not be deleted', 'Flexi Benefits');
      })
  }

  deleteDialog(id: string): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'delete') {
        this.deleteRecord(id);
      }
    });
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.getFlexiBenefits();
  }

  onRecordsPerPageChange(recordsPerPage: number) {
    this.recordsPerPage = recordsPerPage;
    this.getFlexiBenefits();
  }

  getFlexiBenefits() {
    const pagination = {
      skip: ((this.currentPage - 1) * this.recordsPerPage).toString(),
      next: this.recordsPerPage.toString()
    };
    this.payroll.getFlexiBenefits(pagination).subscribe(res => {
      this.flexiBenefits = res.data;
      this.totalRecords = res.total;
    })
  }
}


