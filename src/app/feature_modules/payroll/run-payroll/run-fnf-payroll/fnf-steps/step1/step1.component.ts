import { Component, OnInit, ViewChild, TemplateRef, Input } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { PayrollService } from 'src/app/_services/payroll.service';
import { ToastrService } from 'ngx-toastr';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';
import { UserService } from 'src/app/_services/users.service';
import { AttendanceService } from 'src/app/_services/attendance.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-step1',
  templateUrl: './step1.component.html',
  styleUrls: ['./step1.component.css']
})
export class FNFStep1Component implements OnInit {
  displayedColumns: string[] = ['payrollFNFUser', 'totalDays', 'lopDays', 'payableDays', 'leaveEncashmentDays', 'leaveBalance', 'adjustedPayableDays', 'overtimeHours', 'actions'];
  attendanceSummary = new MatTableDataSource<any>();
  attendanceSummaryForm: FormGroup;
  selectedAttendanceSummary: any;
  userList: any[] = [];
  fnfUsers: any;
  isEdit: boolean = false;
  fnfPayroll: any;
  selectedUserId: any;
  attendanceLOPUser: any;
  isStep: boolean;
  action: boolean = false;
  // settledUsers: any[];
  @Input() settledUsers: any[];
  @Input() fnfPayrollRecord: any;
  @Input() isSteps: boolean;

  @ViewChild('dialogTemplate') dialogTemplate: TemplateRef<any>;

  constructor(private fb: FormBuilder,
    private payrollService: PayrollService,
    public dialog: MatDialog,
    private toast: ToastrService,
    private attendanceService: AttendanceService,
    private userService: UserService
  ) {
    this.attendanceSummaryForm = this.fb.group({
      payrollFNFUser: ['', Validators.required],
      totalDays: [0, Validators.required],
      lopDays: [0, Validators.required],
      payableDays: [0, Validators.required],
      leaveEncashmentDays: [0, Validators.required],
      leaveBalance: [0, Validators.required],
      adjustedPayableDays: [0, Validators.required],
      adjustmentReason: ['', Validators.required],
      overtimeHours: [0, Validators.required],
      adjustmentDetails: this.fb.array([this.createAdjustmentDetail()])
    });
  }

  ngOnInit(): void {
    this.fetchAttendanceSummary(this.fnfPayrollRecord);
  }

  onUserChange(fnfUserId: string): void {
    this.selectedUserId = fnfUserId;
    if (this.action) {
      this.getProcessAttendanceLOPForPayrollUser();
    }
    const fnfUser = this.fnfPayrollRecord;

    const matchedUser = this.fnfPayrollRecord.userList.find((user: any) => user.user === this.selectedUserId);
    const payrollFNFUserId = matchedUser ? matchedUser._id : null;

    this.payrollService.getFnFAttendanceSummaryByFnFUserId(payrollFNFUserId).subscribe((res: any) => {
      this.attendanceSummary.data = res.data;
      this.attendanceSummary.data.forEach((summary: any) => {
        const user = this.settledUsers.find(user => user._id === fnfUser);
        summary.userName = user ? `${user.firstName} ${user.lastName}` : 'Unknown User';
      });
    });
  }

  get adjustmentDetails(): FormArray {
    return this.attendanceSummaryForm.get('adjustmentDetails') as FormArray;
  }

  createAdjustmentDetail(): FormGroup {
    return this.fb.group({
      reason: ['', Validators.required],
      amountAdjusted: [0, Validators.required],
      date: ['', Validators.required]
    });
  }

  addAdjustmentDetail(): void {
    this.adjustmentDetails.push(this.createAdjustmentDetail());
  }

  removeAdjustmentDetail(index: number): void {
    this.adjustmentDetails.removeAt(index);
  }

  openDialog(isEdit: boolean): void {
    this.isEdit = isEdit;
    this.action = true;
    this.dialog.open(this.dialogTemplate, {
      width: '50%',
      panelClass: 'custom-dialog-container',
      disableClose: true
    });
  }

  editAttendanceSummary(attendanceSummary: any): void {
    this.isEdit = true;
    this.action = true;
    this.selectedAttendanceSummary = attendanceSummary;

    this.attendanceSummaryForm.patchValue({
      payrollFNFUser: attendanceSummary.payrollFNFUser,
      totalDays: attendanceSummary.totalDays,
      lopDays: attendanceSummary.lopDays,
      payableDays: attendanceSummary.payableDays,
      leaveEncashmentDays: attendanceSummary.leaveEncashmentDays,
      leaveBalance: attendanceSummary.leaveBalance,
      adjustedPayableDays: attendanceSummary.adjustedPayableDays,
      adjustmentReason: attendanceSummary.adjustmentReason,
      overtimeHours: attendanceSummary.overtimeHours
    });

    this.attendanceSummaryForm.get('payrollFNFUser').disable();

    this.adjustmentDetails.clear();
    attendanceSummary.adjustmentDetails.forEach((detail: any) => {
      const detailGroup = this.createAdjustmentDetail();
      detailGroup.patchValue(detail);
      this.adjustmentDetails.push(detailGroup);
    });
    this.openDialog(true);
  }

