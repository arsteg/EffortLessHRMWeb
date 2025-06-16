import { Component, Input, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { AttendanceService } from 'src/app/_services/attendance.service';
import { PayrollService } from 'src/app/_services/payroll.service';

@Component({
  selector: 'app-step-2',
  templateUrl: './step-2.component.html',
  styleUrl: './step-2.component.css'
})
export class Step2Component {
  searchText: string = '';
  attendanceSummaryForm: FormGroup;
  @Input() selectedPayroll: any;
  attendanceSummary: any;
  changeMode: 'Add' | 'View' = 'View';
  selectedUserId: any;
  selectedRecord: any;
  payrollUsers: any;
  attendanceLOPUser: any;
  selectedPayrollUser: string;
  allUsers: any[] = [];
  @ViewChild('dialogTemplate') dialogTemplate: TemplateRef<any>;

  constructor(private payrollService: PayrollService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private toast: ToastrService,
    private attendanceService: AttendanceService
  ) {
    this.attendanceSummaryForm = this.fb.group({
      payrollUser: ['', Validators.required],
      totalDays: [0, Validators.required],
      lopDays: [0, Validators.required],
      payableDays: [0, Validators.required]
    });
  }

  ngOnInit() {
    this.payrollService.allUsers.subscribe(res => {
      this.allUsers = res;
    });
    this.payrollService.payrollUsers.subscribe(res => {
      this.payrollUsers = res;
    });

    this.getAttendanceSummaryByPayroll();
  } 

  getUser(employeeId: string) {
    const matchingUser = this.allUsers?.find(user => user._id === employeeId);
    return matchingUser ? `${matchingUser.firstName} ${matchingUser.lastName}` : 'N/A';
  }

  getMonthNumber(monthName: string): number {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return months.indexOf(monthName) + 1;
  }

  getTotalDaysInMonth(year: number, month: number): number {
    return new Date(year, month, 0).getDate();
  }
 

  getAttendanceSummaryByPayroll() {
    this.payrollService.getAttendanceSummaryBypayroll(this.selectedPayroll?._id).subscribe((res: any) => {
      this.attendanceSummary = res.data;

      const userRequests = this.attendanceSummary.map((item: any) => {
        const payrollUser = this.payrollUsers?.find((user: any) => user._id === item.payrollUser);

        return {
          ...item,
          payrollUserDetails: payrollUser ? this.getUser(payrollUser.user) : null
        };
      });
      this.attendanceSummary = userRequests;
    },
      (error) => {
        console.error("Error fetching attendance summary:", error);
      });
  }
}
