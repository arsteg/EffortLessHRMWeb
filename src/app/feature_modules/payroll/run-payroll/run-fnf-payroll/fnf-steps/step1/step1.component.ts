import { Component, OnInit, ViewChild, TemplateRef, Input } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { PayrollService } from 'src/app/_services/payroll.service';
import { ToastrService } from 'ngx-toastr';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';
import { AttendanceService } from 'src/app/_services/attendance.service';
import { SeparationService } from 'src/app/_services/separation.service';

@Component({
  selector: 'app-step1',
  templateUrl: './step1.component.html',
  styleUrls: ['./step1.component.css']
})
export class FNFStep1Component implements OnInit {
  displayedColumns: string[] = ['userName', 'totalDays', 'lopDays', 'payableDays', 'leaveEncashmentDays', 'leaveBalance', 'adjustedPayableDays', 'actions'];
  attendanceSummary = new MatTableDataSource<any>();
  attendanceSummaryForm: FormGroup;
  selectedAttendanceSummary: any;
  isEdit: boolean = false;
  selectedUserId: any;
  attendanceLOPUser: any;
  action: boolean = false;
  @Input() settledUsers: any[];
  @Input() isSteps: boolean;
  @Input() selectedFnF: any;

  @ViewChild('dialogTemplate') dialogTemplate: TemplateRef<any>;

  constructor(private fb: FormBuilder,
    private payrollService: PayrollService,
    public dialog: MatDialog,
    private toast: ToastrService,
    private attendanceService: AttendanceService,
  ) {
    this.attendanceSummaryForm = this.fb.group({
      payrollFNFUser: ['', Validators.required],
      payrollFnf: [''],
      totalDays: [{ value: 0, disabled: true }, Validators.required],
      lopDays:   [{ value: 0, disabled: true }, Validators.required],
      payableDays: [{ value: 0, disabled: true }, Validators.required],
      leaveEncashmentDays: [0, Validators.required],
      leaveBalance: [0, Validators.required],
      adjustedPayableDays: [0, Validators.required],
      adjustmentReason: ['', Validators.required],
      adjustmentDetails: this.fb.array([this.createAdjustmentDetail()])
    });
  }

  ngOnInit(): void {
    this.fetchAttendanceSummary(this.selectedFnF);
    this.attendanceSummaryForm.get('payableDays').valueChanges.subscribe(() => this.updateAdjustedPayableDays());
  this.attendanceSummaryForm.get('leaveEncashmentDays').valueChanges.subscribe(() => this.updateAdjustedPayableDays());
  this.attendanceSummaryForm.get('leaveBalance').valueChanges.subscribe(() => this.updateAdjustedPayableDays());
  }

