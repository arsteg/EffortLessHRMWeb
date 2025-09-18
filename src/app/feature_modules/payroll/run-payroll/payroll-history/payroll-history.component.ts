import { Component, EventEmitter, Output, TemplateRef, ViewChild, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { CommonService } from 'src/app/_services/common.Service';
import { PayrollService } from 'src/app/_services/payroll.service';
import { UserService } from 'src/app/_services/users.service';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { TranslateService } from '@ngx-translate/core';
import { ActionVisibility, TableColumn } from 'src/app/models/table-column';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-payroll-history',
  templateUrl: './payroll-history.component.html',
  styleUrls: ['./payroll-history.component.css']
})
export class PayrollHistoryComponent implements AfterViewInit {
  closeResult: string = '';
  isAllEmployees: boolean = true;
  payroll: any;
  payrollUsers: any;
  selectedPayroll: any;
  payrollForm: FormGroup;
  payrollUserForm: FormGroup;
  years: number[] = [];
  users: any;
  displayedColumns: string[] = ['payrollPeriod', 'date', 'payrollDetails', 'status', 'actions'];
  @Output() changeView = new EventEmitter<void>();
  @ViewChild('addDialogTemplate') addDialogTemplate: TemplateRef<any>;
  @ViewChild('addUserModal') addUserModal: TemplateRef<any>;
  @ViewChild('updateStatus') updateStatus: TemplateRef<any>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  salaries: any[] = [];
  addedUserIds: string[] = [];
  payrollStatus: any;
  payrollStatusArray: any;
  selectedStatus: string = '';
  payrollPeriod: any;
  duplicatePayrollError = false;
  dataSource = new MatTableDataSource<any>([]);
  totalRecords = 0;
  pageSize = 10;
  currentPage = 1;
  pageSizeOptions = [5, 10, 25, 50, 100];
  searchText: string = '';
  isSubmitting: boolean = false;
  isSubmittingPayroll: boolean = false;
  columns: TableColumn[] = [
    { key: 'month', name: this.translate.instant('payroll._history.table.period'), valueFn: (row) => row.month + '-' + row.year },
    { key: 'date', name: this.translate.instant('payroll._history.table.date'), valueFn: (row) => this.datePipe.transform(row.date, 'mediumDate') },
    { key: 'processedCount', name: this.translate.instant('payroll._history.table.processed') },
    { key: 'activeCount', name: this.translate.instant('payroll._history.table.active') },
    { key: 'onHoldCount', name: this.translate.instant('payroll._history.table.onhold') },
    { key: 'status', name: this.translate.instant('payroll._history.table.status') },
    {
      key: 'action',
      name: this.translate.instant('payroll.actions'),
      isAction: true,
      options: [
        {
          label: 'Add Employee', icon: 'add', visibility: ActionVisibility.BOTH,
          hideCondition: (row) => row?.status !== 'InProgress'
        },
        {
          label: 'Edit', icon: 'edit', visibility: ActionVisibility.BOTH,
          hideCondition: (row) => row?.status !== 'InProgress'
        },
        {
          label: 'Delete', icon: 'delete', visibility: ActionVisibility.BOTH, cssClass: "delete-btn",
          hideCondition: (row) => {
            // Hide delete button if any count is greater than 0
            return (row?.processedCount > 0 || row?.activeCount > 0 || row?.onHoldCount > 0);
          }
        },
      ]
    },
  ];
  allData: any = []
  months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  constructor(
    private dialog: MatDialog,
    private payrollService: PayrollService,
    private fb: FormBuilder,
    private toast: ToastrService,
    private commonService: CommonService,
    private userService: UserService,
    private cdr: ChangeDetectorRef,
    private translate: TranslateService,
    private datePipe: DatePipe
  ) {
    this.salaries = [];
    this.addedUserIds = [];
    this.payrollForm = this.fb.group({
      date: [Date, Validators.required],
      month: ['', Validators.required],
      year: ['', Validators.required]
    });
    this.payrollUserForm = this.fb.group({
      payroll: [''],
      user: ['', Validators.required],
      totalCTC: [0],
      totalGrossSalary: [0]
    });

    // Set custom filter predicate to search by payroll period and status
    this.dataSource.filterPredicate = (data: any, filter: string) => {
      const searchString = filter.toLowerCase();
      return (
        `${data.month} ${data.year}`.toLowerCase().includes(searchString) ||
        data.status.toLowerCase().includes(searchString)
      );
    };
  }

