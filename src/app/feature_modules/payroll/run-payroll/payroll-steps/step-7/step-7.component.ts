import { Component, inject, Input, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { PayrollService } from 'src/app/_services/payroll.service';
import { TableColumn } from 'src/app/models/table-column';

@Component({
  selector: 'app-step-7',
  templateUrl: './step-7.component.html',
  styleUrl: './step-7.component.css'
})
export class Step7Component {
  searchText: string = '';
  closeResult: string = '';
  changeMode: 'Add' | 'Update' = 'Update';
  overtime: any;
  overtimeForm: FormGroup;
  allUsers: any;
  selectedUserId: any;
  selectedRecord: any;
  payrollUser: any;
  payrollUsers: any;
  @Input() selectedPayroll: any;
  overtimeInformation: any;
  overtimeRecords: any;
  selectedPayrollUser: any;
  @ViewChild('dialogTemplate') dialogTemplate: TemplateRef<any>;
  private readonly translate = inject(TranslateService);

  columns: TableColumn[] = [
    { key: 'payrollUserDetails', name: this.translate.instant('payroll.employee_name') },
    { key: 'LateComing', name: this.translate.instant('payroll.late_coming') },
    { key: 'EarlyGoing', name: this.translate.instant('payroll.early_going') },
    { key: 'FinalOvertime', name: this.translate.instant('payroll.final_overtime'), valueFn: (row) => (row.FinalOvertime / 60).toFixed(2) },
    { key: 'OvertimePayableSalary', name: this.translate.instant('payroll.overtime_amount'), valueFn: (row) => row.OvertimeAmount ? row.OvertimeAmount.toFixed(2) : '0.00' },
  ]
  constructor(
    private payrollService: PayrollService,
    private fb: FormBuilder
  ) {
    this.overtimeForm = this.fb.group({
      PayrollUser: ['', Validators.required],
      LateComing: ['', Validators.required],
      EarlyGoing: ['', Validators.required],
      FinalOvertime: ['', Validators.required],
      OvertimeAmount: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.payrollService.allUsers.subscribe(res => {
      this.allUsers = res;
    });
    this.payrollService.payrollUsers.subscribe(res => {
      this.payrollUsers = res;
    });
    this.getOvertimeByPayroll();
  }
  getUser(employeeId: string) {
    const matchingUser = this.allUsers?.find(user => user._id === employeeId);
    return matchingUser ? `${matchingUser.firstName} ${matchingUser.lastName}` : 'N/A';
  }
  getOvertimeByPayroll() {
    this.payrollService.getOvertimeByPayroll(this.selectedPayroll?._id).subscribe((res: any) => {
      this.overtime = res.data;
      const userRequests = this.overtime.map((item: any) => {
        const payrollUser = this.payrollUsers?.find((user: any) => user._id === item.PayrollUser);
        return {
          ...item,
          payrollUserDetails: payrollUser ? this.getUser(payrollUser.user) : null
        };
      });
      this.overtime = userRequests;
    });
  }
}