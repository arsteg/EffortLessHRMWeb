import { Component, Input, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { PayrollService } from 'src/app/_services/payroll.service';
import { TaxationService } from 'src/app/_services/taxation.service';
import { UserService } from 'src/app/_services/users.service';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-step-8',
  templateUrl: './step-8.component.html',
  styleUrl: './step-8.component.css'
})
export class Step8Component {
  searchText: string = '';
  closeResult: string = '';
  taxForm: FormGroup;
  allUsers: any;
  changeMode: 'Add' | 'Update' = 'Update';
  incomeTax: any;
  selectedUserId: any;
  @Input() selectedPayroll: any;
  selectedRecord: any;
  payrollUser: any;
  payrollUsers: any;
  selectedPayrollUser: any;
  statutoryDetails: any;
  taxableSalary: number = 0;
  taxPayableOldRegime: number = 0;
  taxPayableNewRegime: number = 0;
  @ViewChild('dialogTemplate') dialogTemplate: TemplateRef<any>;
  totalTaxApprovedAmount = 0;

  constructor(
    private fb: FormBuilder,
    private payrollService: PayrollService,
    private dialog: MatDialog,
    private toast: ToastrService,
    private userService: UserService,
    private taxService: TaxationService
  ) {
    this.taxForm = this.fb.group({
      PayrollUser: ['', Validators.required],
      TaxCalculatedMethod: ['', Validators.required],
      TaxCalculated: [0, Validators.required],
      TDSCalculated: [0, Validators.required]
    })
  }

  ngOnInit() {
    this.payrollService.allUsers.subscribe(res => {
      this.allUsers = res;
    });
    this.payrollService.payrollUsers.subscribe(res => {
      this.payrollUsers = res;
    });
    this.getIncomeTaxByPayroll();
  }

  getUser(employeeId: string) {
    const matchingUser = this.allUsers?.find(user => user._id === employeeId);
    return matchingUser ? `${matchingUser.firstName} ${matchingUser.lastName}` : 'N/A';
  }

  onSubmission() {
    this.taxForm.get('TaxCalculatedMethod').enable();
    this.taxForm.get('TaxCalculated')?.enable();
    this.taxForm.get('TDSCalculated')?.enable();
    this.taxForm.value.PayrollUser = this.selectedPayrollUser;
    this.payrollService.addIncomeTax(this.taxForm.value).subscribe((res: any) => {
      this.getIncomeTaxByPayroll();
      this.taxForm.reset();
      this.toast.success('Payroll Income Tax Added', 'Successfully!');
      this.closeDialog();
    },
      err => {
        this.toast.error('Payroll Income Tax Can not be Added', 'Error!')
      })
  }

  onUserSelectedFromChild(user: any) {
    this.selectedUserId = user.value.user;
    this.selectedPayrollUser = user.value._id;
    if (this.changeMode === 'Add') {
      this.calculateTax();
      this.getStatutoryDetails();
      this.getEmployeeTaxDeclarationByUser();
    }
    if (this.changeMode === 'Update') { this.getIncomeTax(); }
  }

  getIncomeTax() {
    this.payrollService.getIncomeTax(this.selectedPayrollUser).subscribe((res: any) => {
      this.incomeTax = res.data;
      const userRequests = this.incomeTax.map((item: any) => {
        const payrollUser = this.payrollUsers?.find((user: any) => user._id === item.PayrollUser);
        return {
          ...item,
          payrollUserDetails: payrollUser ? this.getUser(payrollUser.user) : null
        };
      });
      this.incomeTax = userRequests;
    });
  }

  getIncomeTaxByPayroll() {
    this.payrollService.getIncomeTaxByPayroll(this.selectedPayroll?._id).subscribe((res: any) => {
      this.incomeTax = res.data;
      const userRequests = this.incomeTax.map((item: any) => {
        const payrollUser = this.payrollUsers?.find((user: any) => user._id === item.PayrollUser);
        return {
          ...item,
          payrollUserDetails: payrollUser ? this.getUser(payrollUser.user) : null
        };
      });
      this.incomeTax = userRequests;
    });
  }

  openDialog() {
    if (this.changeMode == 'Update') {
      this.payrollService.getPayrollUserById(this.selectedRecord?.PayrollUser).subscribe((res: any) => {
        this.payrollUser = res.data;
        const payrollUser = this.payrollUser?.user;
        this.taxForm.patchValue({
          PayrollUser: this.getUser(payrollUser),
          TaxCalculatedMethod: this.selectedRecord?.TaxCalculatedMethod,
          TaxCalculated: this.selectedRecord?.TaxCalculated,
          TDSCalculated: this.selectedRecord?.TDSCalculated
        });
        this.taxForm.get('PayrollUser').disable();
      });
    }
    this.dialog.open(this.dialogTemplate, {
      width: '600px',
      disableClose: true
    });
  }

  closeDialog() {
    this.changeMode = 'Update';
    this.dialog.closeAll();
  }

  deleteTemplate(_id: string) {
    this.payrollService.deleteIncomeTax(_id).subscribe((res: any) => {
      this.getIncomeTaxByPayroll();
      this.toast.success('Successfully Deleted!!!', 'Income-Tax Overwrite')
    },
      (err) => {
        this.toast.error('This Income-Tax Overwrite Can not be deleted!')
      })
  }

