import { Component, OnInit, ViewChild, TemplateRef, Input, inject } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { PayrollService } from 'src/app/_services/payroll.service';
import { ToastrService } from 'ngx-toastr';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';
import { forkJoin, map, catchError } from 'rxjs';
import { ActionVisibility, TableColumn } from 'src/app/models/table-column';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-step7',
  templateUrl: './step7.component.html',
  styleUrls: ['./step7.component.css']
})
export class FNFStep7Component implements OnInit {
  overtime = new MatTableDataSource<any>();
  overtimeForm: FormGroup;
  selectedOvertime: any;
  isEdit: boolean = false;
  selectedFNFUser: any;
  @Input() settledUsers: any[] = [];
  @Input() isSteps: boolean = false;
  @Input() selectedFnF: any;
  @ViewChild('dialogTemplate') dialogTemplate: TemplateRef<any>;
  private readonly translate = inject(TranslateService);

  columns: TableColumn[] = [
    {
      key: 'userName',
      name: this.translate.instant('payroll.payroll_user_label'),
      valueFn: (row) => row.userName || ''
    },
    {
      key: 'LateComing',
      name: this.translate.instant('payroll.late_coming'),
      valueFn: (row) => row.LateComing
    },
    {
      key: 'EarlyGoing',
      name: this.translate.instant('payroll.early_going'),
      valueFn: (row) => row.EarlyGoing
    },
    {
      key: 'FinalOvertime',
      name: this.translate.instant('payroll.final_overtime'),
      valueFn: (row) => (row.FinalOvertime / 60).toFixed(2)
    },
    {
      key: 'OvertimeAmount',
      name: this.translate.instant('payroll.overtime_amount'),
      valueFn: (row) => row.OvertimeAmount.toFixed(2)
    }
  ];

  constructor(
    private fb: FormBuilder,
    private payrollService: PayrollService,
    public dialog: MatDialog,
    private toast: ToastrService
  ) {
    this.overtimeForm = this.fb.group({
      PayrollFNFUser: ['', Validators.required],
      LateComing: [0, [Validators.required, Validators.min(0)]],
      EarlyGoing: [0, [Validators.required, Validators.min(0)]],
      FinalOvertime: [0, [Validators.required, Validators.min(0)]],
      OvertimeAmount: [0, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    forkJoin({
      overtime: this.fetchOvertime(this.selectedFnF)
    }).subscribe({
      next: (results) => {
        this.overtime.data = results.overtime;
      },
      error: (error) => {
      }
    });
  }

  fetchOvertime(fnfPayroll: any) {
    return this.payrollService.getFnFOvertimeByPayrollFnF(fnfPayroll?._id).pipe(
      map((res: any) => {
        return res.data.map((item: any) => {
          const matchedUser = this.selectedFnF.userList.find(
            (user: any) => user._id === item.PayrollFNFUser
          );
          return {
            ...item,
            userName: this.getMatchedSettledUser(matchedUser?.user || '')
          };
        });
      }),
      catchError((error) => {
        this.toast.error(this.translate.instant('payroll.messages.overtime_fetch_error'), this.translate.instant('payroll.error'));
        throw error;
      })
    );
  }

  getMatchedSettledUser(userId: string) {
    const matchedUser = this.settledUsers?.find((user) => user?._id === userId);
    return matchedUser ? `${matchedUser.firstName} ${matchedUser.lastName}` : '';
  }

  onUserChange(fnfUserId: string): void {
    this.selectedFNFUser = fnfUserId;
    const matchedUser = this.selectedFnF.userList.find((user: any) => user.user === fnfUserId);
    const payrollFNFUserId = matchedUser ? matchedUser._id : null;

    if (payrollFNFUserId) {
      this.payrollService.getFnFOvertimeByPayrollFnFUser(payrollFNFUserId).subscribe({
        next: (res: any) => {
          this.overtime.data = res.data['records'].map((item: any) => ({
            ...item,
            userName: this.getMatchedSettledUser(fnfUserId)
          }));
        },
        error: () => {
          this.toast.error(this.translate.instant('payroll.messages.failed_fetch_overtime'), this.translate.instant('payroll.error'));
        }
      });
    }
    this.overtimeForm.patchValue({
      PayrollFNFUser: this.getMatchedSettledUser(fnfUserId)
    });
  }
}