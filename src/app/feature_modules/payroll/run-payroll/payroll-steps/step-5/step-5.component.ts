import { Component, Input, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { forkJoin, map } from 'rxjs';
import { CommonService } from 'src/app/_services/common.Service';
import { PayrollService } from 'src/app/_services/payroll.service';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';
import { UserService } from 'src/app/_services/users.service';
import { ActionVisibility, TableColumn } from 'src/app/models/table-column';
@Component({
  selector: 'app-step-5',
  templateUrl: './step-5.component.html',
  styleUrl: './step-5.component.css'
})
export class Step5Component {
  activeTab: string = 'tabArrears';
  arrearForm: FormGroup;
  changeMode: 'Add' | 'Update' = 'Update';
  @Input() selectedPayroll: any;
  salaryPerDay: any; // or fetch dynamically if needed
  selectedUserId: any;
  arrears: any;
  allUsers: any;
  selectedRecord: any;
  payrollUser: any;
  searchText: string = '';
  selectedPayrollUser: string;
  payrollUsers: any;
  @ViewChild('dialogTemplate') dialogTemplate: TemplateRef<any>;
  columns: TableColumn[] = [
    { key: 'payrollUserDetails', name: 'Employee Name' },
    { key: 'manualArrears', name: 'Manual Arrears'},
    { key: 'arrearDays', name: 'Arrear Days' },
    { key: 'lopReversalDays', name: 'LOP Reversal Days', },
    { key: 'salaryRevisionDays', name: 'Salary Revision Days' },
    { key: 'lopReversalArrears', name: 'LOP Reversal Arrears' },
    { key: 'totalArrears', name: 'Total Arrears' },
    {
      key: 'action', name: 'Action', isAction: true, options: [
        { label: 'Edit', visibility: ActionVisibility.BOTH, icon: 'edit' },
        { label: 'Delete', visibility: ActionVisibility.BOTH, icon: 'delete', cssClass: 'delete-btn' }
      ]
    }
  ]
  constructor(
    private fb: FormBuilder,
    private payrollService: PayrollService,
    private commonService: CommonService,
    private userService: UserService,
    private toast: ToastrService,
    private dialog: MatDialog
  ) {
    this.arrearForm = this.fb.group({
      payrollUser: ['', Validators.required],
      manualArrears: [0, Validators.required],
      arrearDays: [0, Validators.required],
      lopReversalDays: [0, Validators.required],
      salaryRevisionDays: [0, Validators.required],
      lopReversalArrears: [0, Validators.required],
      totalArrears: [0, Validators.required]
    });
  }

  ngOnInit() {
    this.payrollService.allUsers.subscribe(res => {
      this.allUsers = res;
    });
    this.payrollService.payrollUsers.subscribe(res => {
      this.payrollUsers = res;
    });
    this.arrearForm.valueChanges.subscribe(() => {
      this.recalculateFields();
    });
    this.getArrearsByPayroll();
  }

  onActionClick(event: any) {
    switch (event.action.label) {
      case 'Edit':
        this.changeMode = 'Update';
        this.selectedRecord = event.row;
        this.openDialog();
        break;
      case 'Delete':
        this.selectedRecord = event.row;
        this.deleteDialog(this.selectedRecord._id);
        break;
      default:
        break;
    }
  }

  recalculateFields(): void {
    const manualArrears = this.arrearForm.get('manualArrears')?.value || 0;
    const arrearDays = this.arrearForm.get('arrearDays')?.value || 0;
    const lopReversalDays = this.arrearForm.get('lopReversalDays')?.value || 0;
    const salaryRevisionDays = this.arrearForm.get('salaryRevisionDays')?.value || 0;

    const lopReversalArrears = lopReversalDays * this.salaryPerDay;
    const totalArrears = manualArrears + ((arrearDays + salaryRevisionDays) * this.salaryPerDay) + lopReversalArrears;

    this.arrearForm.patchValue({
      lopReversalArrears: lopReversalArrears.toFixed(0),
      totalArrears: totalArrears.toFixed(0)
    }, { emitEvent: false }); // Prevent recursive loop
  }
  getDailySalaryByUserId(userId: string): void {
    this.userService.getDailySalaryByUserId(userId).subscribe(
      (res: any) => {

        this.salaryPerDay = res.data;
        console.log(this.salaryPerDay);
      },
      (error: any) => {
        this.toast.error('Failed to load Salary Per Day', 'Error');
      })
  }
  selectTab(tabId: string) {
    this.activeTab = tabId;
  }

  openDialog() {
    if (this.changeMode == 'Update') {
      this.payrollService.getPayrollUserById(this.selectedRecord.payrollUser).subscribe((res: any) => {
        this.payrollUser = res.data;

        const payrollUser = this.payrollUser?.user;

        this.arrearForm.patchValue({
          payrollUser: this.getUser(payrollUser),
          manualArrears: this.selectedRecord.manualArrears,
          arrearDays: this.selectedRecord.arrearDays,
          lopReversalDays: this.selectedRecord.lopReversalDays,
          salaryRevisionDays: this.selectedRecord.salaryRevisionDays,
          lopReversalArrears: this.selectedRecord.lopReversalArrears,
          totalArrears: this.selectedRecord.totalArrears
        });
        this.arrearForm.get('payrollUser').disable();
      });
    }
    this.dialog.open(this.dialogTemplate, {
      width: '600px',
      disableClose: true
    });
  }

  closeDialog() {
    this.changeMode = 'Update';
    this.dialog.closeAll();
  }

  onUserSelectedFromChild(user: any) {
    this.selectedUserId = user.value.user;
    this.selectedPayrollUser = user?.value?._id;
    console.log(this.selectedUserId);
    console.log(this.selectedPayrollUser);
    this.getDailySalaryByUserId(this.selectedUserId);


    if (this.changeMode != 'Add') { this.getArrears(); }
  }

  getUser(employeeId: string) {
    const matchingUser = this.allUsers?.find(user => user._id === employeeId);
    return matchingUser ? `${matchingUser.firstName} ${matchingUser.lastName}` : 'N/A';
  }

  getArrears() {
    this.payrollService.getArrear(this.selectedPayrollUser || this.selectedRecord?.payrollUser).subscribe((res: any) => {
      this.arrears = res.data;
      const userRequests = this.arrears.map((item: any) => {
        const payrollUser = this.payrollUsers?.find((user: any) => user._id === item.payrollUser);
        return {
          ...item,
          payrollUserDetails: payrollUser ? this.getUser(payrollUser.user) : null
        };
      });
      this.arrears = userRequests
    });
    if (this.changeMode == 'Update' && this.selectedRecord) {
      this.arrearForm.patchValue({
        payrollUser: this.selectedRecord.payrollUser,
        ...this.selectedRecord
      });
    }
  }

  getArrearsByPayroll() {
    this.payrollService.getArrearByPayroll(this.selectedPayroll?._id).subscribe((res: any) => {
      this.arrears = res.data;
      const userRequests = this.arrears.map((item: any) => {
        const payrollUser = this.payrollUsers?.find((user: any) => user._id === item.payrollUser);
        return {
          ...item,
          payrollUserDetails: payrollUser ? this.getUser(payrollUser.user) : null
        };
      });
      this.arrears = userRequests
    });
  }

  onSubmission() {
    this.arrearForm.get('payrollUser').enable();
    if (this.changeMode == 'Update') {
      this.arrearForm.patchValue({
        payrollUser: this.selectedRecord.payrollUser
      });
    }
    console.log(this.arrearForm.value);

    if (this.changeMode == 'Add') {
      this.arrearForm.value.payrollUser = this.selectedPayrollUser;
      this.payrollService.addArrear(this.arrearForm.value).subscribe((res: any) => {
        this.getArrears();
        this.selectedUserId = null;
        this.arrearForm.reset();
        this.toast.success('Manual Arrear Created', 'Successfully!');
        this.closeDialog();
      },
        err => {
          this.toast.error('Manual arrear can not be Created', 'Error!');
        });
    }
    if (this.changeMode == 'Update') {
      this.payrollService.updateArrear(this.selectedRecord._id, this.arrearForm.value).subscribe((res: any) => {
        this.getArrears();
        this.toast.success('Arrear Updated', 'Successfully');
        this.selectedUserId = null;
        this.arrearForm.reset();
        this.changeMode = 'Add';
        this.closeDialog();
      });
    }
  }

  deleteTemplate(_id: string) {
    this.payrollService.deleteArrear(_id).subscribe((res: any) => {
      this.getArrears();
      this.toast.success('Successfully Deleted!!!', 'Arrear');
    },
      (err) => {
        this.toast.error('This Arrear Can not be deleted!');
      });
  }

  deleteDialog(id: string): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'delete') {
        this.deleteTemplate(id);
      }
    });
  }
}