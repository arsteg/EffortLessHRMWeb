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
  displayedColumns: string[] = ['userName', 'LateComing', 'EarlyGoing', 'FinalOvertime', 'actions'];
  overtime = new MatTableDataSource<any>();
  overtimeForm: FormGroup;
  selectedOvertime: any;
  userList: any[] = [];
  fnfUsers: any;
  isEdit: boolean = false;
  selectedFNFUser: any;
  @Input() settledUsers: any[];
  @Input() fnfPayrollRecord: any;
  @Input() isSteps: boolean;

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
    this.fetchOvertime(this.fnfPayrollRecord);
  }

  onUserChange(fnfUserId: string): void {
    this.selectedFNFUser = fnfUserId;
    const fnfUser = this.fnfPayrollRecord.userList[0].user;

      this.payrollService.getFnFOvertimeByPayrollFnFUser(fnfUserId).subscribe((res: any) => {
        this.overtime.data = res.data;
        this.overtime.data.forEach((overtime: any) => {
          const user = this.userList.find(user => user._id === fnfUser);
          overtime.userName = user ? `${user.firstName} ${user.lastName}` : 'Unknown User';
        });
      });
   
  }

  openDialog(isEdit: boolean): void {
    this.isEdit = isEdit;
    this.dialog.open(this.dialogTemplate, {
      width: '50%',
      panelClass: 'custom-dialog-container',
      disableClose: true
    });
  }

  editOvertime(overtime: any): void {
    this.isEdit = true;
    this.selectedOvertime = overtime;
    this.overtimeForm.patchValue({
      PayrollFNFUser: overtime.userName,
      LateComing: overtime.lateComing,
      EarlyGoing: overtime.earlyGoing,
      FinalOvertime: overtime.finalOvertime
    });

    this.openDialog(true);
  }

  onSubmit(): void {
    const matchedUser = this.fnfPayrollRecord.userList.find((user: any) => user.user === this.selectedFNFUser);
    const payrollFNFUserId = matchedUser ? matchedUser._id : null;

    this.overtimeForm.patchValue({
      PayrollFNFUser: payrollFNFUserId
    });
    if (this.overtimeForm.valid) {
      this.overtimeForm.get('PayrollFNFUser').enable();

      if (this.selectedOvertime || this.isEdit) {
        this.overtimeForm.patchValue({
          PayrollFNFUser: this.selectedOvertime.PayrollFNFUser,
        });
        this.payrollService.updateFnFOvertime(this.selectedOvertime._id, this.overtimeForm.value).subscribe(
          (res: any) => {
            this.toast.success('Overtime updated successfully', 'Success');
            this.fetchOvertime(this.fnfPayrollRecord);
            this.overtimeForm.reset({
              PayrollFNFUser: '',
              LateComing: '',
              EarlyGoing: '',
              FinalOvertime: ''
            })
            this.isEdit = false;
            this.dialog.closeAll();
          },
          (error: any) => {
            this.toast.error('Failed to update Overtime', 'Error');
          }
        );
      } else {
        this.payrollService.addFnFOvertime(this.overtimeForm.value).subscribe(
          (res: any) => {
            this.toast.success('Overtime added successfully', 'Success');
            this.fetchOvertime(this.fnfPayrollRecord);
            this.overtimeForm.reset({
              PayrollFNFUser: '',
              LateComing: '',
              EarlyGoing: '',
              FinalOvertime: ''
            })
            this.dialog.closeAll();
          },
          (error: any) => {
            this.toast.error('Failed to add Overtime', 'Error');
          }
        );
      }
    } else {
      this.overtimeForm.markAllAsTouched();
    }
  }

  onCancel(): void {
    if (this.isEdit && this.selectedOvertime) {
      this.overtimeForm.patchValue({
        PayrollFNFUser: this.selectedOvertime.PayrollFNFUser,
        lateComing: this.selectedOvertime.lateComing,
        earlyGoing: this.selectedOvertime.earlyGoing,
        finalOvertime: this.selectedOvertime.finalOvertime
      });
    } else {
      this.overtimeForm.reset();
    }
  }

  deleteOvertime(_id: string) {
    this.payrollService.deleteFnFOvertime(_id).subscribe((res: any) => {
      this.toast.success('Overtime Deleted', 'Success');
      this.fetchOvertime(this.selectedOvertime.fnfPayrollId);
    }, error => {
      this.toast.error('Failed to delete Overtime', 'Error');
    });
  }

  deleteFnF(id: string): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, { width: '400px', });
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'delete') { this.deleteOvertime(id); }
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
          const matchedUser = this.fnfPayrollRecord.userList.find((user: any) => user._id === item.payrollFNFUser);
          item.userName = this.getMatchedSettledUser(matchedUser.user);
        });


        if (this.isEdit && this.selectedOvertime) {
          this.overtimeForm.patchValue({
            payrollFNFUser: this.selectedOvertime.payrollFNFUser,
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