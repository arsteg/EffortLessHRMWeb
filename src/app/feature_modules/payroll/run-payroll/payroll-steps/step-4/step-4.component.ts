import { Component, Input, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { forkJoin, map, switchMap } from 'rxjs';
import { CommonService } from 'src/app/_services/common.Service';
import { PayrollService } from 'src/app/_services/payroll.service';
import { UserService } from 'src/app/_services/users.service';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-step-4',
  templateUrl: './step-4.component.html',
  styleUrl: './step-4.component.css'
})
export class Step4Component {
  searchText: string = '';
  loanAdvanceForm: FormGroup;
  selectedUserId: any;
  loanAdvances: any;
  userloanAdvances: any;
  allLoanAdvances: any;
  users: any;
  @Input() selectedPayroll: any;
  changeMode: 'Add' | 'Update' = 'Add';
  selectedRecord: any;
  payrollUser: any;
  matchedLoanAdvances: any;
  selectedPayrollUser: string;
  @ViewChild('dialogTemplate') dialogTemplate: TemplateRef<any>;

  constructor(
    private payrollService: PayrollService,
    private fb: FormBuilder,
    private commonService: CommonService,
    private userService: UserService,
    private toast: ToastrService,
    private dialog: MatDialog
  ) {
    this.loanAdvanceForm = this.fb.group({
      payrollUser: ['', Validators.required],
      loanAndAdvance: ['', Validators.required],
      disbursementAmount: [0, [Validators.required, Validators.min(1)]],
      status: ['Pending'],
      type: [''],
      amount: [0]
    });

    
  }

  ngOnInit() {
    this.getAllUsers();
    this.getAllLoansAdvances();
    this.getLoanAdvanceByPayroll();
  }

  openDialog() {
    this.dialog.open(this.dialogTemplate, {
      width: '600px',
      disableClose: true
    });
  }

  closeDialog() {
    this.dialog.closeAll();
  }

  clearForm() {
    this.loanAdvanceForm.patchValue({
      payrollUser: '',
      loanAndAdvance: '',
      disbursementAmount: 0,
      status: 'Pending',
      type: '',
      amount: 0
    })
  }

