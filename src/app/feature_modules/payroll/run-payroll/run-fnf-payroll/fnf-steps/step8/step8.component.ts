import { Component, OnInit, ViewChild, TemplateRef, Input } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { PayrollService } from 'src/app/_services/payroll.service';
import { ToastrService } from 'ngx-toastr';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';
import { UserService } from 'src/app/_services/users.service';

@Component({
  selector: 'app-step8',
  templateUrl: './step8.component.html',
  styleUrls: ['./step8.component.css']
})
export class FNFStep8Component implements OnInit {
  displayedColumns: string[] = ['userName', 'taxCalculatedMethod', 'taxCalculated', 'tdsCalculated'];
  incomeTax = new MatTableDataSource<any>();
  incomeTaxForm: FormGroup;
  selectedIncomeTax: any;
  userList: any[] = [];
  fnfUsers: any;
  isEdit: boolean = false;
  @ViewChild('dialogTemplate') dialogTemplate: TemplateRef<any>;
  @Input() settledUsers: any[];
  @Input() isSteps: boolean;
  @Input() selectedFnF: any;
  selectedFNFUser: any;

  constructor(private fb: FormBuilder,
    private payrollService: PayrollService,
    public dialog: MatDialog,
    private userService: UserService,
    private toast: ToastrService) {
    this.incomeTaxForm = this.fb.group({
      PayrollFNFUser: ['', Validators.required],
      TaxCalculatedMethod: ['', Validators.required],
      TaxCalculated: [0, Validators.required],
      TDSCalculated: [0, Validators.required]
    });
  }

  ngOnInit(): void {
    this.fetchIncomeTax(this.selectedFnF);
  }
  onUserSelectedFromChild(user: any): void {
    const matchedUser = this.selectedFnF?.userList.find((res: any) => res?.user === user);
    this.selectedFNFUser = matchedUser ? matchedUser?._id : null;

    this.userService.CalculateFNFTDSAmountByUserId(user).subscribe((res: any) => {
      this.incomeTaxForm.patchValue({
        TaxCalculatedMethod: res.data.regime,
        TaxCalculated: res.data.yearlyTDS,
        TDSCalculated: res.data.fnfDaysTDS
      });
    }, err => {
      this.toast.error('Payroll Income Tax Can not be Added', 'Error!');
    });
  }
  onUserChange(fnfUserId: string): void {
    const matchedUser = this.selectedFnF.userList.find((user: any) => user.user === fnfUserId);
    const payrollFNFUserId = matchedUser ? matchedUser._id : null;

    this.selectedFNFUser = payrollFNFUserId;
    if (payrollFNFUserId) {
      this.payrollService.getFnFIncomeTaxByPayrollFnFUser(payrollFNFUserId).subscribe((res: any) => {
        this.incomeTax.data = res.data['records'];
        this.incomeTax.data.forEach((incomeTax: any) => {
          const user = this.settledUsers.find(user => user._id === fnfUserId);
          incomeTax.userName = user ? `${user.firstName} ${user.lastName}` : 'Unknown User';
        });
      });
    }
  }

  getMatchedSettledUser(userId: string) {
    const matchedUser = this.settledUsers?.find(user => user?._id == userId)
    return matchedUser ? `${matchedUser?.firstName}  ${matchedUser?.lastName}` : 'Not specified'
  }

  fetchIncomeTax(fnfPayroll: any): void {
    this.payrollService.getFnFIncomeTaxByPayrollFnF(fnfPayroll?._id).subscribe(
      (res: any) => {
        this.incomeTax.data = res.data;

        this.incomeTax.data.forEach((item: any) => {
          const matchedUser = this.selectedFnF.userList.find((user: any) => user._id === item.PayrollFNFUser);
          item.userName = this.getMatchedSettledUser(matchedUser?.user);
        });
        if (this.isEdit && this.selectedIncomeTax) {
          this.incomeTaxForm.patchValue({
            payrollFNFUser: this.selectedIncomeTax.PayrollFNFUser,
            ...this.selectedIncomeTax,
          });
        }
      },
      (error: any) => {
        this.toast.error('Failed to fetch Income Tax', 'Error');
      }
    );
  }

  getUserName(userId: string): string {
    const user = this.userList.find(user => user._id === userId);
    return user ? `${user.firstName} ${user.lastName}` : 'Unknown User';
  }
}
