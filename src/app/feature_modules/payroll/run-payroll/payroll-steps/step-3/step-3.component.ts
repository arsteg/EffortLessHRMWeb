import { Component, Input, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { forkJoin, map } from 'rxjs';
import { CommonService } from 'src/app/_services/common.Service';
import { PayrollService } from 'src/app/_services/payroll.service';
import { UserService } from 'src/app/_services/users.service';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-step-3',
  templateUrl: './step-3.component.html',
  styleUrl: './step-3.component.css'
})
export class Step3Component {
  searchText: string = '';
  variablePayForm: FormGroup;
  @Input() selectedPayroll: any;
  selectedUserId: any;
  variablePay: any;
  varAllowance: any;
  varDeduction: any;
  years: number[] = [];
  selectedYear: number;
  changeMode: 'Add' | 'Update' = 'Update';
  selectedRecord: any;
  payrollUser: any;
  salary: any;
  allUsers: any;
  payrollUsers: any;
  @ViewChild('dialogTemplate') dialogTemplate: TemplateRef<any>;

  months = [
    { name: 'January', value: 1 },
    { name: 'February', value: 2 },
    { name: 'March', value: 3 },
    { name: 'April', value: 4 },
    { name: 'May', value: 5 },
    { name: 'June', value: 6 },
    { name: 'July', value: 7 },
    { name: 'August', value: 8 },
    { name: 'September', value: 9 },
    { name: 'October', value: 10 },
    { name: 'November', value: 11 },
    { name: 'December', value: 12 }
  ];
  selectedPayrollUser: string;


  constructor(private payrollService: PayrollService,
    private fb: FormBuilder,
    private toast: ToastrService,
    private commonService: CommonService,
    private dialog: MatDialog,
    private userService: UserService
  ) {
    this.variablePayForm = this.fb.group({
      payrollUser: ['', Validators.required],
      variableDeduction: ['', Validators.required],
      variableAllowance: ['', Validators.required],
      amount: [0, [Validators.required, Validators.min(1)]],
      month: [0, [Validators.required, Validators.min(1), Validators.max(12)]],
      year: [0, [Validators.required, Validators.min(2000), Validators.max(new Date().getFullYear())]]
    })
  }

  ngOnInit() {
    this.generateYearList();
    this.payrollService.allUsers.subscribe(res => {
      this.allUsers = res;
    });
    this.payrollService.payrollUsers.subscribe(res => {
      this.payrollUsers = res;
    });
    this.getVariableDeductionAndAllowance();
    this.getVariablePayByPayroll();
  }

  generateYearList() {
    const currentYear = new Date().getFullYear();
    this.years = [currentYear - 1, currentYear, currentYear + 1];
    this.variablePayForm.value.year = currentYear;
  }

