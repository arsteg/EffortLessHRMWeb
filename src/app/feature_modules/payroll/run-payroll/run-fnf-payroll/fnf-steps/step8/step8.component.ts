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
  displayedColumns: string[] = ['payrollUser', 'taxCalculatedMethod', 'taxCalculated', 'tdsCalculated', 'actions'];
  incomeTax = new MatTableDataSource<any>();
  fnfStep6Form: FormGroup;
  selectedIncomeTax: any;
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
    this.fnfStep6Form = this.fb.group({
      PayrollFNFUser: ['', Validators.required],
      taxCalculatedMethod: ['', Validators.required],
      taxCalculated: [0, Validators.required],
      tdsCalculated: [0, Validators.required]
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
          this.fetchIncomeTax(fnfPayroll);
        }, 1000);
      }
    });
  }

  onUserChange(fnfUserId: string): void {
    this.payrollService.selectedFnFPayroll.subscribe((fnfPayroll: any) => {
      const fnfUser = fnfPayroll.userList[0].user;

      this.payrollService.getFnFIncomeTaxByPayrollFnFUser(fnfUserId).subscribe((res: any) => {
        this.incomeTax.data = res.data;
        this.incomeTax.data.forEach((incomeTax: any) => {
          const user = this.userList.find(user => user._id === fnfUser);
          incomeTax.userName = user ? `${user.firstName} ${user.lastName}` : 'Unknown User';
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

  editIncomeTax(incomeTax: any): void {
    this.isEdit = true;
    this.selectedIncomeTax = incomeTax;
    this.fnfStep6Form.patchValue({
      PayrollFNFUser: incomeTax.PayrollFNFUser,
      taxCalculatedMethod: incomeTax.taxCalculatedMethod,
      taxCalculated: incomeTax.taxCalculated,
      tdsCalculated: incomeTax.tdsCalculated
    });
    this.openDialog(true);
  }

  onSubmit(): void {
    if (this.fnfStep6Form.valid) {
      const payload = this.fnfStep6Form.value;
      if (this.selectedIncomeTax) {
        this.payrollService.updateFnFIncomeTax(this.selectedIncomeTax._id, payload).subscribe(
          (res: any) => {
            this.toast.success('Income Tax updated successfully', 'Success');
            this.dialog.closeAll();
            this.fetchIncomeTax(this.selectedIncomeTax.fnfPayrollId);
          },
          (error: any) => {
            this.toast.error('Failed to update Income Tax', 'Error');
          }
        );
      } else {
        this.payrollService.addFnFIncomeTax(payload).subscribe(
          (res: any) => {
            this.toast.success('Income Tax added successfully', 'Success');
            this.dialog.closeAll();
            this.fetchIncomeTax(payload.fnfPayrollId);
          },
          (error: any) => {
            this.toast.error('Failed to add Income Tax', 'Error');
          });
      }
    } else {
      this.fnfStep6Form.markAllAsTouched();
    }
  }

  onCancel(): void {
    if (this.isEdit && this.selectedIncomeTax) {
      this.fnfStep6Form.patchValue({
        PayrollFNFUser: this.selectedIncomeTax.PayrollFNFUser,
        taxCalculatedMethod: this.selectedIncomeTax.taxCalculatedMethod,
        taxCalculated: this.selectedIncomeTax.taxCalculated,
        tdsCalculated: this.selectedIncomeTax.tdsCalculated
      });
    } else {
      this.fnfStep6Form.reset();
    }
  }

  deleteIncomeTax(_id: string) {
    this.payrollService.deleteFnFIncomeTax(_id).subscribe((res: any) => {
      this.toast.success('Income Tax Deleted', 'Success');
      this.fetchIncomeTax(this.selectedIncomeTax.fnfPayrollId);
    }, error => {
      this.toast.error('Failed to delete Income Tax', 'Error');
    });
  }

  deleteFnF(id: string): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, { width: '400px', });
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'delete') { this.deleteIncomeTax(id); }
    });
  }

  fetchIncomeTax(fnfPayroll: any): void {
    this.payrollService.getFnFIncomeTaxByPayrollFnF(fnfPayroll?._id).subscribe(
      (res: any) => {
        this.incomeTax.data = res.data;
        this.incomeTax.data.forEach((incomeTax: any, index: number) => {
          const user = this.userList.find(user => user._id === fnfPayroll.userList[index].user);
          incomeTax.userName = user ? `${user.firstName} ${user.lastName}` : 'Unknown User';
        });
      },
      (error: any) => {
        this.toast.error('Failed to fetch Income Tax', 'Error');
      }
    );
  }

  getUserName(userId: string): string {
    const user = this.userList.find(user => user._id === userId);
    return user ? `${user.firstName} ${user.lastName}` : 'Unknown User';
  }
}
