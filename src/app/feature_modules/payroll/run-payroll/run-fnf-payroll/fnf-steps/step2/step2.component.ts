import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
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
  displayedColumns: string[] = ['payrollUser', 'variableDeduction', 'variableAllowance', 'amount', 'month', 'year', 'actions'];
  variablePaySummary = new MatTableDataSource<any>();
  variablePayForm: FormGroup;
  selectedVariablePay: any;
  years: number[] = [];
  userList: any[] = [];
  varAllowances: any;
  varDeductions: any;
  isEdit: boolean = false;

  variableAllowance: any;
  variableDeduction: any;
  fnfPayroll: any;
  selectedFnFUserId: any;
  salary: any;
  months: string[] = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  @ViewChild('dialogTemplate') dialogTemplate: TemplateRef<any>;

  constructor(private fb: FormBuilder,
    private payrollService: PayrollService,
    public dialog: MatDialog,
    private commonService: CommonService,
    private toast: ToastrService,
    private userService: UserService) {
    this.variablePayForm = this.fb.group({
      payrollFNFUser: ['', Validators.required],
      variableDeduction: ['', Validators.required],
      variableAllowance: ['', Validators.required],
      amount: [0, Validators.required],
      month: ['', Validators.required],
      year: [0, Validators.required]
    });
  }

  ngOnInit(): void {
    this.generateYears();

    this.getLists();

    this.payrollService.selectedFnFPayroll.subscribe((fnfPayroll: any) => {
      this.fnfPayroll = fnfPayroll;
      if (fnfPayroll) {
        this.fetchVariablePaySummary(fnfPayroll);
      }
    })
  }

  onUserChange(fnfUserId: string): void {
    this.variablePayForm.patchValue({
      month: this.fnfPayroll.month,
      year: this.fnfPayroll.year
    });
    this.variablePayForm.get('year').disable();
    this.variablePayForm.get('month').disable();

    this.selectedFnFUserId = fnfUserId;
    this.getSalarydetailsByUser();

    this.getRecordsByUser(fnfUserId);
    this.payrollService.selectedFnFPayroll.subscribe((fnfPayroll: any) => {
      const fnfUser = fnfPayroll.userList[0].user;

      this.payrollService.getFnFAttendanceSummaryByFnFUserId(fnfUserId).subscribe((res: any) => {
        this.variablePaySummary.data = res.data;
        this.variablePaySummary.data.forEach((summary: any) => {
          const user = this.userList.find(user => user._id === fnfUser);
          summary.userName = user ? `${user.firstName} ${user.lastName}` : 'Unknown User';
        });
      });
    });
  }


  getLists() {
    // get all users
    this.commonService.populateUsers().subscribe((res: any) => {
      this.userList = res.data['data'];
    });

    let payload = { skip: '', next: '' }

    // get all variable allowances and deductions
    this.payrollService.getVariableAllowance(payload).subscribe((res: any) => {
      this.varAllowances = res.data;
    });

    this.payrollService.getVariableDeduction(payload).subscribe((res: any) => {
      this.varDeductions = res.data;
    });
    this.payrollService.selectedFnFPayroll.subscribe((fnfPayroll: any) => {
      if (fnfPayroll) {
        this.fetchVariablePaySummary(fnfPayroll);
      }
    })
  }

  generateYears(): void {
    const currentYear = new Date().getFullYear();
    this.years = [currentYear, currentYear + 1];
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

    this.openDialog(true);
  }

  onSubmit(): void {
    if (this.variablePayForm.valid) {
      this.variablePayForm.get('year').enable();
      this.variablePayForm.get('month').enable();
      const payload = this.variablePayForm.value;
      if (this.selectedVariablePay) {
        this.payrollService.updateFnFVariablePay(this.selectedVariablePay._id, payload).subscribe(
          (res: any) => {
            this.toast.success('Variable Pay updated successfully', 'Success');
            // this.fetchVariablePaySummary();
          },
          (error: any) => {
            this.toast.error('Failed to update Variable Pay', 'Error');
          }
        );
      } else {
        this.payrollService.addFnFVariablePay(payload).subscribe(
          (res: any) => {
            this.toast.success('Variable Pay added successfully', 'Success');
            // this.fetchVariablePaySummary();
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
      // this.fetchVariablePaySummary();
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

  fetchVariablePaySummary(fnfPayroll: any): void {
    this.payrollService.getFnFVariablePaySummary(fnfPayroll._id).subscribe(
      (res: any) => {
        this.variablePaySummary.data = res.data;
        this.variablePaySummary.data.forEach((summary: any, index: number) => {
          const user = this.userList.find(user => user._id === fnfPayroll.userList[index].user);
          summary.userName = user ? `${user.firstName} ${user.lastName}` : 'Unknown User';
        });
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
    const data = this.payrollService.selectedFnFPayroll.getValue()['userList'];
    const user = data.find((user) => user._id === selectedUser);

    this.userService.getSalaryByUserId(user.user).subscribe((res: any) => {
      const response = res.data[res.data.length - 1];
      this.variableAllowance = response.variableAllowanceList;
      this.variableDeduction = response.variableDeductionList;
    });
  }

  getSalarydetailsByUser() {
    console.log(this.fnfPayroll);
    this.fnfPayroll.userList.forEach((user: any) => {
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
