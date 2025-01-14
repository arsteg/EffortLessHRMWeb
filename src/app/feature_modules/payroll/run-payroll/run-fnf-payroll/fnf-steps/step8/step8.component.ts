import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { PayrollService } from 'src/app/_services/payroll.service';
import { ToastrService } from 'ngx-toastr';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';
import { CommonService } from 'src/app/_services/common.Service';

@Component({
  selector: 'app-step8',
  templateUrl: './step8.component.html',
  styleUrls: ['./step8.component.css']
})
export class FNFStep8Component implements OnInit {
  displayedColumns: string[] = ['payrollUser', 'lateComing', 'earlyGoing', 'finalOvertime', 'actions'];
  overtime = new MatTableDataSource<any>();
  fnfStep6Form: FormGroup;
  selectedOvertime: any;
  userList: any[] = [];
  fnfUsers: any;
  isEdit: boolean = false;

  @ViewChild('dialogTemplate') dialogTemplate: TemplateRef<any>;

  constructor(private fb: FormBuilder,
    private payrollService: PayrollService,
    private commonService: CommonService,
    public dialog: MatDialog,
    private toast: ToastrService) {
    this.fnfStep6Form = this.fb.group({
      PayrollFNFUser: ['', Validators.required],
      lateComing: ['', Validators.required],
      earlyGoing: ['', Validators.required],
      finalOvertime: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.commonService.populateUsers().subscribe((res: any) => {
      this.userList = res.data['data'];
    });

    this.payrollService.selectedFnFPayroll.subscribe((fnfPayroll: any) => {
      if (fnfPayroll) {
        setTimeout(() => {
          this.fetchOvertime(fnfPayroll);
        }, 1000);
      }
    });
  }

  onUserChange(fnfUserId: string): void {
    console.log('fnf payroll users: ', fnfUserId);
    this.payrollService.selectedFnFPayroll.subscribe((fnfPayroll: any) => {
      const fnfUser = fnfPayroll.userList[0].user;

      this.payrollService.getFnFOvertimeByPayrollFnFUser(fnfUserId).subscribe((res: any) => {
        this.overtime.data = res.data;
        this.overtime.data.forEach((overtime: any) => {
          const user = this.userList.find(user => user._id === fnfUser);
          overtime.userName = user ? `${user.firstName} ${user.lastName}` : 'Unknown User';
        });
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
    this.fnfStep6Form.patchValue({
      PayrollFNFUser: overtime.PayrollFNFUser,
      lateComing: overtime.lateComing,
      earlyGoing: overtime.earlyGoing,
      finalOvertime: overtime.finalOvertime
    });

    this.openDialog(true);
  }

  onSubmit(): void {
    if (this.fnfStep6Form.valid) {
      const payload = this.fnfStep6Form.value;
      if (this.selectedOvertime) {
        this.payrollService.updateFnFOvertime(this.selectedOvertime._id, payload).subscribe(
          (res: any) => {
            this.toast.success('Overtime updated successfully', 'Success');
            this.dialog.closeAll();
            this.fetchOvertime(this.selectedOvertime.fnfPayrollId);
          },
          (error: any) => {
            this.toast.error('Failed to update Overtime', 'Error');
          }
        );
      } else {
        this.payrollService.addFnFOvertime(payload).subscribe(
          (res: any) => {
            this.toast.success('Overtime added successfully', 'Success');
            this.dialog.closeAll();
            this.fetchOvertime(payload.fnfPayrollId);
          },
          (error: any) => {
            this.toast.error('Failed to add Overtime', 'Error');
          }
        );
      }
    } else {
      this.fnfStep6Form.markAllAsTouched();
    }
  }

  onCancel(): void {
    if (this.isEdit && this.selectedOvertime) {
      this.fnfStep6Form.patchValue({
        PayrollFNFUser: this.selectedOvertime.PayrollFNFUser,
        lateComing: this.selectedOvertime.lateComing,
        earlyGoing: this.selectedOvertime.earlyGoing,
        finalOvertime: this.selectedOvertime.finalOvertime
      });
    } else {
      this.fnfStep6Form.reset();
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

  fetchOvertime(fnfPayroll: any): void {
    this.payrollService.getFnFOvertimeByPayrollFnF(fnfPayroll?._id).subscribe(
      (res: any) => {
        this.overtime.data = res.data;
        this.overtime.data.forEach((overtime: any, index: number) => {
          const user = this.userList.find(user => user._id === fnfPayroll.userList[index].user);
          overtime.userName = user ? `${user.firstName} ${user.lastName}` : 'Unknown User';
        });
      },
      (error: any) => {
        this.toast.error('Failed to fetch Overtime', 'Error');
      }
    );
  }

  getUserName(userId: string): string {
    const user = this.userList.find(user => user._id === userId);
    return user ? `${user.firstName} ${user.lastName}` : 'Unknown User';
  }
}