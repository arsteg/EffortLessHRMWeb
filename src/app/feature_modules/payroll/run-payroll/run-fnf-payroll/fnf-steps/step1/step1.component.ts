import { Component, OnInit, ViewChild, TemplateRef, Input, inject } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { PayrollService } from 'src/app/_services/payroll.service';
import { ToastrService } from 'ngx-toastr';
import { AttendanceService } from 'src/app/_services/attendance.service';
import { CommonService } from 'src/app/_services/common.Service';
import { ActionVisibility, TableColumn } from 'src/app/models/table-column';
import { forkJoin, map, catchError } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-step1',
  templateUrl: './step1.component.html',
  styleUrls: ['./step1.component.css']
})
export class FNFStep1Component implements OnInit {
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
  users: any[] = [];
  @ViewChild('dialogTemplate') dialogTemplate: TemplateRef<any>;
  private readonly translate = inject(TranslateService);

  columns: TableColumn[] = [
    {
      key: 'userName',
      name: this.translate.instant('payroll.payroll_user_label'),
      valueFn: (row) => this.getUserName(row.payrollFNFUser)
    },
    {
      key: 'totalDays',
      name: this.translate.instant('payroll.total_days'),
      valueFn: (row) => row.totalDays
    },
    {
      key: 'lopDays',
      name: this.translate.instant('payroll.lop_days'),
      valueFn: (row) => row.lopDays
    },
    {
      key: 'payableDays',
      name: this.translate.instant('payroll.payable_days'),
      valueFn: (row) => row.payableDays
    },
    {
      key: 'leaveEncashmentDays',
      name: this.translate.instant('payroll.leave_encashment_days'),
      valueFn: (row) => row.leaveEncashmentDays
    },
    {
      key: 'leaveBalance',
      name: this.translate.instant('payroll.leave_balance'),
      valueFn: (row) => row.leaveBalance
    },
    {
      key: 'adjustedPayableDays',
      name: this.translate.instant('payroll.adjusted_payable_days'),
      valueFn: (row) => row.adjustedPayableDays
    },
    {
      key: 'actions',
      name: this.translate.instant('payroll.actions'),
      isAction: true,
      options: [
        {
          label: this.translate.instant('payroll.edit'),
          visibility: ActionVisibility.LABEL,
          icon: 'edit',
          hideCondition: (row) => false
        }
      ]
    }
  ];

  constructor(
    private fb: FormBuilder,
    private payrollService: PayrollService,
    public dialog: MatDialog,
    private toast: ToastrService,
    private attendanceService: AttendanceService,
    private commonService: CommonService
  ) {
    this.attendanceSummaryForm = this.fb.group({
      payrollFNFUser: ['', Validators.required],
      payrollFnf: [''],
      totalDays: [{ value: 0, disabled: true }, Validators.required],
      lopDays: [{ value: 0, disabled: true }, Validators.required],
      payableDays: [{ value: 0, disabled: true }, Validators.required],
      leaveEncashmentDays: [0, Validators.required],
      leaveBalance: [0, Validators.required],
      adjustedPayableDays: [0, Validators.required],
      adjustmentReason: ['', Validators.required],
      adjustmentDetails: this.fb.array([this.createAdjustmentDetail()])
    });
  }

