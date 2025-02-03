import { Component, Input, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { th } from 'date-fns/locale';
import { ToastrService } from 'ngx-toastr';
import { forkJoin, map } from 'rxjs';
import { CommonService } from 'src/app/_services/common.Service';
import { PayrollService } from 'src/app/_services/payroll.service';
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
  users: any;
  changeMode: 'Add' | 'Update' = 'Add';
  incomeTax: any;
  selectedUserId: any;
  @Input() selectedPayroll: any;
  selectedRecord: any;
  payrollUser: any;
  selectedPayrollUser: any;
  statutoryDetails: any;
  taxableSalary: number = 0;
  taxPayableOldRegime: number = 0;
  taxPayableNewRegime: number = 0;
  @ViewChild('dialogTemplate') dialogTemplate: TemplateRef<any>;

  constructor(
    private fb: FormBuilder,
    private commonService: CommonService,
    private payrollService: PayrollService,
    private dialog: MatDialog,
    private toast: ToastrService,
    private userService: UserService
  ) {
    this.taxForm = this.fb.group({
      PayrollUser: ['', Validators.required],
      TaxCalculatedMethod: ['', Validators.required],
      TaxCalculated: [0, Validators.required],
      TDSCalculated: [0, Validators.required]
    })
  }

  ngOnInit() {
    this.getAllUsers();
    this.getIncomeTaxByPayroll();
  }

  getAllUsers() {
    this.commonService.populateUsers().subscribe((res: any) => {
      this.users = res.data.data;
    })
  }

  getUser(employeeId: string) {
    const matchingUser = this.users?.find(user => user._id === employeeId);
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
    this.calculateTax();
    this.getStatutoryDetails();
    this.getIncomeTax();
  }

  getIncomeTax() {
    this.payrollService.getIncomeTax(this.selectedPayrollUser).subscribe((res: any) => {
      this.incomeTax = res.data;
      const userRequests = this.incomeTax.map((item: any) => {
        return this.payrollService.getPayrollUserById(this.selectedPayrollUser).pipe(
          map((userRes: any) => ({
            ...item,
            payrollUserDetails: this.getUser(userRes?.data.user)
          }))
        );
      });
      forkJoin(userRequests).subscribe(
        (results: any[]) => {
          this.incomeTax = results;
        },
        (error) => {
          this.toast.error("Error fetching payroll user details:", error);
        }
      );
    },
      (error) => {
        this.toast.error("Error fetching attendance summary:", error);
      }
    );
  }

  getIncomeTaxByPayroll() {
    this.payrollService.getIncomeTaxByPayroll(this.selectedPayroll?._id).subscribe((res: any) => {
      this.incomeTax = res.data;
      const userRequests = this.incomeTax.map((item: any) => {
        return this.payrollService.getPayrollUserById(item.PayrollUser).pipe(
          map((userRes: any) => ({
            ...item,
            payrollUserDetails: this.getUser(userRes?.data.user)
          }))
        );
      });
      forkJoin(userRequests).subscribe(
        (results: any[]) => {
          this.incomeTax = results;
        },
        (error) => {
          this.toast.error("Error fetching payroll user details:", error);
        }
      );
    },
      (error) => {
        this.toast.error("Error fetching attendance summary:", error);
      })
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
      this.statutoryDetails = res.data[0].taxRegime;
      this.taxForm.patchValue({
        TaxCalculatedMethod: this.statutoryDetails
      });
      this.taxForm.get('TaxCalculatedMethod').disable();
    })
  }


  calculateTax() {
    if (!this.selectedUserId) return;

    this.userService.getSalaryByUserId(this.selectedUserId).subscribe((res: any) => {
      const lastSalaryRecord = res.data?.[res.data.length - 1];
      let grossSalary = parseFloat(lastSalaryRecord?.Amount) || 0;

      if (lastSalaryRecord?.enteringAmount === 'Monthly') {
        grossSalary *= 12;
      }

      this.userService.getTaxDeclarationByUserId(this.selectedUserId, { skip: '', next: '' }).subscribe((res: any) => {
        const taxDeclarations = res.data || [];
        const deductions = taxDeclarations[0]?.incomeTaxDeclarationComponent?.reduce((sum, element) => {
          return sum + (element.approvedAmount || 0);
        }, 0) || 0;

        this.taxableSalary = Math.max(grossSalary - deductions, 0);

        if (!this.taxableSalary) {
          console.warn('Taxable Salary is 0 or invalid');
          return;
        }

        // Calculate Annual Tax for Both Regimes
        const yearlyTaxOldRegime = this.calculateOldRegimeTax(this.taxableSalary);
        const yearlyTaxNewRegime = this.calculateNewRegimeTax(this.taxableSalary);

        // Compute Monthly TDS
        const monthlyTDSOldRegime = yearlyTaxOldRegime / 12;
        const monthlyTDSNewRegime = yearlyTaxNewRegime / 12;

        if (this.statutoryDetails === 'Old Regime') {
          this.taxForm.patchValue({
            TaxCalculated: yearlyTaxOldRegime,
            TDSCalculated: parseFloat(monthlyTDSOldRegime.toFixed(2)),
          });
        }
        else if (this.statutoryDetails === 'New Regime') {
          this.taxForm.patchValue({
            TaxCalculated: yearlyTaxNewRegime,
            TDSCalculated: parseFloat(monthlyTDSNewRegime.toFixed(2)),
          });
        }

        // Disable fields
        this.taxForm.get('TaxCalculated')?.disable();
        this.taxForm.get('TDSCalculated')?.disable();
      });
    });
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

    if (taxableSalary <= 500000) {
      tax = 0;
    }

    // Add 4% Cess
    return tax + tax * 0.04;
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

    // Apply Section 87A rebate if taxable salary is ≤ ₹7,00,000
    if (taxableSalary <= 700000) {
      tax = 0;
    }

    // Add 4% Cess
    return tax + tax * 0.04;
  }

}
