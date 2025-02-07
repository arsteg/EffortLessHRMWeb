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

  onUserSelectedFromChild(userId: any) {
    this.selectedUserId = userId.value.user;
    this.selectedPayrollUser = userId.value._id;
    if (this.changeMode === 'View') { this.getAttendanceSummary(userId?.value._id); }
    if (this.changeMode === 'Add') { this.getProcessAttendanceLOPForPayrollUser(); }
  }

  openDialog() {
    if (this.changeMode == 'View') {
      this.attendanceSummaryForm.patchValue({
        totalDays: this.selectedRecord?.totalDays,
        lopDays: this.selectedRecord?.lopDays,
        payableDays: this.selectedRecord?.payableDays
      });
      this.attendanceSummaryForm.get('payrollUser').disable();
    } else {
      this.attendanceSummaryForm.reset({
        payrollUser: '',
        totalDays: 0,
        lopDays: 0,
        payableDays: 0
      });
      this.attendanceSummaryForm.get('payrollUser').enable();
    }
    this.dialog.open(this.dialogTemplate, {
      width: '600px',
      disableClose: true
    });
  }

  closeDialog() {
    this.dialog.closeAll();
  }

  getUser(employeeId: string) {
    const matchingUser = this.allUsers?.find(user => user._id === employeeId);
    return matchingUser ? `${matchingUser.firstName} ${matchingUser.lastName}` : 'N/A';
  }

  getAttendanceSummary(userId: string) {
    this.payrollService.getAttendanceSummary(userId).subscribe(
      (res: any) => {
        this.attendanceSummary = res.data;
        const userRequests = this.attendanceSummary.map((item: any) => {
          const payrollUser = this.payrollUsers.find((user: any) => user._id === item.payrollUser);
          return {
            ...item,
            payrollUserDetails: this.getUser(payrollUser?.user)
          };
        });

        this.attendanceSummary = userRequests;
      },
      (error) => {
        console.error("Error fetching attendance summary:", error);
      }
    );
  }


  onSubmission() {
    if (this.attendanceSummaryForm.invalid) {
      this.attendanceSummaryForm.markAllAsTouched();
      return;
    }
    this.attendanceSummaryForm.patchValue({
      payrollUser: this.selectedPayrollUser
    });
    const formData = this.attendanceSummaryForm.value;

    const existingRecord = this.attendanceSummary.find(
      (record: any) =>
        record.payrollUser === this.selectedPayrollUser &&
        record.month === formData.month &&
        record.year === formData.year
    );

    if (existingRecord) {
      this.toast.warning(
        'Attendance summary for the selected payroll user, month, and year already exists.',
        'Duplicate Record!'
      );
      return;
    }

    if (this.changeMode === 'Add') {
      this.payrollService.addAttendanceSummary(formData).subscribe(
        (res: any) => {
          this.getAttendanceSummaryByPayroll();
          this.attendanceSummaryForm.enable();
          this.changeMode = 'View';
          this.attendanceSummaryForm.patchValue({
            payrollUser: '',
            totalDays: 0,
            lopDays: 0,
            payableDays: 0,
          });

          this.toast.success(
            'Attendance summary for payroll user created successfully!',
            'Success!'
          );
          this.closeDialog();
        },
        (err) => {
          this.toast.error(
            'Attendance summary for payroll user could not be created.',
            'Error!'
          );
        }
      );
    }
  }

  getMonthNumber(monthName: string): number {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return months.indexOf(monthName) + 1;
  }

  getTotalDaysInMonth(year: number, month: number): number {
    return new Date(year, month, 0).getDate();
  }

  getProcessAttendanceLOPForPayrollUser() {
    let payload = {
      skip: '',
      next: '',
      month: this.getMonthNumber(this.selectedPayroll.month) || this.selectedPayroll.month,
      year: this.selectedPayroll.year
    };

    this.attendanceService.getProcessAttendanceLOPByMonth(payload).subscribe((res: any) => {
      this.attendanceLOPUser = res.data;
      const matchingUsers = this.attendanceLOPUser.filter((lop: any) => lop.user === this.selectedUserId?.user);

      const lopUserLength = matchingUsers.length;
      const payableDays = this.getTotalDaysInMonth(payload.year, payload.month) - lopUserLength;

      this.attendanceSummaryForm.patchValue({
        lopDays: lopUserLength,
        payableDays: payableDays,
        totalDays: this.getTotalDaysInMonth(payload.year, payload.month)
      });
      this.attendanceSummaryForm.disable();
    });
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