  ngOnInit() {
    this.getPayrollStatus();
    this.generateYearList();
    this.getAllUsers();
    this.getPayroll();
    this.payrollForm.get('month').valueChanges.subscribe(() => {
      this.checkForDuplicatePayrollPeriod();
    });
    this.payrollForm.get('year').valueChanges.subscribe(() => {
      this.checkForDuplicatePayrollPeriod();
    });
    this.payrollForm.get('date').disable();
    this.subscribeToMonthAndYearChanges();
  }
  subscribeToMonthAndYearChanges(): void {
    this.payrollForm.get('month').valueChanges.subscribe(() => {
      this.setDateToLastDayOfMonth();
    });

    this.payrollForm.get('year').valueChanges.subscribe(() => {
      this.setDateToLastDayOfMonth();
    });
  }
  setDateToLastDayOfMonth(): void {
    const month = this.payrollForm.get('month').value;
    const year = this.payrollForm.get('year').value;

    if (month && year) {
      const monthIndex = this.getMonthIndex(month); // You'll implement this
      const lastDay = new Date(year, monthIndex + 1, 0); // The 0th day of the next month is the last day of the current month
      this.payrollForm.get('date').setValue(lastDay);
    }
  }
  getMonthIndex(monthName: string): number {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months.indexOf(monthName);
  }
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.getPayrollWithUserCounts();
  }

  onSearch(search: any) {
    const data = this.allData?.filter(row => {
      const found = this.columns.some(col => {
        return row[col.key]?.toString().toLowerCase().includes(search.toLowerCase());
      });
      return found;
    });
    this.dataSource.data = data;
  }


  onAction(event: any) {
    switch (event.action.label) {
      case 'Add Employee':
        this.selectedPayroll = event.row?._id; this.openAddUserDialog()
        break;
      case 'Edit':
        this.selectedPayroll = event.row; this.openSteps();
        break;
      case 'Delete': this.deleteDialog(event.row?._id); break;
      default:
        this.payrollStatusArray.forEach(status => {
          if (status === event.action.label) {
            this.selectedPayroll = event.row;
            this.openUpdateStatusDialog(event.action.label);
          }
        })
        break;
    }
  }

  checkForDuplicatePayrollPeriod() {
    const selectedMonth = this.payrollForm.get('month').value;
    const selectedYear = this.payrollForm.get('year').value;
    if (selectedMonth && selectedYear) {
      this.duplicatePayrollError = this.payrollPeriod?.some(period =>
        period?.month === selectedMonth && period?.year === selectedYear
      );
    } else {
      this.duplicatePayrollError = false;
    }
  }

  getPayroll() {
    const pagination = {
      skip: ((this.currentPage - 1) * this.pageSize).toString(),
      next: this.pageSize.toString()
    };
    this.payrollService.getPayroll(pagination).subscribe((res: any) => {
      this.payrollPeriod = res.data;
    });
  }

  getPayrollStatus() {
    this.payrollService.getPayrollStatus().subscribe((res: any) => {
      this.payrollStatus = res.data;
      this.payrollStatusArray = Object.values(this.payrollStatus).filter(status => status);
      const actionColumn = this.columns.find((col) => col.key === 'action');
      this.payrollStatusArray.forEach((value: any) => {
        actionColumn.options.push({
          label: value,
          icon: '',
          visibility: ActionVisibility.LABEL,
          hideCondition: (row) => {
            return row.status === value
          }
        })
      });
    });
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

  openUpdateStatusDialog(status: string) {
    this.selectedStatus = status;
    const dialogRef = this.dialog.open(this.updateStatus, {
      width: '600px',
      disableClose: true,
      data: status
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) { }
    });
  }

  closeAddDialog() {
    this.isSubmittingPayroll = false;
    this.payrollForm.reset({
      year: '',
      month: '',
      date: ''
    });
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

    const payrollUsersPayload = {
      skip: '',
      next: '',
      payroll: this.selectedPayroll
    };
    this.payrollService.getPayrollUsers(payrollUsersPayload).subscribe(
      (res: any) => {
        this.addedUserIds = res.data.map(user => user.user);
      },
      (err) => {
        this.translate.get('payroll._history.toast.error_fetch_users').subscribe(message => {
          this.toast.error(message, this.translate.instant('payroll._history.title'));
        });
        this.addedUserIds = [];
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
      totalGrossSalary: 0
    });
    this.salaries = [];
    this.addedUserIds = [];
    this.dialog.closeAll();
  }

  updatePayrollStatus() {
    const id = this.selectedPayroll?._id;
    const payload = {
      updatedOnDate: new Date(),
      status: this.selectedStatus
    };
    this.payrollService.updatePayroll(id, payload).subscribe(
      (res: any) => {
        this.translate.get([
          'payroll._history.toast.status_updated',
          'payroll._history.title'
        ]).subscribe(translations => {
          this.toast.success(
            translations['payroll._history.toast.status_updated'],
            translations['payroll._history.title']
          );
        });
        this.getPayrollWithUserCounts();
        this.closeAddDialog();
      },
      (err) => {
        this.translate.get('payroll._history.title').subscribe(title => {
          this.toast.error(
            err?.error?.message || this.translate.instant('payroll._history.toast.error_update_status'),
            title
          );
        });
      }
    );
  }

  getPayrollWithUserCounts() {
    const pagination = {
      skip: ((this.currentPage - 1) * this.pageSize).toString(),
      next: this.pageSize.toString()
    };
    this.payrollService.getPayroll(pagination).subscribe((payrollRes: any) => {
      this.payroll = payrollRes.data;

      const payrollData = this.payroll.map((payrollItem: any) => {
        return new Promise(resolve => {
          const payrollUsersPayload = { skip: '', next: '', payroll: payrollItem._id };
          this.payrollService.getPayrollUsers(payrollUsersPayload).subscribe((payrollUsersRes: any) => {
            const users = payrollUsersRes.data;
            this.payrollUsers = users;
            const activeCount = users.filter(user => user.status === 'Active').length;
            const onHoldCount = users.filter(user => user.status === 'OnHold').length;
            const processedCount = users.filter(user => user.status === 'Processed').length;

            resolve({
              ...payrollItem,
              activeCount: activeCount,
              onHoldCount: onHoldCount,
              processedCount: processedCount,
              users: this.payrollUsers
            });
          });
        });
      });

      Promise.all(payrollData).then(data => {
        this.dataSource.data = data;
        this.allData = data;
        this.totalRecords = payrollRes.total;
        this.cdr.detectChanges();
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
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return monthNames[monthNumber - 1] || 'Invalid month';
  }

  onSubmission() {
    this.isSubmittingPayroll = true;
    if (this.payrollForm.invalid) {
      this.payrollUserForm.markAllAsTouched();
      this.toast.error(this.translate.instant('payroll.RequiredFieldAreMissing'), 'Error!');
      this.isSubmittingPayroll = false;
      return;
    }
    if (this.payrollForm.valid) {
      this.payrollForm.get('date').enable();
      this.payrollForm.patchValue({
        date: this.payrollForm.value.date
      });
      this.payrollService.addPayroll(this.payrollForm.value).subscribe(
        (res: any) => {
          this.translate.get([
            'payroll._history.toast.created',
            'payroll._history.title'
          ]).subscribe(translations => {
            this.toast.success(
              translations['payroll._history.toast.created'],
              translations['payroll._history.title']
            );
          });
          this.getPayrollWithUserCounts();
          this.closeAddDialog();
        },
        err => {
          const errorMessage = err?.error?.message || err?.message || err
            || this.translate.instant('payroll._history.toast.error_create');
          this.toast.error(errorMessage, 'Error!');
          this.isSubmittingPayroll = false;
        }
      );
    } else {
      this.payrollForm.markAllAsTouched();
      this.isSubmittingPayroll = false;
    }
  }
  disableSalary() {
    this.payrollUserForm.get('totalGrossSalary').disable();
    this.payrollUserForm.get('totalCTC').disable();
    this.isSubmitting = false;
  }
  updatePayrollUser() {
    this.isSubmitting = true;
    if (this.payrollUserForm.invalid) {
      this.payrollUserForm.markAllAsTouched();  // This triggers validation errors
      this.toast.error(this.translate.instant('payroll.RequiredFieldAreMissing'), 'Error!');
      this.isSubmitting = false;
      return;
    }
    if (this.payrollUserForm.valid && this.salaries?.length > 0) {
      this.payrollUserForm.get('totalGrossSalary').enable();
      this.payrollUserForm.get('totalCTC').enable();
      this.payrollUserForm.value.payroll = this.selectedPayroll;

      this.userService.getSalaryByUserId(this.payrollUserForm.value.user).subscribe((res: any) => {
        const lastSalaryRecord = res.data[res.data.length - 1];
        this.payrollUserForm.value.totalGrossSalary = lastSalaryRecord.Amount;

        this.payrollService.addPayrollUser(this.payrollUserForm.value).subscribe(
          (res: any) => {
            this.translate.get([
              'payroll._history.toast.employee_added',
              'payroll._history.title'
            ]).subscribe(translations => {
              this.toast.success(
                translations['payroll._history.toast.employee_added'],
                translations['payroll._history.title']
              );
              this.disableSalary();
            });
            this.getPayrollWithUserCounts();
            this.payrollUserForm.reset({
              payroll: '',
              user: '',
              totalCTC: 0,
              totalGrossSalary: 0
            });
            this.salaries = [];
            this.closeAddUserDialog();
          },
          (err) => {
            this.translate.get('payroll._history.title').subscribe(title => {
              this.toast.error(
                err?.error?.message || this.translate.instant('payroll._history.toast.error_add_employee'),
                title
              );
            });
            this.disableSalary();
          }
        );
      });
    } else {
      this.disableSalary();
      this.payrollUserForm.markAllAsTouched();
      if (this.salaries?.length === 0) {
        this.translate.get('payroll._history.form.no_salary').subscribe(message => {
          this.toast.error(message);
        });
      } else if (this.payrollUserForm.get('user').hasError('userExists')) {
        this.translate.get('payroll._history.form.user_exists').subscribe(message => {
          this.toast.error(message);
        });
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
          this.translate.get('payroll._history.toast.error_salary_fetch').subscribe(message => {
            this.toast.error(message, this.translate.instant('payroll._history.title'));
          });
          this.cdr.detectChanges();
        }
      );
    } else {
      this.salaries = [];
      this.cdr.detectChanges();
    }
  }

  deleteTemplate(_id: string) {
    this.payrollService.deletePayroll(_id).subscribe(
      (res: any) => {
        this.translate.get([
          'payroll._history.toast.deleted',
          'payroll._history.title'
        ]).subscribe(translations => {
          this.toast.success(
            translations['payroll._history.toast.deleted'],
            translations['payroll._history.title']
          );
        });
        this.dataSource.data = this.dataSource.data.filter(item => item._id !== _id);
        this.totalRecords--;
        this.cdr.detectChanges();
      },
      (err) => {
        this.translate.get('payroll._history.title').subscribe(title => {
          this.toast.error(
            err?.error?.message || this.translate.instant('payroll._history.toast.error_delete'),
            title
          );
        });
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

  onPageChange(event: any) {
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.getPayrollWithUserCounts();
  }

  applyFilter() {
    this.dataSource.filter = this.searchText.trim().toLowerCase();
    this.currentPage = 1;
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
}