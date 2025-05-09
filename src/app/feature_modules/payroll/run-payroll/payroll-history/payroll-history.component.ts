import { Component, EventEmitter, Output, TemplateRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
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
  salaries: any[] = [];
  addedUserIds: string[] = [];

  months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  constructor(
    private dialog: MatDialog,
    private payrollService: PayrollService,
    private fb: FormBuilder,
    private toast: ToastrService,
    private commonService: CommonService,
    private userService: UserService,
    private cdr: ChangeDetectorRef
  ) {
    this.salaries = [];
    this.addedUserIds = [];
    this.payrollForm = this.fb.group({
      date: [Date, Validators.required],
      status: ['', Validators.required],
      month: ['', Validators.required],
      year: ['', Validators.required]
    });
    this.payrollUserForm = this.fb.group({
      payroll: [''],
      user: ['', Validators.required],
      totalCTC: [0],
      totalGrossSalary: [0],
      status: ['Active']
    });
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
    this.salaries = [];
    this.addedUserIds = [];
    this.payrollUserForm.reset({
      payroll: '',
      user: '',
      totalCTC: 0,
      totalGrossSalary: 0,
      status: 'Active'
    });
    this.payrollUserForm.get('user').setErrors(null);

    // Fetch users already added to the selected payroll
    const payrollUsersPayload = { skip: '', next: '', payroll: this.selectedPayroll };
    this.payrollService.getPayrollUsers(payrollUsersPayload).subscribe(
      (res: any) => {
        this.addedUserIds = res.data.map(user => user.user);
        this.cdr.detectChanges();
      },
      (err) => {
        this.toast.error('Error fetching payroll users');
        this.addedUserIds = [];
        this.cdr.detectChanges();
      }
    );

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
    this.payrollUserForm.reset({
      payroll: '',
      user: '',
      totalCTC: 0,
      totalGrossSalary: 0,
      status: 'Active'
    });
    this.salaries = [];
    this.addedUserIds = [];
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
    });
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
      }, err => {
        this.toast.error('Payroll cannot be created', 'Error!');
      });
    } else {
      this.payrollForm.markAllAsTouched();
    }
  }

  updatePayrollUser() {
    if (this.payrollUserForm.valid && this.salaries?.length > 0) {
      this.payrollUserForm.get('totalGrossSalary').enable();
      this.payrollUserForm.get('totalCTC').enable();
      this.payrollUserForm.value.payroll = this.selectedPayroll;

      this.userService.getSalaryByUserId(this.payrollUserForm.value.user).subscribe((res: any) => {
        const lastSalaryRecord = res.data[res.data.length - 1];
        this.payrollUserForm.value.totalGrossSalary = lastSalaryRecord.Amount;

        this.payrollService.addPayrollUser(this.payrollUserForm.value).subscribe(
          (res: any) => {
            this.getPayrollWithUserCounts();
            this.toast.success('Employee added to the payroll', 'Successfully');
            this.payrollUserForm.reset({
              payroll: '',
              user: '',
              totalCTC: 0,
              totalGrossSalary: 0,
              status: 'Active'
            });
            this.salaries = [];
            this.closeAddUserDialog();
          },
          (err) => {
            this.toast.error('Error adding employee to payroll');
          }
        );
      });
    } else {
      this.payrollUserForm.markAllAsTouched();
      if (this.salaries?.length === 0) {
        this.toast.error('Please add the Salary details first to add the selected user in payroll.');
      } else if (this.payrollUserForm.get('user').hasError('userExists')) {
        this.toast.error('This employee is already added to the payroll.');
      }
    }
  }

  getGrossSalaryBySalaryStructure(): void {
    this.salaries = [];
    this.payrollUserForm.get('user').setErrors(null);
    this.payrollUserForm.patchValue({
      totalGrossSalary: 0,
      totalCTC: 0,
      totalFlexiBenefits: 0,
      totalTakeHome: 0
    });
    this.payrollUserForm.get('totalGrossSalary')?.enable();
    this.payrollUserForm.get('totalCTC')?.enable();

    if (this.payrollUserForm.value.user) {
      // Check if user is already added to the payroll
      if (this.addedUserIds.includes(this.payrollUserForm.value.user)) {
        this.payrollUserForm.get('user').setErrors({ userExists: true });
        this.cdr.detectChanges();
        return;
      }

      this.userService.getSalaryByUserId(this.payrollUserForm.value.user).subscribe(
        (res: any) => {
          this.salaries = res.data || [];
          if (this.salaries.length === 0) {
            this.payrollUserForm.get('user').setErrors({ noSalary: true });
            this.cdr.detectChanges();
            return;
          }
          const lastSalaryRecord = this.salaries[this.salaries.length - 1];
          this.payrollUserForm.patchValue({
            totalGrossSalary: (lastSalaryRecord?.Amount / 12).toFixed(2),
            totalCTC: lastSalaryRecord?.Amount?.toFixed(2)
          });
          this.payrollUserForm.get('totalGrossSalary')?.disable();
          this.payrollUserForm.get('totalCTC')?.disable();
          this.cdr.detectChanges();
        },
        (error) => {
          this.salaries = [];
          this.payrollUserForm.get('user').setErrors({ noSalary: true });
          this.toast.error('Error fetching salary details');
          this.cdr.detectChanges();
        });
    } else {
      this.salaries = [];
      this.cdr.detectChanges();
    }
  }

  deleteTemplate(_id: string) {
    this.payrollService.deletePayroll(_id).subscribe(
      (res: any) => {
        this.getPayrollWithUserCounts();
        this.toast.success('Successfully Deleted!!!', 'Payroll');
      },
      (err) => {
        this.toast.error('This Payroll Can not be deleted!');
      }
    );
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