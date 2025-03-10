import { Component, EventEmitter, Output, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { forkJoin } from 'rxjs';
import { CommonService } from 'src/app/_services/common.Service';
import { PayrollService } from 'src/app/_services/payroll.service';
import { UserService } from 'src/app/_services/users.service';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-payroll-history',
  templateUrl: './payroll-history.component.html',
  styleUrl: './payroll-history.component.css'
})
export class PayrollHistoryComponent {
  closeResult: string = '';
  isAllEmployees: boolean = true;
  searchText: string = '';
  payroll: any;
  payrollUsers: any;
  selectedPayroll: any;
  payrollForm: FormGroup;
  payrollUserForm: FormGroup;
  years: number[] = [];
  users: any;
  displayedColumns: string[] = ['payrollPeriod', 'date', 'payrollDetails', 'status', 'actions'];
  dataSource: MatTableDataSource<any>;
  @Output() changeView = new EventEmitter<void>();
  @ViewChild('addDialogTemplate') addDialogTemplate: TemplateRef<any>;
  @ViewChild('addUserModal') addUserModal: TemplateRef<any>;
  salaries: any;

  months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  constructor(private dialog: MatDialog,
    private payrollService: PayrollService,
    private fb: FormBuilder,
    private toast: ToastrService,
    private commonService: CommonService,
    private userService: UserService
  ) {
    this.payrollForm = this.fb.group({
      date: [Date, Validators.required],
      status: ['', Validators.required],
      month: ['', Validators.required],
      year: ['', Validators.required]
    });
    this.payrollUserForm = this.fb.group({
      payroll: [''],
      user: ['', Validators.required],
      totalFlexiBenefits: [0],
      totalCTC: [0],
      totalGrossSalary: [0],
      totalTakeHome: [0],
      status: ['Active']
    })
  }

  ngOnInit() {
    this.generateYearList();
    this.getAllUsers();
    this.getPayrollWithUserCounts();
  }

  goBack() {
    this.isAllEmployees = true;
    this.changeView.emit();
  }

  openSteps() {
    this.payrollService?.payrollUsers.next(this.selectedPayroll?.users);
    this.isAllEmployees = false;
    this.changeView.emit();
  }

  generateYearList() {
    const currentYear = new Date().getFullYear();
    this.years = [currentYear - 1, currentYear, currentYear + 1];
  }

