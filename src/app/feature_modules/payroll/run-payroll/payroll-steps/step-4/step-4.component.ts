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
  allUsers: any;
  @Input() selectedPayroll: any;
  changeMode: 'Add' | 'Update' = 'Update';
  selectedRecord: any;
  payrollUsers: any;
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
    this.payrollService.allUsers.subscribe(res => {
      this.allUsers = res;
    });
    this.payrollService.payrollUsers.subscribe(res => {
      this.payrollUsers = res;
    });
    this.getLoanAdvanceByPayroll();
  }

  openDialog() {
    this.dialog.open(this.dialogTemplate, {
      width: '600px',
      disableClose: true
    });
  }

  closeDialog() {
    this.changeMode = 'Update';
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
    if (this.changeMode === 'Update') { this.getLoanAdvances(); }
    if (this.changeMode === 'Add') { this.getLoanAdvancesOfUser(); }
  }



  getUser(employeeId: string) {
    const matchingUser = this.allUsers?.find(user => user._id === employeeId);
    return matchingUser ? `${matchingUser.firstName} ${matchingUser.lastName}` : 'N/A';
  }

  getLoanAdvancesOfUser() {
    this.userService.getLoansAdvancesByUserId(this.selectedUserId, { skip: '', next: '' }).subscribe((res: any) => {
      this.userloanAdvances = res.data;
      if (this.userloanAdvances.length > 0) {
        this.userloanAdvances.unshift({ loanAdvancesCategory: { name: 'Select Loan/Advance' } });
      } else {
        this.userloanAdvances.unshift({ loanAdvancesCategory: { name: 'Loans/Advances not Assigned to the Selected User' } });
      }
    })
  }

  getMatchingCategory(loanAdvance: string) {
    const matchingCategory = this.allLoanAdvances?.find(record => record?._id === loanAdvance);
    return matchingCategory ? `${matchingCategory.name}` : 'N/A';
  }

  setFormValues(form: any) {
    this.payrollService.getPayrollUserById(this.selectedRecord.payrollUser).subscribe((res: any) => {
      this.payrollUsers = res.data;
      const payrollUser = this.payrollUsers?.user;
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
    this.loanAdvanceForm.value.amount = 0;
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
    this.payrollService.getLoanAdvance(this.selectedPayrollUser).subscribe((res: any) => {
      this.matchedLoanAdvances = res.data;
      const userRequests = this.matchedLoanAdvances.map((item: any) => {
        const payrollUser = this.payrollUsers?.find((user: any) => user._id === item.payrollUser);
        return {
          ...item,
          payrollUserDetails: payrollUser ? this.getUser(payrollUser.user) : null
        };
      });
      this.matchedLoanAdvances = userRequests
    })
  }

  getLoanAdvanceByPayroll() {
    this.payrollService.getLoanAdvanceByPayroll(this.selectedPayroll?._id).subscribe((res: any) => {
      this.matchedLoanAdvances = res.data;
      const userRequests = this.matchedLoanAdvances.map((item: any) => {
        const payrollUser = this.payrollUsers?.find((user: any) => user._id === item.payrollUser);
        return {
          ...item,
          payrollUserDetails: payrollUser ? this.getUser(payrollUser.user) : null
        };
      });
      this.matchedLoanAdvances = userRequests
    });
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
