import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { PayrollService } from 'src/app/_services/payroll.service';
import { ToastrService } from 'ngx-toastr';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';
import { CommonService } from 'src/app/_services/common.Service';

@Component({
  selector: 'app-step3',
  templateUrl: './step3.component.html',
  styleUrl: './step3.component.css'
})
export class FNFStep3Component implements OnInit {
  displayedColumns: string[] = ['payrollUser', 'manualArrears', 'arrearDays', 'lopReversalDays', 'salaryRevisionDays', 'lopReversalArrears', 'totalArrears', 'actions'];
  manualArrears = new MatTableDataSource<any>();
  fnfStep3Form: FormGroup;
  selectedManualArrear: any;
  userList: any[] = [];
  fnfUsers: any;
  isEdit: boolean = false;
isStep: boolean;
  @ViewChild('dialogTemplate') dialogTemplate: TemplateRef<any>;

  constructor(private fb: FormBuilder,
    private payrollService: PayrollService,
    private commonService: CommonService,
    public dialog: MatDialog,
    private toast: ToastrService) {
    this.fnfStep3Form = this.fb.group({
      payrollFNFUser: ['', Validators.required],
      manualArrears: [0, Validators.required],
      arrearDays: [0, Validators.required],
      lopReversalDays: [0, Validators.required],
      salaryRevisionDays: [0, Validators.required],
      lopReversalArrears: [0, Validators.required],
      totalArrears: [0, Validators.required]
    });
  }

  ngOnInit(): void {
    this.commonService.populateUsers().subscribe((res: any) => {
      this.userList = res.data['data'];
    });

    this.payrollService.selectedFnFPayroll.subscribe((fnfPayroll: any) => {
      this.isStep = fnfPayroll?.isSteps;
      if (fnfPayroll) {
        setTimeout(() => {
        this.fetchManualArrears(fnfPayroll);
        },1000)
      }
    });
  }

  onUserChange(fnfUserId: string): void {
    console.log('fnf payroll users: ', fnfUserId);
    this.payrollService.selectedFnFPayroll.subscribe((fnfPayroll: any) => {
      const fnfUser = fnfPayroll.userList[0].user;

      this.payrollService.getFnFManualArrearsByPayrollFnFUser(fnfUserId).subscribe((res: any) => {
        this.manualArrears.data = res.data;
        this.manualArrears.data.forEach((arrear: any) => {
          const user = this.userList.find(user => user._id === fnfUser);
          console.log(user);
          arrear.userName = user ? `${user.firstName} ${user.lastName}` : 'Unknown User';
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

  editManualArrear(manualArrear: any): void {
    this.isEdit = true;
    this.selectedManualArrear = manualArrear;
    this.fnfStep3Form.patchValue({
      payrollFNFUser: manualArrear.payrollFNFUser,
      manualArrears: manualArrear.manualArrears,
      arrearDays: manualArrear.arrearDays,
      lopReversalDays: manualArrear.lopReversalDays,
      salaryRevisionDays: manualArrear.salaryRevisionDays,
      lopReversalArrears: manualArrear.lopReversalArrears,
      totalArrears: manualArrear.totalArrears
    });

    this.openDialog(true);
  }

  onSubmit(): void {
    if (this.fnfStep3Form.valid) {
      const payload = this.fnfStep3Form.value;
      if (this.selectedManualArrear) {
        this.payrollService.updateFnFManualArrear(this.selectedManualArrear._id, payload).subscribe(
          (res: any) => {
            this.toast.success('Manual Arrear updated successfully', 'Success');
            this.dialog.closeAll();
            this.fetchManualArrears(this.selectedManualArrear.fnfPayrollId);
          },
          (error: any) => {
            this.toast.error('Failed to update Manual Arrear', 'Error');
          }
        );
      } else {
        this.payrollService.addFnFManualArrear(payload).subscribe(
          (res: any) => {
            this.toast.success('Manual Arrear added successfully', 'Success');
            this.dialog.closeAll();
            this.fetchManualArrears(payload.fnfPayrollId);
          },
          (error: any) => {
            this.toast.error('Failed to add Manual Arrear', 'Error');
          }
        );
      }
    } else {
      this.fnfStep3Form.markAllAsTouched();
    }
  }

  onCancel(): void {
    if (this.isEdit && this.selectedManualArrear) {
      this.fnfStep3Form.patchValue({
        payrollFNFUser: this.selectedManualArrear.payrollFNFUser,
        manualArrears: this.selectedManualArrear.manualArrears,
        arrearDays: this.selectedManualArrear.arrearDays,
        lopReversalDays: this.selectedManualArrear.lopReversalDays,
        salaryRevisionDays: this.selectedManualArrear.salaryRevisionDays,
        lopReversalArrears: this.selectedManualArrear.lopReversalArrears,
        totalArrears: this.selectedManualArrear.totalArrears
      });
    } else {
      this.fnfStep3Form.reset();
    }
  }

  deleteManualArrear(_id: string) {
    this.payrollService.deleteFnFManualArrear(_id).subscribe((res: any) => {
      this.toast.success('Manual Arrear Deleted', 'Success');
      this.fetchManualArrears(this.selectedManualArrear.fnfPayrollId);
    }, error => {
      this.toast.error('Failed to delete Manual Arrear', 'Error');
    });
  }

  deleteFnF(id: string): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, { width: '400px', });
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'delete') { this.deleteManualArrear(id); }
    });
  }

  fetchManualArrears(fnfPayroll: any): void {
    this.payrollService.getFnFManualArrearsByPayrollFnF(fnfPayroll?._id).subscribe(
      (res: any) => {
        this.manualArrears.data = res.data;
        this.manualArrears.data.forEach((arrear: any, index: number) => {
          const user = this.userList.find(user => user._id === fnfPayroll.userList[index].user);
          arrear.userName = user ? `${user.firstName} ${user.lastName}` : 'Unknown User';
        });
      },
      (error: any) => {
        this.toast.error('Failed to fetch Manual Arrears', 'Error');
      }
    );
  }

  getUserName(userId: string): string {
    const user = this.userList.find(user => user._id === userId);
    return user ? `${user.firstName} ${user.lastName}` : 'Unknown User';
  }
}