  onSubmit(): void {

    const matchedUser = this.fnfPayrollRecord.userList.find((user: any) => user.user === this.selectedUserId);
    const payrollFNFUserId = matchedUser ? matchedUser._id : null;
    this.attendanceSummaryForm.get('payrollFNFUser').enable();

    this.attendanceSummaryForm.patchValue({
      payrollFNFUser: payrollFNFUserId
    });


    if (this.attendanceSummaryForm.valid) {
      const payload = this.attendanceSummaryForm.value;

      if (this.selectedAttendanceSummary) {
        this.payrollService.updateFnFAttendanceSummary(this.selectedAttendanceSummary._id, payload).subscribe(
          (res: any) => {
            this.toast.success('Attendance Summary updated successfully', 'Success');
            this.dialog.closeAll();
            this.fetchAttendanceSummary(this.selectedAttendanceSummary.fnfPayrollId);
          },
          (error: any) => {
            this.toast.error('Failed to update Attendance Summary', 'Error');
          }
        );
      } else {
        this.payrollService.addFnFAttendanceSummary(payload).subscribe(
          (res: any) => {
            this.toast.success('Attendance Summary added successfully', 'Success');
            this.dialog.closeAll();
            this.fetchAttendanceSummary(this.fnfPayrollRecord._id);
          },
          (error: any) => {
            this.toast.error('Failed to add Attendance Summary', 'Error');
          }
        );
      }
    } else {
      this.attendanceSummaryForm.markAllAsTouched();
    }
  }

  onCancel(): void {
    if (this.isEdit && this.selectedAttendanceSummary) {
      this.attendanceSummaryForm.patchValue({
        payrollFNFUser: this.selectedAttendanceSummary.payrollFNFUser,
        totalDays: this.selectedAttendanceSummary.totalDays,
        lopDays: this.selectedAttendanceSummary.lopDays,
        payableDays: this.selectedAttendanceSummary.payableDays,
        leaveEncashmentDays: this.selectedAttendanceSummary.leaveEncashmentDays,
        leaveBalance: this.selectedAttendanceSummary.leaveBalance,
        adjustedPayableDays: this.selectedAttendanceSummary.adjustedPayableDays,
        adjustmentReason: this.selectedAttendanceSummary.adjustmentReason,
        overtimeHours: this.selectedAttendanceSummary.overtimeHours
      });

      this.adjustmentDetails.clear();
      this.selectedAttendanceSummary.adjustmentDetails.forEach((detail: any) => {
        const detailGroup = this.createAdjustmentDetail();
        detailGroup.patchValue(detail);
        this.adjustmentDetails.push(detailGroup);
      });
    } else {
      this.attendanceSummaryForm.reset();
    }
  }

  deleteRecord(_id: string) {
    this.payrollService.deleteFnFAttendanceSummary(_id).subscribe((res: any) => {
      this.fetchAttendanceSummary(this.fnfPayrollRecord);
      this.toast.success('Attendance Summary Deleted', 'Success');
    }, error => {
      this.toast.error('Failed to delete Attendance Summary', 'Error');
    });
  }

  deleteDialog(id: string): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'delete') {
        this.deleteRecord(id);
      }
    });
  }

  getMatchedSettledUser(userId: string) {
    const matchedUser = this.settledUsers?.find(user => user?._id == userId)
    return matchedUser ? `${matchedUser?.firstName}  ${matchedUser?.lastName}` : 'Not specified'
  }

  fetchAttendanceSummary(fnfPayroll: any): void {
    this.payrollService.getFnFAttendanceSummary(this.fnfPayrollRecord?._id).subscribe(
      (res: any) => {
        this.attendanceSummary.data = res.data;
        const matchedUser = this.fnfPayrollRecord.userList.find(
          (user: any) => this.attendanceSummary.data.some((summary: any) => summary.payrollFNFUser === user._id)
        );

        if (matchedUser) {
          const payrollFNFUserName = matchedUser.user
console.log(payrollFNFUserName)
          this.attendanceSummary.data.forEach((item: any) => {
            item.payrollFNFUser = this.getMatchedSettledUser(payrollFNFUserName);
          });
        }
      },
      (error: any) => {
        this.toast.error('Failed to fetch Attendance Summary', 'Error');
      }
    );
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
      year: this.fnfPayrollRecord.year,
      month: this.getMonthNumber(this.fnfPayrollRecord.month).toString()
    }

    this.attendanceService.getProcessAttendanceLOPByMonth(payload).subscribe((res: any) => {
      this.attendanceLOPUser = res.data;
      const matchingUsers = this.attendanceLOPUser.filter((lop: any) => lop.user === this.selectedUserId?.user);

      const lopUserLength = matchingUsers.length;
      const payableDays = this.getTotalDaysInMonth(payload.year, this.fnfPayrollRecord.month) - lopUserLength;

      this.attendanceSummaryForm.patchValue({
        lopDays: lopUserLength,
        payableDays: payableDays,
        totalDays: this.getTotalDaysInMonth(payload.year, this.fnfPayrollRecord.month)
      });
    })
  }

}