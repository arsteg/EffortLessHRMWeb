import { Component, OnInit, ViewChild, TemplateRef, Input } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { PayrollService } from 'src/app/_services/payroll.service';
import { ToastrService } from 'ngx-toastr';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';
import { CommonService } from 'src/app/_services/common.Service';
import { UserService } from 'src/app/_services/users.service';

@Component({
  selector: 'app-step2',
  templateUrl: './step2.component.html',
  styleUrls: ['./step2.component.css']
})
export class FNFStep2Component implements OnInit {
  displayedColumns: string[] = ['payrollFNFUser', 'variableDeduction', 'variableAllowance', 'amount', 'month', 'year', 'actions'];
  variablePaySummary = new MatTableDataSource<any>();
  variablePayForm: FormGroup;
  selectedVariablePay: any;
  userList: any[] = [];
  varAllowances: any;
  varDeductions: any;
  isEdit: boolean = false;

  variableAllowance: any;
  variableDeduction: any;
  selectedFnFUserId: any;
  salary: any;
  months: string[] = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  
  @Input() settledUsers: any[];
  @Input() fnfPayrollRecord: any;
  @Input() isSteps: boolean;

  @ViewChild('dialogTemplate') dialogTemplate: TemplateRef<any>;

  constructor(private fb: FormBuilder,
    private payrollService: PayrollService,
    public dialog: MatDialog,
    private toast: ToastrService,
    private userService: UserService) {
    this.variablePayForm = this.fb.group({
      payrollFNFUser: ['', Validators.required],
      variableDeduction: [null],
      variableAllowance: [null],
      amount: [0, Validators.required],
      month: ['', Validators.required],
      year: [0, Validators.required]
    });
  }

  ngOnInit(): void {
    this.getLists();

    // this.payrollService.selectedFnFPayroll.subscribe((fnfPayroll: any) => {
    //   this.isStep = fnfPayroll?.isSteps;
      const fnfPayroll =this.fnfPayrollRecord;
      this.variablePayForm.patchValue({
        month: fnfPayroll?.month,
        year: fnfPayroll?.year
      });

      if (fnfPayroll) {
        this.fetchVariablePaySummary(fnfPayroll);
      }
    // })
  }

  onUserChange(fnfUserId: string): void {
    this.variablePayForm.patchValue({
      month: this.fnfPayrollRecord.month,
      year: this.fnfPayrollRecord.year
    });
    this.variablePayForm.get('year').disable();
    this.variablePayForm.get('month').disable();

    this.selectedFnFUserId = fnfUserId;

    this.getSalarydetailsByUser();

    this.getRecordsByUser(fnfUserId);
    // this.payrollService.selectedFnFPayroll.subscribe((fnfPayroll: any) => {

    //   const fnfUser = fnfPayroll.userList[0].user;
    const matchedUser = this.fnfPayrollRecord.userList.find((user: any) => user.user === fnfUserId);
    const payrollFNFUserId = matchedUser ? matchedUser._id : null;

    this.payrollService.getFnFVariablePayFnFUserId(payrollFNFUserId).subscribe((res: any) => {
      this.variablePaySummary.data = res.data;
      // this.variablePaySummary.data.forEach((summary: any) => {
      //   const user = this.userList.find(user => user._id === fnfUser);
      //   summary.userName = user ? `${user.firstName} ${user.lastName}` : 'Unknown User';
      // });
    });
    // });
  }


  getLists() {
    let payload = { skip: '', next: '' }

    // get all variable allowances and deductions
    this.payrollService.getVariableAllowance(payload).subscribe((res: any) => {
      this.varAllowances = res.data;
    });

    this.payrollService.getVariableDeduction(payload).subscribe((res: any) => {
      this.varDeductions = res.data;
    });
    // this.payrollService.selectedFnFPayroll.subscribe((fnfPayroll: any) => {
      if (this.fnfPayrollRecord) {
        this.fetchVariablePaySummary(this.fnfPayrollRecord);
      }
    // })
  }

  openDialog(isEdit: boolean): void {
    this.isEdit = isEdit;
    this.dialog.open(this.dialogTemplate, {
      width: '50%',
      panelClass: 'custom-dialog-container',
      disableClose: true
    });
  }

  editVariablePay(variablePay: any): void {
    this.isEdit = true;
    this.selectedVariablePay = variablePay;
    this.variablePayForm.patchValue({
      payrollFNFUser: variablePay.payrollFNFUser,
      variableDeduction: variablePay.variableDeduction,
      variableAllowance: variablePay.variableAllowance,
      amount: variablePay.amount,
      month: variablePay.month,
      year: variablePay.year
    });
    this.variablePayForm.get('payrollFNFUser').disable();
    this.openDialog(true);
  }

