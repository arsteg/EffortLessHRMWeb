import { Component, Input, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
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
  totalRecords: number;
  recordsPerPage: number = 10;
  currentPage: number = 1;
  selectedRecord: any;
  loansAdvancesCategories: any;
  public sortOrder: string = '';

  @ViewChild('dialogTemplate') dialogTemplate: TemplateRef<any>;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private payroll: PayrollService,
    private dialog: MatDialog,
    private toast: ToastrService
  ) {
    this.loansAdvancesForm = this.fb.group({
      user: ['', Validators.required],
      loanAdvancesCategory: ['', Validators.required],
      amount: [{ value: 0, disabled: true }, Validators.required],
      noOfInstallment: [0, Validators.required],
      monthlyInstallment: [0, Validators.required]
    });
    this.loansAdvancesForm.get('amount').disable();
    this.loansAdvancesForm.get('noOfInstallment').valueChanges.subscribe(() => {
      this.calculateTotalAmount();
    });

    this.loansAdvancesForm.get('monthlyInstallment').valueChanges.subscribe(() => {
      this.calculateTotalAmount();
    });
  }

  ngOnInit() {
    this.loadRecords();
  }

  calculateTotalAmount() {
    const noOfInstallment = this.loansAdvancesForm.get('noOfInstallment').value;
    const monthlyInstallment = this.loansAdvancesForm.get('monthlyInstallment').value;
    const totalAmount = noOfInstallment * monthlyInstallment;
    this.loansAdvancesForm.get('amount').setValue(totalAmount, { emitEvent: false });
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

  openDialog() {
    let payload = { skip: '', next: '' }
    this.payroll.getLoans(payload).subscribe((res: any) => {
      this.loansAdvancesCategories = res.data;
    });
    this.dialog.open(this.dialogTemplate, {
      width: '600px',
      disableClose: true
    });
  }

  edit() {
    this.loansAdvancesForm.patchValue(this.selectedRecord);
  }

  onSubmission() {
    this.loansAdvancesForm.patchValue({ user: this.selectedUser._id });
    if (!this.isEdit) {
      this.loansAdvancesForm.get('amount').enable();
      this.userService.addLoansAdvances(this.loansAdvancesForm.value).subscribe((res: any) => {
        this.loadRecords();
        this.loansAdvancesForm.reset();
        this.toast.success('Successfully Added!!!', 'Loan/Advance')
      }, err => {
        this.toast.error('This Loan/Advance Can not be added!', 'Error!')
      })
    } else if (this.isEdit) {
      this.loansAdvancesForm.get('amount').enable();
      this.userService.updateLoansAdvances(this.selectedRecord._id, this.loansAdvancesForm.value).subscribe((res: any) => {
        this.loadRecords();
        this.isEdit = false;
        this.loansAdvancesForm.reset();
        this.toast.success('Successfully Updated!!!', 'Loan/Advance')
      }, err => {
        this.toast.error('This Loan/Advance Can not be Updated!', 'Error!')
      })
    }
    this.loansAdvancesForm.get('amount').disable();
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
    this.userService.getLoansAdvancesByUserId(this.selectedUser._id, pagination).subscribe((res: any) => {
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