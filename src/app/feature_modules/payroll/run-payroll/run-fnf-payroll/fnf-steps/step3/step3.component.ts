import { Component, OnInit, ViewChild, TemplateRef, Input } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { PayrollService } from 'src/app/_services/payroll.service';
import { ToastrService } from 'ngx-toastr';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';
import { CommonService } from 'src/app/_services/common.Service';
import { forkJoin } from 'rxjs';
import { UserService } from 'src/app/_services/users.service';

@Component({
  selector: 'app-step3',
  templateUrl: './step3.component.html',
  styleUrl: './step3.component.css'
})
export class FNFStep3Component implements OnInit {
  displayedColumns: string[] = ['userName', 'manualArrears', 'arrearDays', 'lopReversalDays', 'salaryRevisionDays', 'lopReversalArrears', 'totalArrears', 'actions'];
  manualArrears = new MatTableDataSource<any>();
  manualArrearForm: FormGroup;
  selectedManualArrear: any;
  salaryPerDay : any;
  isEdit: boolean = false;
  selectedFNFUser: any;
  @Input() settledUsers: any[];
  @Input() isSteps: boolean;
  @Input() selectedFnF: any;
  @ViewChild('dialogTemplate') dialogTemplate: TemplateRef<any>;

  constructor(private fb: FormBuilder,
    private payrollService: PayrollService,
    private userService: UserService,
    public dialog: MatDialog,
    private toast: ToastrService) {
    this.manualArrearForm = this.fb.group({
      payrollFNFUser: ['', Validators.required],
      manualArrears: [0, Validators.required],
      arrearDays: [0, Validators.required],
      lopReversalDays: [0, Validators.required],
      salaryRevisionDays: [0, Validators.required],
      lopReversalArrears: [{ value: 0, disabled: true }, Validators.required],
      totalArrears: [{ value: 0, disabled: true }, Validators.required]
    });
  }

  ngOnInit(): void {
      this.fetchManualArrears(this.selectedFnF);
      this.manualArrearForm.valueChanges.subscribe(() => {
        this.recalculateFields();
      });
    
  }
  getDailySalaryByUserId(userId: string): void {       
        this.userService.getDailySalaryByUserId(userId).subscribe(
          (res: any) => {            
            this.salaryPerDay = res.data;           
          },
          (error: any) => {
            this.toast.error('Failed to Load Daily Salary', 'Error');
          })
    }
  recalculateFields(): void {
    const manualArrears = this.manualArrearForm.get('manualArrears')?.value || 0;
    const arrearDays = this.manualArrearForm.get('arrearDays')?.value || 0;
    const lopReversalDays = this.manualArrearForm.get('lopReversalDays')?.value || 0;
    const salaryRevisionDays = this.manualArrearForm.get('salaryRevisionDays')?.value || 0;
  
    const lopReversalArrears = lopReversalDays * this.salaryPerDay;
    const totalArrears = manualArrears + ((arrearDays + salaryRevisionDays) * this.salaryPerDay) + lopReversalArrears;
  
    this.manualArrearForm.patchValue({
      lopReversalArrears: lopReversalArrears.toFixed(0),
      totalArrears: totalArrears.toFixed(0)
    }, { emitEvent: false }); // Prevent recursive loop
  }
  
