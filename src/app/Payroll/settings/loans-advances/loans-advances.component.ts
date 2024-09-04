import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { AuthenticationService } from 'src/app/_services/authentication.service';
import { PayrollService } from 'src/app/_services/payroll.service';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-loans-advances',
  templateUrl: './loans-advances.component.html',
  styleUrl: './loans-advances.component.css'
})
export class LoansAdvancesComponent {
  closeResult: string;
  isEdit: boolean = false;
  selectedRecord: any;
  loans: any;
  loansAdvancesForm: FormGroup;
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
    this.loansAdvancesForm = this.fb.group({
      name: ['', Validators.required]      
    });
    
  }

  ngOnInit() {
    this.getLoanAdvances();
  }

  clearForm() {
    this.loansAdvancesForm.patchValue({
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
      this.payroll.addLoans(this.loansAdvancesForm.value).subscribe((res: any) => {
        this.loans.push(res.data);
        this.toast.success('Successfully Added!!!', 'Loans/Advances');
        this.loansAdvancesForm.reset();
      },
        (err) => {
          this.toast.error('Loans/Advances Can not be added', 'Loans/Advances');
        })
    }
    else {
      this.payroll.updateLoans(this.selectedRecord._id, this.loansAdvancesForm.value).subscribe((res: any) => {
        const reason = res.data;
        const index = this.loans.findIndex(reas => reas._id === reason._id);
        if (index !== -1) {
          this.loans[index] = reason;
        }
        this.toast.success('Successfully Updated!!!', 'Loans/Advances');
        this.loansAdvancesForm.reset();
      },
        (err) => {
          this.toast.error('Loans/Advances Can not be Updated', 'Loans/Advances');
        })
    }
  }
  editRecord() {
    this.loansAdvancesForm.patchValue(this.selectedRecord)
  }

  deleteRecord(_id: string) {
    this.payroll.deleteLoans(_id).subscribe((res: any) => {
      const index = this.loans.findIndex(res => res._id === _id);
      if (index !== -1) {
        this.loans.splice(index, 1);
        this.totalRecords--;
      }
      this.toast.success('Successfully Deleted!!!', 'Loans/Advances');
    },
      (err) => {
        this.toast.error('Loans/Advances Can not be deleted', 'Loans/Advances');
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
    this.getLoanAdvances();
  }

  onRecordsPerPageChange(recordsPerPage: number) {
    this.recordsPerPage = recordsPerPage;
    this.getLoanAdvances();
  }

  getLoanAdvances() {
    const pagination = {
      skip: ((this.currentPage - 1) * this.recordsPerPage).toString(),
      next: this.recordsPerPage.toString()
    };
    this.payroll.getLoans(pagination).subscribe(res => {
      this.loans = res.data;
      this.totalRecords = res.total;
    })
  }
}