  ngOnInit(): void {
    forkJoin({
      attendanceSummary: this.fetchAttendanceSummary(this.selectedFnF)
    }).subscribe({
      next: (results) => {
        this.attendanceSummary.data = results.attendanceSummary;
      },
      error: (error) => {
      }
    });

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

  getAllUsers() {
    return this.commonService.populateUsers();
  }

  getUserName(payrollFNFUserId: string): string {
    const matchedUser = this.selectedFnF.userList.find((user: any) => user._id === payrollFNFUserId);
    if (matchedUser) {
      const user = this.users.find(u => u._id === matchedUser.user);
      return user ? `${user.firstName} ${user.lastName}` : '';
    }
    return '';
  }

  fetchAttendanceSummary(fnfPayroll: any) {
    return forkJoin([
      this.payrollService.getFnFAttendanceSummary(fnfPayroll?._id),
      this.getAllUsers()
    ]).pipe(
      map(([attendanceRes, usersRes]) => {
        this.users = usersRes.data.data;
        const data = attendanceRes.data.map((item: any) => {
          item.userName = this.getUserName(item.payrollFNFUser);
          return item;
        });
        return data;
      }),
      catchError((error) => {
        this.toast.error(this.translate.instant('payroll.failed_to_fetch_attendance_summary'), this.translate.instant('payroll.error'));
        throw error;
      })
    );
  }

  onUserChange(fnfUserId: string): void {
    this.selectedUserId = fnfUserId;
    const matchedUser = this.selectedFnF.userList.find((user: any) => user.user === this.selectedUserId);
    const payrollFNFUserId = matchedUser ? matchedUser._id : null;

    this.payrollService.getAttendanceRecordsByUserAndPayroll({ payrollFNFUser: payrollFNFUserId, payrollFNF: this.selectedFnF?._id }).subscribe({
      next: (res: any) => {
        this.attendanceSummaryForm.patchValue({
          totalDays: res.data.TotalDays,
          lopDays: res.data.lopDays,
          payableDays: res.data.payableDays,
          leaveBalance: res.data.leaveBalance
        });
      },
      error: (error) => {
        this.toast.error(this.translate.instant('payroll.failed_to_fetch_attendance_summary'), this.translate.instant('payroll.error'));
      }
    });
  }

  onAction(event: any) {
    if (event.action.label === 'Edit') {
      this.editAttendanceSummary(event.row);
    }
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

  resetForm(): void {
    this.attendanceSummaryForm.reset({
      payrollFNFUser: '',
      payrollFnf: '',
      totalDays: 0,
      lopDays: 0,
      payableDays: 0,
      leaveEncashmentDays: 0,
      leaveBalance: 0,
      adjustedPayableDays: 0,
      adjustmentReason: ''
    });
    this.adjustmentDetails.clear();
    this.adjustmentDetails.push(this.createAdjustmentDetail());
  }

  openDialog(isEdit: boolean): void {
    this.isEdit = isEdit;
    if (!isEdit) {
      this.resetForm();
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
      payrollFNFUser: this.getUserName(attendanceSummary.payrollFNFUser),
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
    this.attendanceSummaryForm.get('payrollFNFUser')?.enable();

    const matchedUser = this.selectedFnF.userList.find((user: any) => user.user === this.selectedUserId);
    const payrollFNFUserId = matchedUser ? matchedUser._id : null;

    this.attendanceSummaryForm.patchValue({
      payrollFNFUser: payrollFNFUserId
    });

    const formValue = this.attendanceSummaryForm.value;
    if (this.isEdit) {
      formValue.payrollFNFUser = this.selectedAttendanceSummary.payrollFNFUser;
    }

    const request$ = this.isEdit
      ? this.payrollService.updateFnFAttendanceSummary(this.selectedAttendanceSummary._id, formValue)
      : this.payrollService.addFnFAttendanceSummary(formValue);

    request$.subscribe({
      next: () => {
        // Refresh and reset form
        this.fetchAttendanceSummary(this.selectedFnF).subscribe((data) => {
          this.attendanceSummary.data = data;
        });
        if (this.isEdit) {
          this.toast.success(this.translate.instant('payroll.attendance_summary_updated'));
        }
        else {
          this.toast.success(this.translate.instant('payroll.attendance_summary_added'));
        }
        this.resetForm();
        this.isEdit = false;
        this.dialog.closeAll();
      },
      error: () => {
        if (this.isEdit) {
          this.toast.error(this.translate.instant('payroll.error_update_attendance_summary'), this.translate.instant('payroll.error'));
          return;
        }
        else {
          this.toast.error(this.translate.instant('payroll.error_add_attendance_summary'), this.translate.instant('payroll.error'));
        }
      }
    });
  }

  onCancel(): void {
    if (this.isEdit && this.selectedAttendanceSummary) {
      this.attendanceSummaryForm.patchValue({
        payrollFNFUser: this.getUserName(this.selectedAttendanceSummary.payrollFNFUser),
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
      this.resetForm();
    }
    this.dialog.closeAll();
  }

  getMatchedSettledUser(userId: string) {
    const matchedUser = this.settledUsers?.find(user => user?._id === userId);
    return matchedUser ? `${matchedUser?.firstName} ${matchedUser?.lastName}` : '';
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
    };

    this.attendanceService.getProcessAttendanceLOPByMonth(payload).subscribe({
      next: (res: any) => {
        this.attendanceLOPUser = res.data;
        const matchingUsers = this.attendanceLOPUser.filter((lop: any) => lop.user === this.selectedUserId?.user);

        const lopUserLength = matchingUsers.length || 0;
        const payableDays = this.getTotalDaysInMonth(payload.year, this.selectedFnF.month) - lopUserLength || 0;

        this.attendanceSummaryForm.patchValue({
          lopDays: lopUserLength,
          payableDays: payableDays,
          totalDays: this.getTotalDaysInMonth(payload.year, this.selectedFnF.month)
        });
      },
      error: (error) => {
        this.toast.error(this.translate.instant('payroll.failed_fetch_lop'), this.translate.instant('payroll.error'));
      }
    });
  }
}