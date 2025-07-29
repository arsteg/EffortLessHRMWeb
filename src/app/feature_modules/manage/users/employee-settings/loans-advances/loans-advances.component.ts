import { Component, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidatorFn } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { PayrollService } from 'src/app/_services/payroll.service';
import { UserService } from 'src/app/_services/users.service';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';
import { forkJoin } from 'rxjs';
import { AuthenticationService } from 'src/app/_services/authentication.service';      
import { TranslateService } from '@ngx-translate/core';
import { ActionVisibility, TableColumn } from 'src/app/models/table-column';

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
  allData: any[] = [];
  @ViewChild('dialogTemplate') dialogTemplate: TemplateRef<any>;

  columns: TableColumn[] = [
    { key: 'loanAdvancesCategory', 
      name: this.translate.instant('loans-advances.category'), 
      valueFn: (row: any) => row.loanAdvancesCategory?.name 
    },
    { 
      key: 'noOfInstallment', 
      name: this.translate.instant('loans-advances.total_installments') 
    },
    { 
      key: 'monthlyInstallment', 
      name: this.translate.instant('loans-advances.installment_amount') 
    },
    { 
      key: 'remainingInstallment', 
      name: this.translate.instant('loans-advances.remaining_installment') 
    },
    { 
      key: 'amount', 
      name: this.translate.instant('loans-advances.total_amount') 
    },
    { 
      key: 'status', 
      name: this.translate.instant('loans-advances.status') 
    },
    {
      key: 'action',
      name: this.translate.instant('loans-advances.actions'),
      isAction: true,
      options: [
        { 
          label: 'Edit', 
          icon: 'edit', 
          visibility: ActionVisibility.LABEL, 
          hideCondition: (row: any) => row.status !== 'Requested' 
        },
        { 
          label: 'Delete', 
          icon: 'delete', 
          visibility: ActionVisibility.LABEL
        }
      ]
    }
  ];
  
  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private payroll: PayrollService,
    private dialog: MatDialog,
    private toast: ToastrService,
    private router: Router,
    private translate: TranslateService,
    public authService: AuthenticationService,
    private route: ActivatedRoute
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
        this.toast.error(this.translate.instant('manage.users.employee-settings.failed_loan_advance_delete'));
      }
    }, err => {
      const errorMessage = err?.error?.message || err?.message || err 
          || this.translate.instant('manage.users.employee-settings.failed_loan_advance_delete')
          ;
         
          this.toast.error(errorMessage, 'Error!');
    });
  }

  deleteLoansAdvance(id: string) {
    this.userService.deleteLoansAdvances(id).subscribe(
      (res: any) => {
        this.loadRecords();
        this.toast.success(this.translate.instant('manage.users.employee-settings.loan_advance_deleted'), this.translate.instant('common.success'))
    
      },
      (err) => {
        const errorMessage = err?.error?.message || err?.message || err 
          || this.translate.instant('manage.users.employee-settings.failed_loan_advance_delete')
          ;
         
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
    const record = { ...this.selectedRecord };
    // Ensure only the category ID is set in the form
    record.loanAdvancesCategory = record.loanAdvancesCategory?._id;
    this.loansAdvancesForm.patchValue(record);
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
         this.toast.error(this.translate.instant('manage.users.employee-settings.installments_exceed'), this.translate.instant('common.error'))
    
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
            this.toast.success(this.translate.instant('manage.users.employee-settings.loan_advance_added'), this.translate.instant('common.success'))
          },
          (err) => {
            const errorMessage = err?.error?.message || err?.message || err 
            || this.translate.instant('manage.users.employee-settings.failed_loan_advance_add')
            ;
           
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
            this.toast.success(this.translate.instant('manage.users.employee-settings.loan_advance_updated'), this.translate.instant('common.success'))
   
          },
          (err) => {
            const errorMessage = err?.error?.message || err?.message || err 
            || this.translate.instant('manage.users.employee-settings.failed_loan_advance_updated')
            ;
           
            this.toast.error(errorMessage, 'Error!');
          }
        );
      }
    }
    this.loansAdvancesForm.get('amount').disable();
  }

  onPageChange(event: any) {
    this.currentPage = event.pageIndex + 1;
    this.recordsPerPage = event.pageSize;
    this.loadRecords();
  }

  onRecordsPerPageChange(recordsPerPage: number) {
    this.recordsPerPage = recordsPerPage;
    this.currentPage = 1;
    this.loadRecords();
  }

  logUrlSegmentsForUser() {
   const empCode = this.route.parent.snapshot.paramMap.get('empCode') || this.authService.currentUserValue?.empCode;
    if (empCode) {
      this.userService.getUserByEmpCode(empCode).subscribe((res: any) => {
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
          this.allData = this.loansAdvances;
        }, err => {
        
          this.toast.error(this.translate.instant('manage.users.employee-settings.loan_advance_load_failed'), this.translate.instant('common.error'))
   
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
      this.allData = this.loansAdvances;
    }, err => {
      this.toast.error(this.translate.instant('manage.users.employee-settings.loan_advance_load_failed'), this.translate.instant('common.error'))
    });
  }

  getRecord(categoryId: string) {
    const matchingRecord = this.loansAdvancesCategories?.find(rec => rec._id === categoryId);
    return matchingRecord?.name || 'Unknown';
  }

  handleAction(event: any) {
    if (event.action.label === 'Edit') {
      this.isEdit = true;
      this.selectedRecord = event.row;
      this.edit();
      this.openDialog();
    } 
    if (event.action.label === 'Delete') {
      this.deleteLoansAdvances(event.row._id);
    }
  }

  onSortChange(event: any) {
    const sorted = this.allData.slice().sort((a: any, b: any) => {
      var valueA = '';
      var valueB = '';
      if (event.active === 'loanAdvancesCategory') {
        valueA = `${a.loanAdvancesCategory.name || ''}`.toLowerCase();
        valueB = `${b.loanAdvancesCategory.name || ''}`.toLowerCase();
      } else {
        valueA = this.getNestedValue(a, event.active);
        valueB = this.getNestedValue(b, event.active);
      }

      // Handle nulls and undefined
      valueA = valueA ?? '';
      valueB = valueB ?? '';

      if (valueA < valueB) return event.direction === 'asc' ? -1 : 1;
      if (valueA > valueB) return event.direction === 'asc' ? 1 : -1;
      return 0;
    });

    this.loansAdvances = sorted;
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((o, key) => (o ? o[key] : undefined), obj);
  }

  onSearchChange(search: string) {
    const lowerSearch = search.toLowerCase();

    const data = this.allData?.filter(row => {
      const valuesToSearch = [
        `${row?.loanAdvancesCategory?.name}`,
        row?.noOfInstallment,
        row?.monthlyInstallment,
        row?.remainingInstallment,
        row?.amount,
        row?.status
      ];

      return valuesToSearch.some(value =>
        value?.toString().toLowerCase().includes(lowerSearch)
      );
    });

    this.loansAdvances = data;
  }
}