  private updateAdjustedPayableDays(): void {
    const payableDays = Number(this.attendanceSummaryForm.get('payableDays').value) || 0;
    const leaveEncashmentDays = Number(this.attendanceSummaryForm.get('leaveEncashmentDays').value) || 0;
    const leaveBalance = Number(this.attendanceSummaryForm.get('leaveBalance').value) || 0;
  
    const adjustedPayableDays = payableDays + leaveEncashmentDays + leaveBalance;
  
    this.attendanceSummaryForm.get('adjustedPayableDays').setValue(adjustedPayableDays, { emitEvent: false });
  }
  onUserChange(fnfUserId: string): void {
    this.selectedUserId = fnfUserId;

    const matchedUser = this.selectedFnF.userList.find((user: any) => user.user === this.selectedUserId);
    const payrollFNFUserId = matchedUser ? matchedUser._id : null;

    this.payrollService.getAttendanceRecordsByUserAndPayroll({ payrollFNFUser: payrollFNFUserId, payrollFNF: this.selectedFnF?._id }).subscribe((res: any) => {
      console.log(res.data);
      this.attendanceSummaryForm.patchValue({
        totalDays: res.data.TotalDays,
        lopDays: res.data.lopDays,
        payableDays: res.data.payableDays,
        leaveBalance: res.data.leaveBalance
      })
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
    if (!isEdit) {
      this.attendanceSummaryForm.reset({
        payrollFNFUser: '',
        totalDays: 0,
        lopDays: 0,
        payableDays: 0,
        leaveEncashmentDays: 0,
        leaveBalance: 0,
        adjustedPayableDays: 0,
        adjustmentReason: 0,
      });
    }
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
      payrollFNFUser: attendanceSummary.userName,
      totalDays: attendanceSummary.totalDays,
      lopDays: attendanceSummary.lopDays,
      payableDays: attendanceSummary.payableDays,
      leaveEncashmentDays: attendanceSummary.leaveEncashmentDays,
      leaveBalance: attendanceSummary.leaveBalance,
      adjustedPayableDays: attendanceSummary.adjustedPayableDays,
      adjustmentReason: attendanceSummary.adjustmentReason
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
    const matchedUser = this.selectedFnF.userList.find((user: any) => user.user === this.selectedUserId);
    const payrollFNFUserId = matchedUser ? matchedUser._id : null;

    this.attendanceSummaryForm.patchValue({
      payrollFNFUser: payrollFNFUserId,
      payrollFnf: this.selectedFnF?._id,
    });

    if (this.attendanceSummaryForm.valid) {
      this.attendanceSummaryForm.get('payrollFNFUser').enable();

      if (this.isEdit) {
        this.attendanceSummaryForm.patchValue({
          payrollFNFUser: this.selectedAttendanceSummary.payrollFNFUser
        });
        this.payrollService.updateFnFAttendanceSummary(this.selectedAttendanceSummary._id, this.attendanceSummaryForm.value).subscribe(
          (res: any) => {
            this.toast.success('Attendance Summary updated successfully', 'Success');
            this.fetchAttendanceSummary(this.selectedFnF);
            this.attendanceSummaryForm.reset({
              payrollFNFUser: '',
              totalDays: 0,
              lopDays: 0,
              payableDays: 0,
              leaveEncashmentDays: 0,
              leaveBalance: 0,
              adjustedPayableDays: 0,
              adjustmentReason: 0
            });
            this.isEdit = false;
            this.dialog.closeAll();
          },
          (error: any) => {
            this.toast.error('Failed to update Attendance Summary', 'Error');
          }
        );
      } else {
        this.payrollService.addFnFAttendanceSummary(this.attendanceSummaryForm.value).subscribe(
          (res: any) => {
            this.toast.success('Attendance Summary added successfully', 'Success');
            this.fetchAttendanceSummary(this.selectedFnF);
            this.attendanceSummaryForm.reset({
              payrollFNFUser: '',
              totalDays: 0,
              lopDays: 0,
              payableDays: 0,
              leaveEncashmentDays: 0,
              leaveBalance: 0,
              adjustedPayableDays: 0,
              adjustmentReason: 0
            });
            this.dialog.closeAll();
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
        adjustmentReason: this.selectedAttendanceSummary.adjustmentReason
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

  getMatchedSettledUser(userId: string) {
    const matchedUser = this.settledUsers?.find(user => user?._id == userId)
    return matchedUser ? `${matchedUser?.firstName}  ${matchedUser?.lastName}` : 'Not specified'
  }

  fetchAttendanceSummary(fnfPayroll: any): void {
    this.payrollService.getFnFAttendanceSummary(fnfPayroll?._id).subscribe(
      (res: any) => {
        this.attendanceSummary.data = res.data;
        this.attendanceSummary.data.forEach((item: any) => {
          const matchedUser = this.selectedFnF.userList.find((user: any) => user._id === item.payrollFNFUser);
          item.userName = this.getMatchedSettledUser(matchedUser.user);
        });

        if (this.isEdit && this.selectedAttendanceSummary) {
          this.attendanceSummaryForm.patchValue({
            payrollFNFUser: this.selectedAttendanceSummary.payrollFNFUser,
            ...this.selectedAttendanceSummary
          });
        }
      },
      (error: any) => {
        this.toast.error('Failed to fetch Manual Arrears', 'Error');
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
      year: this.selectedFnF.year,
      month: this.getMonthNumber(this.selectedFnF.month).toString()
    }

    this.attendanceService.getProcessAttendanceLOPByMonth(payload).subscribe((res: any) => {
      this.attendanceLOPUser = res.data;
      const matchingUsers = this.attendanceLOPUser.filter((lop: any) => lop.user === this.selectedUserId?.user);

      const lopUserLength = matchingUsers.length || 0;
      const payableDays = this.getTotalDaysInMonth(payload.year, this.selectedFnF.month) - lopUserLength || 0;

      this.attendanceSummaryForm.patchValue({
        lopDays: lopUserLength,
        payableDays: payableDays,
        totalDays: this.getTotalDaysInMonth(payload.year, this.selectedFnF.month)
      });
    })
  }

}