  openAddDialog() {
    const dialogRef = this.dialog.open(this.addDialogTemplate, {
      width: '600px',
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
      }
    });
  }

  closeAddDialog() {
    this.dialog.closeAll();
  }

  openAddUserDialog() {
    const dialogRef = this.dialog.open(this.addUserModal, {
      width: '600px',
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
      }
    });
  }

  closeAddUserDialog() {
    this.dialog.closeAll();
  }

  getPayrollWithUserCounts() {
    const payrollPayload = { skip: '', next: '' };
    this.payrollService.getPayroll(payrollPayload).subscribe((payrollRes: any) => {
      this.payroll = payrollRes.data;

      this.payroll.forEach((payrollItem, index) => {
        const payrollUsersPayload = { skip: '', next: '', payroll: payrollItem._id };

        this.payrollService.getPayrollUsers(payrollUsersPayload).subscribe((payrollUsersRes: any) => {
          const users = payrollUsersRes.data;

          this.payrollUsers = users;
          const activeCount = users.filter(user => user.status === 'Active').length;
          const onHoldCount = users.filter(user => user.status === 'OnHold').length;
          const processedCount = users.filter(user => user.status === 'Processed').length;

          this.payroll[index] = {
            ...payrollItem,
            activeCount: activeCount,
            onHoldCount: onHoldCount,
            processedCount: processedCount,
            users: this.payrollUsers
          };

          this.dataSource = new MatTableDataSource(this.payroll);
        });
      });
    });
  }

  getAllUsers() {
    this.commonService.populateUsers().subscribe((res: any) => {
      this.users = res.data.data;
      this.payrollService.allUsers.next(this.users);
    })
  }

  getMonthName(monthNumber: number): string {
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    return monthNames[monthNumber - 1] || "Invalid month";
  }

  onSubmission() {
    if (this.payrollForm.valid) {
      this.payrollService.addPayroll(this.payrollForm.value).subscribe((res: any) => {
        this.getPayrollWithUserCounts();
        this.toast.success('Payroll Created', 'Successfully!');
        this.closeAddDialog();
      },
        err => {
          this.toast.error('Payroll cannot be created', 'Error!');
        });
    } else {
      this.payrollForm.markAllAsTouched();
    }
  }

  updatePayrollUser() {
    console.log('submission')
    this.payrollUserForm.get('totalGrossSalary').enable();
    this.payrollUserForm.get('totalCTC').enable();
    console.log(this.payrollUserForm.value);
    if (this.payrollUserForm.valid && this.salaries.length > 0) {
      this.payrollUserForm.value.payroll = this.selectedPayroll;

      this.userService.getSalaryByUserId(this.payrollUserForm.value.user).subscribe((res: any) => {
        const lastSalaryRecord = res.data[res.data.length - 1];
        this.payrollUserForm.value.totalGrossSalary = lastSalaryRecord.Amount;

        this.payrollService.addPayrollUser(this.payrollUserForm.value).subscribe((res: any) => {
          this.getPayrollWithUserCounts();
          this.toast.success('Employee added to the payroll', 'Successfully');
          this.payrollUserForm.patchValue({
            user: '',
            payroll: this.selectedPayroll,
            totalFlexiBenefits: 0,
            totalCTC: 0,
            totalGrossSalary: 0,
            totalTakeHome: 0,
            status: 'Active'
          })
        })
      })
    } else {
      this.payrollUserForm.markAllAsTouched();
      if (this.salaries.length === 0) {
        this.toast.error('Please add the Salary details first to add the selected user in payroll.');
      }
    }
  }

  // getGrossSalaryBySalaryStructure(): void {
  //   this.userService.getSalaryByUserId(this.payrollUserForm.value.user).subscribe((res: any) => {
  //     this.salaries = res.data;
  //     const lastSalaryRecord = res.data[res.data.length - 1];
  //     console.log(lastSalaryRecord)
  //     if (lastSalaryRecord?.enteringAmount == 'Monthly') {
  //       const ctc = lastSalaryRecord?.Amount * 12;
  //     }
  //     return this.payrollUserForm.patchValue({
  //       totalGrossSalary: lastSalaryRecord.Amount,
  //       totalCTC: ctc
  //     });

  //     this.payrollUserForm.get('totalGrossSalary').disable();
  //     this.payrollUserForm.get('totalCTC').disable();
  //   });
  // }
  getGrossSalaryBySalaryStructure(): void {
    this.userService.getSalaryByUserId(this.payrollUserForm.value.user).subscribe((res: any) => {
      this.salaries = res.data;
      const lastSalaryRecord = res.data[res.data.length - 1];
  
      if (!lastSalaryRecord) return;
  
      let ctc;
      if (lastSalaryRecord.enteringAmount === 'Monthly') {
        ctc = lastSalaryRecord.Amount * 12;
      } else if (lastSalaryRecord.enteringAmount === 'Yearly') {
        ctc = lastSalaryRecord.Amount / 12;
      } else {
        ctc = lastSalaryRecord.Amount;
      }
  
      this.payrollUserForm.patchValue({
        totalGrossSalary: lastSalaryRecord.Amount,
        totalCTC: ctc
      });
  
      this.payrollUserForm.get('totalGrossSalary')?.disable();
      this.payrollUserForm.get('totalCTC')?.disable();
    });
  }
  
  deleteTemplate(_id: string) {
    this.payrollService.deletePayroll(_id).subscribe((res: any) => {
      this.getPayrollWithUserCounts();
      this.toast.success('Successfully Deleted!!!', 'Payroll')
    },
      (err) => {
        this.toast.error('This Payroll Can not be deleted!')
      })
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