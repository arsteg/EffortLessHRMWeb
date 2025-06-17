import { Component, OnInit, ViewChild, TemplateRef, Input } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { PayrollService } from 'src/app/_services/payroll.service';
import { ToastrService } from 'ngx-toastr';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-step7',
  templateUrl: './step7.component.html',
  styleUrls: ['./step7.component.css']
})
export class FNFStep7Component implements OnInit {
  displayedColumns: string[] = ['userName', 'LateComing', 'EarlyGoing', 'FinalOvertime','OvertimeAmount'];
  overtime = new MatTableDataSource<any>();
  overtimeForm: FormGroup;
  selectedOvertime: any;
  fnfUsers: any;
  isEdit: boolean = false;
  selectedFNFUser: any;
  @Input() settledUsers: any[];
  @Input() isSteps: boolean;
  @Input() selectedFnF: any;

  @ViewChild('dialogTemplate') dialogTemplate: TemplateRef<any>;

  constructor(private fb: FormBuilder,
    private payrollService: PayrollService,
    public dialog: MatDialog,
    private toast: ToastrService) {
    this.overtimeForm = this.fb.group({
      PayrollFNFUser: ['', Validators.required],
      LateComing: ['', Validators.required],
      EarlyGoing: ['', Validators.required],
      FinalOvertime: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.fetchOvertime(this.selectedFnF);
  }

  onUserChange(fnfUserId: string): void {
    this.selectedFNFUser = fnfUserId;
    const matchedUser = this.selectedFnF.userList.find((user: any) => user.user === fnfUserId);
    const payrollFNFUserId = matchedUser ? matchedUser._id : null;

    if (payrollFNFUserId) {
      this.payrollService.getFnFOvertimeByPayrollFnFUser(payrollFNFUserId).subscribe((res: any) => {
        this.overtime.data = res.data['records'];
        this.overtime.data.forEach((overtime: any) => {
          const user = this.settledUsers.find(user => user._id === fnfUserId);
          overtime.userName = user ? `${user.firstName} ${user.lastName}` : 'Unknown User';
        });
      });
    }
  }

  openDialog(isEdit: boolean): void {
    this.isEdit = isEdit;
    this.dialog.open(this.dialogTemplate, {
      width: '50%',
      panelClass: 'custom-dialog-container',
      disableClose: true
    });
  }

  getMatchedSettledUser(userId: string) {
    const matchedUser = this.settledUsers?.find(user => user?._id == userId)
    return matchedUser ? `${matchedUser?.firstName}  ${matchedUser?.lastName}` : 'Not specified'
  }

  fetchOvertime(fnfPayroll: any): void {
    this.payrollService.getFnFOvertimeByPayrollFnF(fnfPayroll?._id).subscribe(
      (res: any) => {
        this.overtime.data = res.data;

        this.overtime.data.forEach((item: any) => {
          const matchedUser = this.selectedFnF.userList.find((user: any) => user._id === item.PayrollFNFUser);
          item.userName = this.getMatchedSettledUser(matchedUser?.user);
        });

        if (this.isEdit && this.selectedOvertime) {
          this.overtimeForm.patchValue({
            payrollFNFUser: this.selectedOvertime.PayrollFNFUser,
            ...this.selectedOvertime,
          });
        }
      },
      (error: any) => {
        this.toast.error('Failed to fetch Overtime Records', 'Error');
      }
    );
  }
}