  onUserSelectedFromChild(userId: any) {
    this.selectedUserId = userId.value.user;
    this.selectedPayrollUser = userId.value._id;
    this.getAllLoansAdvances();
    this.getLoanAdvances();
    // if (this.changeMode === 'Add' || this.changeMode === 'Update') {
      this.getLoanAdvancesOfUser();
    // }
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

  getLoanAdvancesOfUser() {
    this.userService.getLoansAdvancesByUserId(this.selectedUserId, { skip: '', next: '' }).subscribe((res: any) => {
      this.userloanAdvances = res.data;
      if (this.userloanAdvances.length >= 1) {
        this.userloanAdvances.unshift({ loanAdvancesCategory: '', name: 'Select Loan/Advance' });
      } else {
        this.userloanAdvances.unshift({ loanAdvancesCategory: '', name: 'Loans/Advances not Assigned to the Selected User' });
      }
    })
  }

  getAllLoansAdvances() {
    this.payrollService.getLoans({ skip: '', next: '' }).subscribe((res: any) => {
      this.allLoanAdvances = res.data;
    })
  }

  getMatchingCategory(loanAdvance: string) {
    const matchingCategory = this.allLoanAdvances?.find(record => record?._id === loanAdvance);
    return matchingCategory ? `${matchingCategory.name}` : 'N/A';
  }

  setFormValues(form: any) {
    this.payrollService.getPayrollUserById(this.selectedRecord.payrollUser).subscribe((res: any) => {
      this.payrollUser = res.data;
      const payrollUser = this.payrollUser?.user;
      this.loanAdvanceForm.patchValue({
        payrollUser: this.getUser(payrollUser),
        loanAndAdvance: form.loanAndAdvance,
        disbursementAmount: form.disbursementAmount,
        status: form.status,
        type: form.type,
        amount: form.amount
      });
      this.loanAdvanceForm.get('payrollUser').disable();
    })
  }

  onSubmission() {
    this.loanAdvanceForm.get('payrollUser').enable();
    this.loanAdvanceForm.value.payrollUser = this.selectedPayrollUser;
    this.loanAdvanceForm.value.amount= 0;
    console.log(this.loanAdvanceForm.value.payrollUser);
    if (this.changeMode === 'Add') {
      this.payrollService.addLoanAdvance(this.loanAdvanceForm.value).subscribe(
        (res: any) => {
          this.getLoanAdvanceByPayroll();
          this.loanAdvanceForm.reset();
          this.userloanAdvances = [];
          this.selectedUserId = null;
          this.toast.success('Loan/Advance created', 'Successfully!');
          this.closeDialog();
        },
        (err) => {
          this.toast.error('Loan/Advance cannot be created', 'Error!');
        }
      );
    }

    if (this.changeMode === 'Update') {
      this.payrollService.updateLoanAdvance(this.selectedRecord._id, this.loanAdvanceForm.value).subscribe(
        (res: any) => {
          this.getLoanAdvanceByPayroll();
          this.toast.success('Loan/Advance Updated', 'Successfully');
          this.loanAdvanceForm.reset();
          this.selectedUserId = '';
          this.userloanAdvances = [];
          this.changeMode = 'Add';
          this.closeDialog();
        },
        (err) => {
          this.toast.error('Loan/Advance cannot be Updated', 'Error');
        }
      );
    }
  }

  getLoanAdvances() {
    forkJoin({
      userLoanAdvances: this.userService.getLoansAdvancesByUserId(this.selectedUserId, { skip: '', next: '' }),
      loanAdvances: this.payrollService.getLoanAdvance(this.selectedPayrollUser)
    }).pipe(
      switchMap(({ userLoanAdvances, loanAdvances }) => {
        this.userloanAdvances = userLoanAdvances.data;
        this.loanAdvances = loanAdvances.data;

        const userRequests = this.loanAdvances.map((item: any) =>
          this.payrollService.getPayrollUserById(this.selectedPayrollUser).pipe(
            map((userRes: any) => ({
              ...item,
              payrollUserDetails: this.getUser(userRes?.data.user)
            }))
          )
        );

        return forkJoin(userRequests);
      })
    ).subscribe(
      (detailedLoanAdvances) => {
        this.loanAdvances = detailedLoanAdvances;

        this.matchedLoanAdvances = this.loanAdvances.reduce((acc: any[], loanAdvance) => {
          const matchingUserLoanAdvance = this.userloanAdvances.find(
            (userLoanAdvance) => userLoanAdvance.loanAdvancesCategory === loanAdvance.loanAndAdvance
          );

          if (matchingUserLoanAdvance) {
            acc.push({
              ...loanAdvance,
              amount: matchingUserLoanAdvance.amount,
              frequency: matchingUserLoanAdvance.repaymentFrequency
            });
          }

          return acc;
        }, []);
      },
      (error) => {
        console.error("Error fetching data:", error);
      }
    );
  }

  getLoanAdvanceByPayroll() {
    forkJoin({
      userLoanAdvances: this.userService.getLoansAdvancesByCompany({ skip: '', next: '' }),
      loanAdvances: this.payrollService.getLoanAdvanceByPayroll(this.selectedPayroll?._id)
    }).pipe(
      switchMap(({ userLoanAdvances, loanAdvances }) => {
        this.userloanAdvances = userLoanAdvances.data;
        this.loanAdvances = loanAdvances.data;

        const userRequests = this.loanAdvances.map((item: any) =>
          this.payrollService.getPayrollUserById(item.payrollUser).pipe(
            map((userRes: any) => ({
              ...item,
              payrollUserDetails: this.getUser(userRes?.data.user)
            }))
          )
        );

        return forkJoin(userRequests);
      })
    ).subscribe(
      (detailedLoanAdvances) => {
        this.loanAdvances = detailedLoanAdvances;

        this.matchedLoanAdvances = this.loanAdvances.reduce((acc: any[], loanAdvance) => {
          const matchingUserLoanAdvance = this.userloanAdvances.find(
            (userLoanAdvance) => userLoanAdvance.loanAdvancesCategory === loanAdvance.loanAndAdvance
          );

          if (matchingUserLoanAdvance) {
            acc.push({
              ...loanAdvance,
              amount: matchingUserLoanAdvance.amount,
              frequency: matchingUserLoanAdvance.repaymentFrequency
            });
          }

          return acc;
        }, []);
      },
      (error) => {
        console.error("Error fetching data:", error);
      }
    );
  }

  deleteTemplate(_id: string) {
    this.payrollService.deleteLoanAdvance(_id).subscribe((res: any) => {
      this.getLoanAdvanceByPayroll();
      this.toast.success('Successfully Deleted!!!', 'Loan/Advance')
    },
      (err) => {
        this.toast.error('This Loan/Advance Can not be deleted!')
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
}