  openDialog() {
    this.variablePayForm.patchValue({
      month: this.selectedPayroll?.month,
      year: this.selectedPayroll?.year
    });
    this.variablePayForm.get('month').disable();
    this.variablePayForm.get('year').disable();
    if (this.changeMode === 'Update') {
      this.payrollService.getPayrollUserById(this.selectedRecord.payrollUser).subscribe((res: any) => {
        this.payrollUser = res.data;
        this.getSalarydetailsByUser();
        const payrollUser = this.payrollUser?.user;
        console.log(this.selectedRecord)
        this.variablePayForm.patchValue({
          payrollUser: this.getUser(payrollUser),
          variableDeduction: this.selectedRecord?.variableDeduction?._id,
          variableAllowance: this.selectedRecord?.variableAllowance?._id,
          amount: this.selectedRecord?.amount,
          month: this.selectedRecord?.month,
          year: this.selectedRecord?.year
        });
        this.variablePayForm.get('payrollUser').disable();
        this.variablePayForm.get('month').disable();
        this.variablePayForm.get('year').disable();
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

  getSalarydetailsByUser() {
    this.userService.getSalaryByUserId(this.selectedUserId || this.payrollUser?.user).subscribe((res: any) => {
      this.salary = res.data[res.data.length - 1];
    })
  }

  onUserSelectedFromChild(userId: any) {
    this.selectedUserId = userId.value.user;
    this.selectedPayrollUser = userId.value._id;
    if (this.changeMode === 'Add') { this.getSalarydetailsByUser(); }
    if (this.changeMode === 'Update') { this.getVariablePay(); }
  }

  getVariablePay() {
    this.payrollService.getVariablePay(this.selectedRecord?.payrollUser).subscribe((res: any) => {
      this.variablePay = res.data;
      const userRequests = this.variablePay.map((item: any) => {
        const payrollUser = this.payrollUsers?.find((user: any) => user._id === item.payrollUser);
        return {
          ...item,
          payrollUserDetails: payrollUser ? this.getUser(payrollUser.user) : null
        };
      });
      this.variablePay = userRequests
    },
      (error) => {
        this.toast.error("Error fetching Variable Pay:", error);
      }
    );
  }

  getVariablePayByPayroll() {
    this.payrollService.getVariablePayByPayroll(this.selectedPayroll?._id).subscribe((res: any) => {
      this.variablePay = res.data;
      const userRequests = this.variablePay.map((item: any) => {
        const payrollUser = this.payrollUsers?.find((user: any) => user._id === item.payrollUser);
        return {
          ...item,
          payrollUserDetails: payrollUser ? this.getUser(payrollUser.user) : null
        };
      });
      this.variablePay = userRequests
    },
      (error) => {
        this.toast.error("Error fetching attendance summary:", error);
      })
  }

  getVariableDeductionAndAllowance() {
    let payload = { skipe: '', next: '' }
    this.payrollService.getVariableAllowance(payload).subscribe((res: any) => { this.varAllowance = res.data });
    this.payrollService.getVariableDeduction(payload).subscribe((res: any) => { this.varDeduction = res.data });
  }

  getVariableAllowance(templateId: string) {
    const matchingTemp = this.varAllowance?.find(temp => temp._id === templateId);
    return matchingTemp ? matchingTemp.label : '';
  }

  getVariableDeduction(templateId: string) {
    const matchingTemp = this.varDeduction?.find(temp => temp._id === templateId);
    return matchingTemp ? matchingTemp.label : '';
  }

  onSubmit() {
    this.variablePayForm.get('month').enable();
    this.variablePayForm.get('year').enable();
    this.variablePayForm.get('payrollUser').enable();
    this.variablePayForm.patchValue({
      payrollUser: this.selectedPayrollUser,
      month: this.selectedPayroll.month,
      year: this.selectedPayroll.year
    });

    if (this.changeMode == 'Add') {
      this.payrollService.addVariablePay(this.variablePayForm.value).subscribe((res: any) => {
        this.variablePay = res.data;
        this.getVariablePay();
        this.variablePayForm.reset();
        this.toast.success('Variable Pay Added', 'Successfully!');
        this.changeMode = 'Update'
        this.closeDialog();
      },
        err => {
          this.toast.error('Variable Pay can not be Added', 'Error!');
        });
    }
    if (this.changeMode == 'Update') {
      // Update API call
      let id = this.selectedRecord._id;
      this.payrollService.updateVariablePay(id, this.variablePayForm.value).subscribe((res: any) => {
        this.getVariablePay();
        this.variablePayForm.reset();
        this.changeMode = 'Update';
        this.toast.success('Variable Pay Updated', 'Successfully!');
        this.closeDialog();
      },
        err => {
          this.toast.error('Variable Pay can not be Updated', 'Error!');
        });
    }
    this.variablePayForm.get('month').disable();
    this.variablePayForm.get('year').disable();
  }

  deleteTemplate(_id: string) {
    this.payrollService.deleteVariablePay(_id).subscribe((res: any) => {
      this.getVariablePay();
      this.toast.success('Successfully Deleted!!!', 'Variable Pay')
    },
      (err) => {
        this.toast.error('This Variable Pay Can not be deleted!')
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

  getAllUsers() {
    this.commonService.populateUsers().subscribe((res: any) => {
      this.allUsers = res.data.data;
    })
  }

  getUser(employeeId: string) {
    const matchingUser = this.allUsers?.find(user => user?._id === employeeId);
    return matchingUser ? `${matchingUser.firstName} ${matchingUser.lastName}` : 'N/A';
  }

}