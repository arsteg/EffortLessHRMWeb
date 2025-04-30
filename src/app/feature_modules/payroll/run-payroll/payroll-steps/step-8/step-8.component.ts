import { Component, Input, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { PayrollService } from 'src/app/_services/payroll.service';
import { TaxationService } from 'src/app/_services/taxation.service';
import { UserService } from 'src/app/_services/users.service';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-step-8',
  templateUrl: './step-8.component.html',
  styleUrls: ['./step-8.component.css']
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
  ctc: number = 0;
  taxCalulationMethod: boolean = false;
  isIncomeTaxDeductionFalse: boolean = false;

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
    });
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
    let payload = {
      PayrollUser: this.selectedPayrollUser,
      TaxCalculatedMethod: this.taxForm.value.TaxCalculatedMethod,  
      TaxCalculated: this.taxForm.value.TaxCalculated,
      TDSCalculated: this.taxForm.value.TDSCalculated
    }
    this.payrollService.addIncomeTax(payload).subscribe((res: any) => {
      this.getIncomeTaxByPayroll();
      this.taxForm.reset();
      this.toast.success('Payroll Income Tax Added', 'Successfully!');
      this.closeDialog();
    }, err => {
      this.toast.error('Payroll Income Tax Can not be Added', 'Error!');
    });
  }

  onUserSelectedFromChild(user: any) {
    this.selectedUserId = user.value.user;
    this.selectedPayrollUser = user.value._id;
    if (this.changeMode === 'Add') {
      // Use forkJoin to call calculateTax and getStatutoryDetails in parallel
      forkJoin({
        tax: this.calculateTax(),
        statutory: this.getStatutoryDetails()
      }).pipe(
        switchMap(() => this.getEmployeeTaxDeclarationByUser()),
        catchError(err => {
          this.toast.error('Error processing user selection', 'Error');
          return of(null); // Handle error gracefully
        })
      ).subscribe(() => {
        // All operations completed
      });
    }
    if (this.changeMode === 'Update') {
      this.getIncomeTax();
    }
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
    if (this.changeMode === 'Update') {
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
    this.taxCalulationMethod = false;
    this.dialog.closeAll();
  }

  deleteTemplate(_id: string) {
    this.payrollService.deleteIncomeTax(_id).subscribe((res: any) => {
      this.getIncomeTaxByPayroll();
      this.toast.success('Successfully Deleted!!!', 'Income-Tax Overwrite');
    }, err => {
      this.toast.error('This Income-Tax Overwrite Can not be deleted!');
    });
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

  getStatutoryDetails(): Observable<any> {
    return this.userService.getStatutoryByUserId(this.selectedUserId).pipe(
      catchError(err => {
        this.taxCalulationMethod = true;
        return of({ data: [] }); // Return empty data to prevent forkJoin from failing
      }),
      switchMap((res: any) => {
        this.statutoryDetails = res?.data?.taxRegime;
        if (res.status === 'error' || !this.statutoryDetails) {
          this.taxCalulationMethod = true;
          this.taxForm.patchValue({
            TaxCalculatedMethod: '',
            TaxCalculated: null,
            TDSCalculated: null
          })
          // this.taxForm.get('TaxCalculatedMethod').enable();
        } else {
          this.taxCalulationMethod = false;
          this.taxForm.patchValue({
            TaxCalculatedMethod: this.statutoryDetails
          });
          this.taxForm.get('TaxCalculatedMethod').disable();
        }
        return of(res);
      })
    );
  }

  calculateTax(): Observable<any> {
    if (!this.selectedUserId) {
      this.isIncomeTaxDeductionFalse = false;
      return of(null);
    }

    return this.userService.getSalaryByUserId(this.selectedUserId).pipe(
      catchError(err => {
        this.isIncomeTaxDeductionFalse = false; // Reset flag on error
        return of({ data: [] });
      }),
      switchMap((res: any) => {
        const lastSalaryRecord = res.data?.[res.data.length - 1];
        if (!lastSalaryRecord) {
          this.isIncomeTaxDeductionFalse = false; // Reset flag if no salary record
          return (null);
        }
        if (lastSalaryRecord.isIncomeTaxDeduction === false) {
          this.isIncomeTaxDeductionFalse = true; // Set flag to show validation
          return of(null);
        } else {
          this.isIncomeTaxDeductionFalse = false; // Reset flag
        }

        const fixedAllowances = lastSalaryRecord?.fixedAllowanceList || [];
        const variableAllowanceList = lastSalaryRecord?.variableAllowanceList || [];
        const basicSalary = parseFloat(lastSalaryRecord?.BasicSalary) || 0;

        let grossSalary = parseFloat(lastSalaryRecord?.Amount) || 0;
        this.ctc = grossSalary;
        let taxableSalary = basicSalary;
        fixedAllowances.forEach(allowance => {
          if (allowance?.fixedAllowance?.isTDSAffected) {
            taxableSalary += parseFloat(allowance.yearlyAmount) || 0;
          }
        });

        variableAllowanceList.forEach(allowance => {
          if (allowance.variableAllowance?.isIncomeTaxAffected) {
            taxableSalary += parseFloat(allowance.yearlyAmount) || 0;
          }
        });

        this.taxableSalary = taxableSalary > grossSalary ? grossSalary : taxableSalary;
        return of(lastSalaryRecord);
      })
    );
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
      tax = Math.max(0, tax - 12500); // Rebate under Section 87A
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
      tax = Math.max(0, tax - 25000);
    }
    const cess = tax * 0.04;
    return tax + cess;
  }

  getEmployeeTaxDeclarationByUser(): Observable<any> {
    return this.taxService.getTaxDeclarationsByUser(this.selectedUserId, { skip: '', next: '' }).pipe(
      catchError(err => {
        return of({ data: [] }); // Return empty data to prevent forkJoin from failing
      }),
      switchMap((res: any) => {
        const taxDeclarations = res.data;
        let employeeIncomeTaxDeclaration: any;

        taxDeclarations.forEach((declaration: any) => {
          const financialYear = declaration.financialYear;
          const endYear = financialYear.split('-')[1];
          if (endYear === this.selectedPayroll?.year) {
            employeeIncomeTaxDeclaration = declaration;

            // Calculate total approved exemptions
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

            // Apply exemptions based on tax regime
            let finalTaxableSalary = this.taxableSalary;
            if (this.taxForm.get('TaxCalculatedMethod').value === 'Old Regime') {
              finalTaxableSalary = Math.max(0, this.taxableSalary - this.totalTaxApprovedAmount);
            } else if (this.taxForm.get('TaxCalculatedMethod').value === 'New Regime') {
              finalTaxableSalary = Math.max(0, this.taxableSalary - 50000); // Standard deduction
            }

            // Calculate tax based on regime
            const yearlyTaxOldRegime = this.calculateOldRegimeTax(finalTaxableSalary);
            const yearlyTaxNewRegime = this.calculateNewRegimeTax(finalTaxableSalary);

            // Update form with calculated tax and TDS
            if (this.taxForm.get('TaxCalculatedMethod').value === 'Old Regime') {
              this.taxForm.patchValue({
                TaxCalculated: yearlyTaxOldRegime,
                TDSCalculated: parseFloat((yearlyTaxOldRegime / 12).toFixed(2))
              });
            } else if (this.taxForm.get('TaxCalculatedMethod').value === 'New Regime') {
              this.taxForm.patchValue({
                TaxCalculated: yearlyTaxNewRegime,
                TDSCalculated: parseFloat((yearlyTaxNewRegime / 12).toFixed(2))
              });
            }

            this.taxForm.get('TaxCalculated').disable();
            this.taxForm.get('TDSCalculated').disable();
          }
        });


        return of(res); // Return the response
      })
    );
  }
}