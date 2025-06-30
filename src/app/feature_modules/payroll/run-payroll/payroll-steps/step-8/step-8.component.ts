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
import { TableColumn } from 'src/app/models/table-column';

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
  columns: TableColumn[] = [
    { key: 'payrollUserDetails', name: 'Employee Name' },
    { key: 'TaxCalculatedMethod', name: 'Tax Calculation Method' },
    { key: 'TaxCalculated', name: 'Tax Calculation By EffortlessHRM (Yearly)' },
    { key: 'TDSCalculated', name: 'TDS to be Deducted (Monthly)', }
  ]

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
}