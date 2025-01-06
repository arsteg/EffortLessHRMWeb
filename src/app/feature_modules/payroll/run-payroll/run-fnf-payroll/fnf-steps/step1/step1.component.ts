import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { PayrollService } from 'src/app/_services/payroll.service';
import { ToastrService } from 'ngx-toastr';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';
import { CommonService } from 'src/app/_services/common.Service';
import { UserService } from 'src/app/_services/users.service';
import { AttendanceService } from 'src/app/_services/attendance.service';

@Component({
  selector: 'app-step1',
  templateUrl: './step1.component.html',
  styleUrls: ['./step1.component.css']
})
export class FNFStep1Component implements OnInit {
  displayedColumns: string[] = ['payrollUser', 'totalDays', 'lopDays', 'payableDays', 'leaveEncashmentDays', 'leaveBalance', 'adjustedPayableDays', 'overtimeHours', 'actions'];
  attendanceSummary = new MatTableDataSource<any>();
  attendanceSummaryForm: FormGroup;
  selectedAttendanceSummary: any;
  userList: any[] = [];
  fnfUsers: any;
  isEdit: boolean = false;
  fnfPayroll: any;
  selectedUserId: any;
  attendanceLOPUser: any;

  @ViewChild('dialogTemplate') dialogTemplate: TemplateRef<any>;

  constructor(private fb: FormBuilder,
    private payrollService: PayrollService,
    private commonService: CommonService,
    public dialog: MatDialog,
    private toast: ToastrService,
    private attendanceService: AttendanceService
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
    this.commonService.populateUsers().subscribe((res: any) => {
      this.userList = res.data['data'];
    });

    this.payrollService.selectedFnFPayroll.subscribe((fnfPayroll: any) => {
      this.fnfPayroll = fnfPayroll;
      if (fnfPayroll) {
        this.fetchAttendanceSummary(fnfPayroll);
      }
    });
  }

  onUserChange(fnfUserId: string): void {
    this.selectedUserId = fnfUserId;
    // this.getAttendanceSummary();
    this.getProcessAttendanceLOPForPayrollUser();

    this.payrollService.selectedFnFPayroll.subscribe((fnfPayroll: any) => {
      const fnfUser = fnfPayroll.userList[0].user;

      this.payrollService.getFnFAttendanceSummaryByFnFUserId(fnfUserId).subscribe((res: any) => {
        this.attendanceSummary.data = res.data;
        this.attendanceSummary.data.forEach((summary: any) => {
          const user = this.userList.find(user => user._id === fnfUser);
          summary.userName = user ? `${user.firstName} ${user.lastName}` : 'Unknown User';
        });
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
    this.dialog.open(this.dialogTemplate, {
      width: '50%',
      panelClass: 'custom-dialog-container',
      disableClose: true
    });
  }

  editAttendanceSummary(attendanceSummary: any): void {
    this.isEdit = true;
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

    this.adjustmentDetails.clear();
    attendanceSummary.adjustmentDetails.forEach((detail: any) => {
      const detailGroup = this.createAdjustmentDetail();
      detailGroup.patchValue(detail);
      this.adjustmentDetails.push(detailGroup);
    });
    this.openDialog(true);
  }

  onSubmit(): void {
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
            this.fetchAttendanceSummary(payload.fnfPayrollId);
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

  deleteAttendanceSummary(_id: string) {
    this.payrollService.deleteFnFAttendanceSummary(_id).subscribe((res: any) => {
      this.toast.success('Attendance Summary Deleted', 'Success');
      this.fetchAttendanceSummary(this.selectedAttendanceSummary.fnfPayrollId);
    }, error => {
      this.toast.error('Failed to delete Attendance Summary', 'Error');
    });
  }

  deleteFnF(id: string): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, { width: '400px', });
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'delete') { this.deleteAttendanceSummary(id); }
    });
  }

  fetchAttendanceSummary(fnfPayroll: any): void {
    const fnfUser = fnfPayroll.userList[0].user;
    this.payrollService.getFnFAttendanceSummary(fnfPayroll._id).subscribe(
      (res: any) => {
        this.attendanceSummary.data = res.data;
        this.attendanceSummary.data.forEach((summary: any, index: number) => {
          const user = this.userList.find(user => user._id === fnfUser);
          summary.userName = user ? `${user.firstName} ${user.lastName}` : 'Unknown User';
        });
      },
      (error: any) => {
        this.toast.error('Failed to fetch Attendance Summary', 'Error');
      }
    );
  }

  getUserName(userId: string): string {
    const user = this.userList.find(user => user._id === userId);
    return user ? `${user.firstName} ${user.lastName}` : 'Unknown User';
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
      month: this.fnfPayroll.month,
      year: this.fnfPayroll.year
    }

    this.attendanceService.getProcessAttendanceLOPByMonth(payload).subscribe((res: any) => {
      this.attendanceLOPUser = res.data;
      const matchingUsers = this.attendanceLOPUser.filter((lop: any) => lop.user === this.selectedUserId?.user);

      // Get the length of the matching users
      const lopUserLength = matchingUsers.length;
      const payableDays = this.getTotalDaysInMonth(payload.year, payload.month) - lopUserLength;

      this.attendanceSummaryForm.patchValue({
        lopDays: lopUserLength,
        payableDays: payableDays,
        totalDays: this.getTotalDaysInMonth(payload.year, payload.month)
      });
      this.attendanceSummaryForm.disable();
    })
  }

}