  onSubmit(): void {
    this.variablePayForm.get('year').enable();
    this.variablePayForm.get('month').enable();
    this.variablePayForm.get('payrollFNFUser').enable();

    const matchedUser = this.fnfPayrollRecord.userList.find((user: any) => user.user === this.selectedFnFUserId);
    const payrollFNFUserId = matchedUser ? matchedUser._id : null;

    this.variablePayForm.patchValue({
      payrollFNFUser: payrollFNFUserId
    })

    if (this.variablePayForm.valid) {

      const payload = this.variablePayForm.value;
      if (this.selectedVariablePay) {
        this.payrollService.updateFnFVariablePay(this.selectedVariablePay._id, payload).subscribe(
          (res: any) => {
            this.toast.success('Variable Pay updated successfully', 'Success');
            this.fetchVariablePaySummary(this.fnfPayrollRecord);
            this.dialog.closeAll();
          },
          (error: any) => {
            this.toast.error('Failed to update Variable Pay', 'Error');
          }
        );
      } else {
        this.payrollService.addFnFVariablePay(payload).subscribe(
          (res: any) => {
            this.toast.success('Variable Pay added successfully', 'Success');
            this.fetchVariablePaySummary(this.fnfPayrollRecord); 
            this.dialog.closeAll();
          },
          (error: any) => {
            this.toast.error('Failed to add Variable Pay', 'Error');
          }
        );
      }
    } else {
      this.variablePayForm.markAllAsTouched();
    }
    this.variablePayForm.get('year').disable();
    this.variablePayForm.get('month').disable();
  }

  onCancel(): void {
    if (this.isEdit && this.selectedVariablePay) {
      this.variablePayForm.patchValue({
        payrollFNFUser: this.selectedVariablePay.payrollFNFUser,
        variableDeduction: this.selectedVariablePay.variableDeduction,
        variableAllowance: this.selectedVariablePay.variableAllowance,
        amount: this.selectedVariablePay.amount,
        month: this.selectedVariablePay.month,
        year: this.selectedVariablePay.year
      });
    } else {
      this.variablePayForm.reset();
    }
  }

  deleteVariablePay(_id: string) {
    this.payrollService.deleteFnFVariablePay(_id).subscribe((res: any) => {
      this.toast.success('Variable Pay Deleted', 'Success');
      this.fetchVariablePaySummary(this.fnfPayrollRecord);
    }, error => {
      this.toast.error('Failed to delete Variable Pay', 'Error');
    });
  }

  deleteFnF(id: string): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, { width: '400px', });
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'delete') { this.deleteVariablePay(id); }
    });
  }

  getMatchedSettledUser(userId: string) {
    const matchedUser = this.settledUsers?.find(user => user?._id == userId)
    return matchedUser ? `${matchedUser?.firstName}  ${matchedUser?.lastName}` : 'Not specified'
  }

  fetchVariablePaySummary(fnfPayroll: any): void {
    this.payrollService.getFnFVariablePaySummary(fnfPayroll._id).subscribe(
      (res: any) => {
        this.variablePaySummary.data = res.data;

        const matchedUser = this.fnfPayrollRecord.userList.find(
          (user: any) => this.variablePaySummary.data.some((summary: any) => summary.payrollFNFUser === user._id)
        );

        if (matchedUser) {
          const payrollFNFUserName = matchedUser.user

          this.variablePaySummary.data.forEach((item: any) => {
            item.payrollFNFUser = this.getMatchedSettledUser(payrollFNFUserName);
          });
        }
      },
      (error: any) => {
        this.toast.error('Failed to fetch Variable Pay Summary', 'Error');
      }
    );
  }

  getMatchingVarAllowance(id: string) {
    if (this.varAllowances && this.varAllowances.length) {
      const matchedValue = this.varAllowances.find((allowance: any) => allowance?._id === id);
      return matchedValue ? matchedValue.label : '--';
    }
  }

  getMatchingVarDeduction(id: string) {
    if (this.varDeductions && this.varDeductions.length) {
      const matchedValue = this.varDeductions.find((deduction: any) => deduction._id === id);
      return matchedValue ? matchedValue.label : '--';
    }
  }



  getRecordsByUser(selectedUser: string) {
    this.userService.getSalaryByUserId(selectedUser).subscribe((res: any) => {
      const response = res.data[res.data.length - 1];
      this.variableAllowance = response.variableAllowanceList;
      this.variableDeduction = response.variableDeductionList;
    });
  }

  getSalarydetailsByUser() {

    this.fnfPayrollRecord.userList.forEach((user: any) => {
      if (user._id === this.selectedFnFUserId) {
        const fnfUser = user.user;
        this.userService.getSalaryByUserId(fnfUser).subscribe((res: any) => {
          this.salary = res.data[res.data.length - 1];
        })
      }
    })
  }

  getVariableAllowance(templateId: string) {
    const matchingTemp = this.varAllowances?.find(temp => temp._id === templateId);
    return matchingTemp ? matchingTemp.label : '';
  }

  getVariableDeduction(templateId: string) {
    const matchingTemp = this.varDeductions?.find(temp => temp._id === templateId);
    return matchingTemp ? matchingTemp.label : '';
  }

}