  onUserChange(fnfUserId: string): void {
    this.selectedFNFUser = fnfUserId;
    const matchedUser = this.selectedFnF.userList.find((user: any) => user.user === fnfUserId);
    const payrollFNFUserId = matchedUser ? matchedUser._id : null;

    if (payrollFNFUserId) {
      this.payrollService.getFnFUserById(payrollFNFUserId).subscribe((res: any) => {
         this.getDailySalaryByUserId(res.data.user);
        });
    }
  }
  onPayrollUserChange(fnfUserId: string): void {
    this.selectedFNFUser = fnfUserId;
    const matchedUser = this.selectedFnF.userList.find((user: any) => user.user === fnfUserId);
    const payrollFNFUserId = matchedUser ? matchedUser._id : null;

    if (payrollFNFUserId) {
      this.payrollService.getFnFManualArrearsByPayrollFnFUser(payrollFNFUserId).subscribe((res: any) => {
        this.manualArrears.data = res.data;
        this.manualArrears.data.forEach((arrear: any) => {
          const user = this.settledUsers.find(user => user?._id === fnfUserId);
          arrear.userName = user ? `${user.firstName} ${user.lastName}` : 'Unknown User';
          this.getDailySalaryByUserId(user._id);
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

  editManualArrear(manualArrear: any): void {
    this.isEdit = true;
    this.selectedManualArrear = manualArrear;
    this.manualArrearForm.patchValue({
      payrollFNFUser: manualArrear.userName,
      manualArrears: manualArrear.manualArrears,
      arrearDays: manualArrear.arrearDays,
      lopReversalDays: manualArrear.lopReversalDays,
      salaryRevisionDays: manualArrear.salaryRevisionDays,
      lopReversalArrears: manualArrear.lopReversalArrears,
      totalArrears: manualArrear.totalArrears
    });
    this.manualArrearForm.get('payrollFNFUser').disable();
    this.openDialog(true);
  }

  onSubmit(): void {
    this.manualArrearForm.get('lopReversalArrears')?.enable();
    this.manualArrearForm.get('totalArrears')?.enable();
    const matchedUser = this.selectedFnF.userList.find((user: any) => user.user === this.selectedFNFUser);
    const payrollFNFUserId = matchedUser ? matchedUser._id : null;

    this.manualArrearForm.patchValue({
      payrollFNFUser: payrollFNFUserId
    });
    
    if (this.manualArrearForm.valid) {

      this.manualArrearForm.get('payrollFNFUser').enable();

      if (this.isEdit) {

        this.manualArrearForm.patchValue({
          payrollFNFUser: this.selectedManualArrear.payrollFNFUser,
        });
        this.payrollService.updateFnFManualArrear(this.selectedManualArrear._id, this.manualArrearForm.value).subscribe(
          (res: any) => {
            this.toast.success('Manual Arrear updated successfully', 'Success');
            this.fetchManualArrears(this.selectedFnF);
            this.isEdit = false;
            this.manualArrearForm.reset({
              payrollFNFUser: '',
              manualArrears: 0,
              arrearDays: 0,
              lopReversalDays: 0,
              salaryRevisionDays: 0,
              lopReversalArrears: 0,
              totalArrears: 0
            })
            this.dialog.closeAll();
            this.manualArrearForm.get('payrollFNFUser').disable();
          },
          (error: any) => {
            this.toast.error('Failed to update Manual Arrear', 'Error');
          }
        );
      } else {
        const matchedUser = this.selectedFnF.userList.find((user: any) => user.user === this.selectedFNFUser);
        const payrollFNFUserId = matchedUser ? matchedUser._id : null;

        this.manualArrearForm.patchValue({
          payrollFNFUser: payrollFNFUserId
        })
        this.payrollService.addFnFManualArrear(this.manualArrearForm.value).subscribe(
          (res: any) => {
            this.toast.success('Manual Arrear added successfully', 'Success');
            this.fetchManualArrears(this.selectedFnF);
            this.manualArrearForm.reset({
              payrollFNFUser: '',
              manualArrears: 0,
              arrearDays: 0,
              lopReversalDays: 0,
              salaryRevisionDays: 0,
              lopReversalArrears: 0,
              totalArrears: 0
            })
            this.dialog.closeAll();
          },
          (error: any) => {
            this.toast.error('Failed to add Manual Arrear', 'Error');
          }
        );
      }
    } else {
      this.manualArrearForm.markAllAsTouched();
    }
    this.isEdit = false;
  }

  onCancel(): void {
    if (this.isEdit && this.selectedManualArrear) {
      this.manualArrearForm.patchValue({
        payrollFNFUser: this.selectedManualArrear.payrollFNFUser,
        manualArrears: this.selectedManualArrear.manualArrears,
        arrearDays: this.selectedManualArrear.arrearDays,
        lopReversalDays: this.selectedManualArrear.lopReversalDays,
        salaryRevisionDays: this.selectedManualArrear.salaryRevisionDays,
        lopReversalArrears: this.selectedManualArrear.lopReversalArrears,
        totalArrears: this.selectedManualArrear.totalArrears
      });
    } else {
      this.manualArrearForm.reset();
    }
  }

  deleteRecord(_id: string) {

    this.payrollService.deleteFnFManualArrear(_id).subscribe((res: any) => {
      this.fetchManualArrears(this.selectedFnF);
      this.toast.success('Successfully Deleted!!!', 'FNF Manual Arrear');
    }, (err) => {
      this.toast.error('FNF Manual Arrear can not be deleted', 'Error');
    });
  }

  deleteDialog(data: any): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'delete') {
        this.deleteRecord(data);
      }
    });
  }

  getMatchedSettledUser(userId: string) {
    const matchedUser = this.settledUsers?.find(user => user?._id == userId)
    return matchedUser ? `${matchedUser?.firstName}  ${matchedUser?.lastName}` : 'Not specified'
  }

  fetchManualArrears(fnfPayroll: any): void {
    this.payrollService.getFnFManualArrearsByPayrollFnF(fnfPayroll?._id).subscribe(
      (res: any) => {
        this.manualArrears.data = res.data;
        
        this.manualArrears.data.forEach((item: any) => {
          const matchedUser = this.selectedFnF.userList.find((user: any) => user._id === item.payrollFNFUser);
          item.userName = this.getMatchedSettledUser(matchedUser.user);
        });

        
        if (this.isEdit && this.selectedManualArrear) {
          this.manualArrearForm.patchValue({
            payrollFNFUser: this.selectedManualArrear.payrollFNFUser,
            ...this.selectedManualArrear,
          });
        }
      },
      (error: any) => {
        this.toast.error('Failed to fetch Manual Arrears', 'Error');
      }
    );
  }
}
