import { Component, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidatorFn } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { PayrollService } from 'src/app/_services/payroll.service';
import { UserService } from 'src/app/_services/users.service';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-loans-advances',
  templateUrl: './loans-advances.component.html',
  styleUrls: ['./loans-advances.component.css']
})
export class UserLoansAdvancesComponent {
  isEdit: boolean = false;
  searchText: string = '';
  loansAdvances: any;
  loansAdvancesForm: FormGroup;
  selectedUser: any;
  totalRecords: number = 0;
  recordsPerPage: number = 10;
  currentPage: number = 1;
  selectedRecord: any;
  loansAdvancesCategories: any;
  annualSalary: number = 0;
  selectedUserSalary: any;
  @ViewChild('dialogTemplate') dialogTemplate: TemplateRef<any>;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private payroll: PayrollService,
    private dialog: MatDialog,
    private toast: ToastrService,
    private router: Router
  ) {
    this.loansAdvancesForm = this.fb.group({
      user: ['', Validators.required],
      loanAdvancesCategory: ['', Validators.required],
      amount: [{ value: 0, disabled: true }, Validators.required],
      noOfInstallment: [0, [Validators.required, Validators.min(1), Validators.max(36)]],
      monthlyInstallment: [0, [Validators.required, Validators.min(100)]]
    }, {
      validators: this.validateLoanConstraints(() => this.annualSalary)
    });

    this.loansAdvancesForm.get('noOfInstallment').valueChanges.subscribe(() => {
      this.calculateTotalAmount();
      this.loansAdvancesForm.updateValueAndValidity();
    });

    this.loansAdvancesForm.get('monthlyInstallment').valueChanges.subscribe(() => {
      this.calculateTotalAmount();
      this.loansAdvancesForm.updateValueAndValidity();
    });
  }

  ngOnInit() {
    this.logUrlSegmentsForUser();
  }

  validateLoanConstraints(getSalary: () => number): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const noOfInstallment = control.get('noOfInstallment')?.value;
      const monthlyInstallment = control.get('monthlyInstallment')?.value;
      const total = noOfInstallment * monthlyInstallment;
      const annualSalary = getSalary();
      const monthlySalary = annualSalary / 12;

      const errors: { [key: string]: any } = {};
      if (total > annualSalary) {
        errors['exceedSalary'] = true;
      }

      if (monthlyInstallment > monthlySalary * 0.5) {
        errors['highEMI'] = true;
        control.get('monthlyInstallment')?.setErrors({ highEMI: true });
      } else {
        const monthlyInstallmentControl = control.get('monthlyInstallment');
        if (monthlyInstallmentControl?.errors?.['highEMI']) {
          const { highEMI, ...otherErrors } = monthlyInstallmentControl.errors;
          monthlyInstallmentControl.setErrors(Object.keys(otherErrors).length ? otherErrors : null);
        }
      }

      return Object.keys(errors).length ? errors : null;
    };
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
      } else {
        this.toast.error('Deletion cancelled', 'Info');
      }
    }, err => {
      this.toast.error('Cannot be deleted', 'Error!');
    });
  }

  deleteLoansAdvance(id: string) {
    this.userService.deleteLoansAdvances(id).subscribe(
      (res: any) => {
        this.loadRecords();
        this.toast.success('Successfully Deleted!!!', 'Loan/Advance');
      },
      (err) => {
        const errorMessage = err?.error?.message || err?.message || 'Something went wrong.';
        this.toast.error(errorMessage, 'Error!');
      }
    );
  }

  openDialog() {
    const payload = { skip: '', next: '' };
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
    this.loansAdvancesForm.patchValue({ user: this.selectedUser[0].id });

    let monthlyInstallment = this.loansAdvancesForm.get('monthlyInstallment').value;
    const monthlySalary = this.annualSalary / 12;
    let noOfInstallment = this.loansAdvancesForm.get('noOfInstallment').value;

    if (monthlyInstallment > monthlySalary * 0.5) {
      const maxEMI = monthlySalary * 0.5;
      const totalAmount = monthlyInstallment * noOfInstallment;
      noOfInstallment = Math.ceil(totalAmount / maxEMI);
      if (noOfInstallment > 36) {
        this.toast.error('Cannot adjust EMI: Required installments exceed maximum of 36.', 'Error');
        return;
      }
      this.loansAdvancesForm.get('noOfInstallment').setValue(noOfInstallment);
      this.calculateTotalAmount();
      this.toast.warning(`Number of installments increased to ${noOfInstallment} to keep EMI affordable.`);
    }

    this.loansAdvancesForm.get('amount').enable();
    if (this.loansAdvancesForm.valid) {
      if (!this.isEdit) {
        this.userService.addLoansAdvances(this.loansAdvancesForm.value).subscribe(
          (res: any) => {
            this.loadRecords();
            this.loansAdvancesForm.reset();
            this.dialog.closeAll();
            this.toast.success('Successfully Added!!!', 'Loan/Advance');
          },
          (err) => {
            const errorMessage = err?.error?.message || err?.message || 'Something went wrong.';
            this.toast.error(errorMessage, 'Error!');
          }
        );
      } else {
        this.userService.updateLoansAdvances(this.selectedRecord._id, this.loansAdvancesForm.value).subscribe(
          (res: any) => {
            this.loadRecords();
            this.isEdit = false;
            this.loansAdvancesForm.reset();
            this.dialog.closeAll();
            this.toast.success('Successfully Updated!!!', 'Loan/Advance');
          },
          (err) => {
            const errorMessage = err?.error?.message || err?.message || 'Something went wrong.';
            this.toast.error(errorMessage, 'Error!');
          }
        );
      }
    }
    this.loansAdvancesForm.get('amount').disable();
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.loadRecords();
  }

  onRecordsPerPageChange(recordsPerPage: number) {
    this.recordsPerPage = recordsPerPage;
    this.currentPage = 1;
    this.loadRecords();
  }

  logUrlSegmentsForUser() {
    const urlPath = this.router.url;
    const segments = urlPath.split('/').filter(segment => segment);
    if (segments.length >= 3) {
      const employee = segments[segments.length - 3];
      this.userService.getUserByEmpCode(employee).subscribe((res: any) => {
        this.selectedUser = res.data;
        forkJoin([
          this.userService.getSalaryByUserId(this.selectedUser[0].id),
          this.userService.getLoansAdvancesByUserId(this.selectedUser[0].id, {
            skip: '0',
            next: this.recordsPerPage.toString(),
          }),
          this.payroll.getLoans({ skip: '', next: '' })
        ]).subscribe((results: any[]) => {
          this.selectedUserSalary = results[0].data[results[0].data.length - 1];
          this.annualSalary = this.selectedUserSalary?.Amount || 0;
          this.loansAdvances = results[1].data;
          this.annualSalary = this.selectedUserSalary?.Amount || 0;
          this.loansAdvances = results[1].data;
          this.totalRecords = results[1].total;
          this.loansAdvancesCategories = results[2].data;
          this.loansAdvancesForm.setValidators(this.validateLoanConstraints(() => this.annualSalary));
          this.loansAdvancesForm.updateValueAndValidity();
        }, err => {
          this.toast.error('Failed to load user data', 'Error!');
        });
      });
    }
  }

  loadRecords() {
    const pagination = {
      skip: ((this.currentPage - 1) * this.recordsPerPage).toString(),
      next: this.recordsPerPage.toString()
    };
    forkJoin([
      this.userService.getLoansAdvancesByUserId(this.selectedUser[0].id, pagination),
      this.payroll.getLoans({ skip: '', next: '' })
    ]).subscribe((results: any[]) => {
      this.loansAdvances = results[0].data;
      this.totalRecords = results[0].total;
      this.loansAdvancesCategories = results[1].data;
    }, err => {
      this.toast.error('Failed to load records', 'Error!');
    });
  }

  getRecord(categoryId: string) {
    const matchingRecord = this.loansAdvancesCategories?.find(rec => rec._id === categoryId);
    return matchingRecord?.name || 'Unknown';
  }
}