  deleteDialog(id: string): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'delete') {
        this.deleteTemplate(id);
      }
    });
  }

  getStatutoryDetails() {
    this.userService.getStatutoryByUserId(this.selectedUserId).subscribe((res: any) => {
      this.statutoryDetails = res?.data[0]?.taxRegime;
      if(res.data.length === 0) {
        this.toast.error('Statutory Details not found for this user', 'Error');
      }
      this.taxForm.patchValue({
        TaxCalculatedMethod: this.statutoryDetails
      });
      this.taxForm.get('TaxCalculatedMethod').disable();
    })
  }

  ctc: number = 0;
  calculateTax() {
    if (!this.selectedUserId) return;
    else {
      this.userService.getSalaryByUserId(this.selectedUserId).subscribe((res: any) => {
        const lastSalaryRecord = res.data?.[res.data.length - 1];
        let grossSalary = parseFloat(lastSalaryRecord?.Amount) || 0;

        if (lastSalaryRecord?.enteringAmount === 'Monthly') {
          grossSalary *= 12;
        }
        this.ctc = grossSalary;
      });
    }
  }

  calculateOldRegimeTax(taxableSalary: number): number {
    let tax = 0;
    if (taxableSalary <= 250000) {
      tax = 0;
    } else if (taxableSalary <= 500000) {
      tax = (taxableSalary - 250000) * 0.05;
    } else if (taxableSalary <= 1000000) {
      tax = 12500 + (taxableSalary - 500000) * 0.2;
    } else {
      tax = 112500 + (taxableSalary - 1000000) * 0.3;
    }
    if (taxableSalary <= 500000 && tax <= 12500) {
      tax = 0;
    }
    const cess = tax * 0.04;
    return tax + cess;
  }

  calculateNewRegimeTax(taxableSalary: number): number {
    let tax = 0;
    if (taxableSalary <= 300000) {
      tax = 0;
    } else if (taxableSalary <= 600000) {
      tax = (taxableSalary - 300000) * 0.05;
    } else if (taxableSalary <= 900000) {
      tax = 15000 + (taxableSalary - 600000) * 0.1;
    } else if (taxableSalary <= 1200000) {
      tax = 45000 + (taxableSalary - 900000) * 0.15;
    } else if (taxableSalary <= 1500000) {
      tax = 90000 + (taxableSalary - 1200000) * 0.2;
    } else {
      tax = 150000 + (taxableSalary - 1500000) * 0.3;
    }
    if (taxableSalary <= 700000) {
      tax = 0;
    }
    return tax + tax * 0.04;
  }

  getEmployeeTaxDeclarationByUser() {
    this.taxService.getTaxDeclarationsByUser(this.selectedUserId, { skip: '', next: '' }).subscribe((res: any) => {
      const taxDeclarations = res.data;
      let employeeIncomeTaxDeclaration: any;

      taxDeclarations.forEach((declaration: any) => {
        const financialYear = declaration.financialYear;

        const endYear = financialYear.split('-')[1];
        if (endYear === this.selectedPayroll?.year) {
          employeeIncomeTaxDeclaration = declaration;
          let totalComponentApprovedAmount = 0;

          employeeIncomeTaxDeclaration.incomeTaxDeclarationComponent.forEach((component: any) => {
            if (component.approvalStatus === 'Approved') {
              totalComponentApprovedAmount += component.approvedAmount || 0;
            }
          });
          let totalHRAApprovedAmount = 0;

          employeeIncomeTaxDeclaration.incomeTaxDeclarationHRA.forEach((hra: any) => {
            if (hra.approvalStatus === 'Approved') {
              totalHRAApprovedAmount += hra.verifiedAmount || 0;
            }
          });

          this.totalTaxApprovedAmount = totalComponentApprovedAmount + totalHRAApprovedAmount;
          if (this.taxForm.get('TaxCalculatedMethod').value === 'Old Regime') {
            this.ctc = this.ctc - this.totalTaxApprovedAmount;
          }
          const yearlyTaxOldRegime = this.calculateOldRegimeTax(this.ctc);
          const yearlyTaxNewRegime = this.calculateNewRegimeTax(this.ctc);

          if (this.taxForm.get('TaxCalculatedMethod').value === 'Old Regime') {
            this.taxForm.patchValue({
              TaxCalculated: yearlyTaxOldRegime,
              TDSCalculated: parseFloat((yearlyTaxOldRegime / 12).toFixed(2)),
            });
            this.taxForm.get('TaxCalculated').disable();
            this.taxForm.get('TDSCalculated').disable();
          }
          else if (this.taxForm.get('TaxCalculatedMethod').value === 'New Regime') {
            this.taxForm.patchValue({
              TaxCalculated: yearlyTaxNewRegime,
              TDSCalculated: parseFloat((yearlyTaxNewRegime / 12).toFixed(2)),
            });
            this.taxForm.get('TaxCalculated').disable();
            this.taxForm.get('TDSCalculated').disable();
          }
        }
      });
    });
  }
}
