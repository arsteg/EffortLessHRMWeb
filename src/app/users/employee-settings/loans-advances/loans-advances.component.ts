import { Component, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { PayrollService } from 'src/app/_services/payroll.service';
import { UserService } from 'src/app/_services/users.service';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-loans-advances',
  templateUrl: './loans-advances.component.html',
  styleUrl: './loans-advances.component.css'
})
export class UserLoansAdvancesComponent {
  isEdit: boolean = false;
  searchText: string = '';
  loansAdvances: any;
  closeResult: string = '';
  loansAdvancesForm: FormGroup;
  selectedUser = this.userService.getData();
  totalRecords: number
  recordsPerPage: number = 10;
  currentPage: number = 1;
  selectedRecord: any;
  loansAdvancesCategories: any;

  constructor(
    private modalService: NgbModal,
    private fb: FormBuilder,
    private userService: UserService,
    private payroll: PayrollService,
    private dialog: MatDialog,
    private toast: ToastrService
  ) {
    this.loansAdvancesForm = this.fb.group({
      user: ['', Validators.required],
      loanAdvancesCategory: ['', Validators.required],
      amount: [0, Validators.required],
      repaymentFrequency: ['', Validators.required]
    })
  }

  ngOnInit() {
    this.loadRecords();
  }

  deleteLoansAdvances(id: string): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'delete') {
        this.deleteLoansAdvance(id);
      } err => {
        this.toast.error('Can not be Deleted', 'Error!')
      }
    });
  }

  deleteLoansAdvance(id: string) {
    this.userService.deleteLoansAdvances(id).subscribe((res: any) => {
      this.loadRecords();
      this.toast.success('Successfully Deleted!!!', 'Loan/Advance')
    }, (err) => {
      this.toast.error('This Loan/Advance Can not be deleted!', 'Error!')
    })
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
    let payload = { skip: '', next: '' }
    this.payroll.getLoans(payload).subscribe((res: any) => {
      this.loansAdvancesCategories = res.data;
    })
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  edit() {
    this.loansAdvancesForm.patchValue(this.selectedRecord);
  }

  onSubmission() {
    if (!this.isEdit) {
      this.loansAdvancesForm.value.user = this.selectedUser.id;
      console.log(this.loansAdvancesForm.value);
      this.userService.addLoansAdvances(this.loansAdvancesForm.value).subscribe((res: any) => {
        console.log(res.data);
        this.loansAdvances.push(res.data);
        this.loansAdvancesForm.reset();
        this.toast.success('Successfully Added!!!', 'Loan/Advance')
      }, err => {
        this.toast.error('This Loan/Advance Can not be added!', 'Error!')
      })
    } else if (this.isEdit) {
      this.userService.updateLoansAdvances(this.selectedRecord._id, this.loansAdvancesForm.value).subscribe((res: any) => {
        const index = this.loansAdvances.findIndex(z => z._id === this.selectedRecord._id);
        if (index !== -1) {
          this.loansAdvances[index] = { ...this.selectedRecord, ...this.loansAdvancesForm.value };
        }
        this.isEdit = false;
        this.loansAdvancesForm.reset();
        this.toast.success('Successfully Updated!!!', 'Loan/Advance')
      }, err => {
        this.toast.error('This Loan/Advance Can not be Updated!', 'Error!')
      })
    }
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.loadRecords();
  }

  onRecordsPerPageChange(recordsPerPage: number) {
    this.recordsPerPage = recordsPerPage;
    this.loadRecords();
  }

  loadRecords() {
    const pagination = {
      skip: ((this.currentPage - 1) * this.recordsPerPage).toString(),
      next: this.recordsPerPage.toString()
    };
    this.userService.getLoansAdvancesByUserId(this.selectedUser.id, pagination).subscribe((res: any) => {
      this.loansAdvances = res.data;
      this.totalRecords = res.total;
    });

    let payload = { skip: '', next: '' }
    this.payroll.getLoans(payload).subscribe((res: any) => {
      this.loansAdvancesCategories = res.data;
    })
  }

  getRecord(categoryId: string) {
    const matchingRecord = this.loansAdvancesCategories?.find(rec => rec._id === categoryId);
    return matchingRecord?.name;
  }
}