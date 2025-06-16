import { Component, Input, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { forkJoin, map } from 'rxjs';
import { AttendanceService } from 'src/app/_services/attendance.service';
import { CommonService } from 'src/app/_services/common.Service';
import { PayrollService } from 'src/app/_services/payroll.service';
import { UserService } from 'src/app/_services/users.service';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';

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