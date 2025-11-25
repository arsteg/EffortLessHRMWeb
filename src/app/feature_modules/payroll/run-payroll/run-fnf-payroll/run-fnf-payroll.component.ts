import { Component, Input, OnInit, ViewChild, TemplateRef, Output, EventEmitter, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonService } from 'src/app/_services/common.Service';
import { PayrollService } from 'src/app/_services/payroll.service';
import { MatTableDataSource } from '@angular/material/table';
import { ToastrService } from 'ngx-toastr';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { UserService } from 'src/app/_services/users.service';
import { forkJoin, map } from 'rxjs';
import { MatPaginator } from '@angular/material/paginator';
import { TranslateService } from '@ngx-translate/core';
import { ActionVisibility, TableColumn } from 'src/app/models/table-column';
import { DatePipe } from '@angular/common';
import { th } from 'date-fns/locale';
import { toUtcDateOnly } from 'src/app/util/date-utils';

@Component({
  selector: 'app-run-fnf-payroll',
  templateUrl: './run-fnf-payroll.component.html',
  styleUrls: ['./run-fnf-payroll.component.css']
})
export class RunFnfPayrollComponent implements OnInit, AfterViewInit {
  fnfMonths: string[] = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  years: number[] = [];
  selectedYear: number;
  selectedMonth: string;
  fnfForm: FormGroup;
  fnfUserForm: FormGroup;
  selectedFnFUser: any;
  settledUser: any[] = [];
  displayedColumns: string[] = ['period', 'date', 'details', 'status', 'actions'];
  showFnFPayroll: boolean = true;
  showFnFSteps: boolean = false;
  fnfAttendanceUsers: any[] = [];
  selectedUserId: any;
  salary: any;
  @Output() changeView = new EventEmitter<void>();
  selectedFnF: any;
  @ViewChild('fnfUserModal') fnfUserModal: TemplateRef<any>;
  @ViewChild('updateStatus') updateStatus: TemplateRef<any>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  payrollStatus: any;
  payrollStatusArray: any;
  selectedStatus: string = '';
  closeResult: string = '';
  isSubmittingPayroll: boolean = false;
  // Local properties to replace TableService
  dataSource: MatTableDataSource<any> = new MatTableDataSource([]);
  totalRecords: number = 0;
  currentPage: number = 1;
  recordsPerPage: number = 10;
  searchText: string = '';
  columns: TableColumn[] = [
    { key: 'month', name: this.translate.instant('payroll._fnf.table.period'), valueFn: (row) => row.month + '-' + row.year },
    { key: 'date', name: this.translate.instant('payroll._fnf.table.date'), valueFn: (row) => this.datePipe.transform(row.date, 'mediumDate') },
    { key: 'details', name: this.translate.instant('payroll._fnf.table.users'), },
    { key: 'status', name: this.translate.instant('payroll._fnf.table.status'), },
    {
      key: 'action',
      name: this.translate.instant('payroll.actions'),
      isAction: true,
      options: [
        {
          label: this.translate.instant('payroll._history.actions.add_employee'), icon: 'add', visibility: ActionVisibility.BOTH,
          hideCondition: (row) => row?.status !== 'InProgress'
        },
        {
          label: this.translate.instant('payroll.edit'), icon: 'edit', visibility: ActionVisibility.BOTH,
          hideCondition: (row) => row?.status !== 'InProgress'
        },
        {
          label: this.translate.instant('payroll.delete'), icon: 'delete', visibility: ActionVisibility.BOTH, cssClass: "delete-btn",
          hideCondition: (row) => {
            // Hide delete button if any count is greater than 0
            return (row?.processedCount > 0 || row?.activeCount > 0 || row?.onHoldCount > 0);
          }
        },
      ]
    }
  ];
  allData: any = [];

  constructor(
    private modalService: NgbModal,
    private fb: FormBuilder,
    private payrollService: PayrollService,
    private toast: ToastrService,
    private dialog: MatDialog,
    private userService: UserService,
    private translate: TranslateService,
    private datePipe: DatePipe
  ) {
    const currentMonthIndex = new Date().getMonth();
    this.selectedMonth = this.fnfMonths[currentMonthIndex];
    const currentYear = new Date().getFullYear();
    this.selectedYear = currentYear;
    this.fnfForm = this.fb.group({
      date: [new Date(), Validators.required],
      month: [this.selectedMonth, Validators.required],
      year: [this.selectedYear, Validators.required],
    });
    this.fnfUserForm = this.fb.group({
      payrollFNF: ['', Validators.required],
      user: ['', Validators.required],
      totalFlexiBenefits: [{ value: 0, disabled: true }, Validators.required],
      totalCTC: [0, Validators.required],
      totalGrossSalary: [0, Validators.required],
      totalTakeHome: [0, Validators.required]
    });

    // Set custom filter predicate to search by period and status
    this.dataSource.filterPredicate = (data: any, filter: string) => {
      const searchString = filter.toLowerCase();
      return (
        `${data.month} ${data.year}`.toLowerCase().includes(searchString) ||
        data.status.toLowerCase().includes(searchString) ||
        data.details.toLowerCase().includes(searchString)
      );
    };
  }

  ngOnInit() {
    this.generateYearList();
    this.getSettledUsers();
    this.getPayrollStatus();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.fetchFnFPayroll();
  }

  onSearch(search: any) {
    const data = this.allData?.filter(row => {
      const found = this.columns.some(col => {
        return row[col.key]?.toString().toLowerCase().includes(search.toLowerCase());
      });
      return found;
    });
    console.log(data)
    this.dataSource.data = data;
  }


  onAction(event: any) {
    switch (event.action.label) {
      case 'Add Employee':
        this.selectedFnF = event.row?._id; this.editFnF(this.selectedFnF)
        break;
      case 'Edit':
        this.selectedFnF = event.row; this.openFnFSteps(this.openFnFSteps);
        break;
      case 'Delete': this.deleteFnF(event.row?._id); break;
      default:
        this.payrollStatusArray.forEach(status => {
          if (status === event.action.label) {
            this.selectedFnF = event.row;
            this.openUpdateStatusDialog(event.action.label);
          }
        })
        break;
    }
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
    this.dialog.closeAll();
  }

  getPayrollStatus() {
    this.payrollService.getFNFPayrollStatus().subscribe((res: any) => {
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

  updatePayrollStatus() {
    const id = this.selectedFnF?._id;
    const payload = {
      updatedOnDate: new Date(),
      status: this.selectedStatus
    };
    this.payrollService.updateFnF(id, payload).subscribe(
      (res: any) => {
        this.translate.get([
          'payroll._fnf.toast.status_updated',
          'payroll._fnf.title'
        ]).subscribe(translations => {
          this.toast.success(
            translations['payroll._fnf.toast.status_updated'],
            translations['payroll._fnf.title']
          );
        });
        this.fetchFnFPayroll();
        this.closeAddDialog();
      },
      (err) => {
        this.translate.get('payroll._fnf.title').subscribe(title => {
          this.toast.error(
            err?.error?.message || this.translate.instant('payroll._fnf.toast.error_update_status'),
            title
          );
        });
      }
    );
  }

  getSettledUsers() {
    this.userService.getUsersByStatus('Settled').subscribe((res: any) => {
      this.settledUser = res.data['users'];
    });
  }

  onUserSelectedFromChild(userId: any) {
    this.selectedUserId = userId;
    this.fnfUserForm.patchValue({ user: userId });
    this.getSalarydetailsByUser();
  }

  getSalarydetailsByUser() {
    let totalCTC = 0;
    this.userService.getSalaryByUserId(this.selectedUserId).subscribe(
      (res: any) => {
        const lastSalaryRecord = res.data[res.data.length - 1];
        if (lastSalaryRecord.enteringAmount === 'Monthly') {
          totalCTC = lastSalaryRecord.Amount * 12;
        }
        if (lastSalaryRecord.enteringAmount === 'Yearly') {
          totalCTC = lastSalaryRecord.Amount;
        }
        this.payrollService.getFlexiByUsers(this.selectedUserId).subscribe(
          (res: any) => {
            const totalFlexiBenefits = res?.data?.records?.reduce((sum, flexiBenefit) =>
              sum + (flexiBenefit.TotalFlexiBenefitAmount || 0), 0) || 0;

            const totalFDYearlyAmount = lastSalaryRecord.fixedDeductionList?.reduce((sum, deduction) =>
              sum + (deduction.yearlyAmount || 0), 0) || 0;

            const totalVDYearlyAmount = lastSalaryRecord.variableDeductionList?.reduce((sum, deduction) =>
              sum + (deduction.yearlyAmount || 0), 0) || 0;

            const totalECYearlyAmount = lastSalaryRecord.employerContributionList?.reduce((sum, contribution) =>
              sum + (contribution.yearlyAmount || 0), 0) || 0;

            const deductions = totalFDYearlyAmount + totalVDYearlyAmount + totalECYearlyAmount;
            const totalTakeHome = totalCTC - deductions;

            this.fnfUserForm.patchValue({
              totalFlexiBenefits: totalFlexiBenefits,
              totalCTC: totalCTC,
              totalGrossSalary: lastSalaryRecord.Amount,
              totalTakeHome: totalTakeHome
            });
            this.fnfUserForm.get('totalFlexiBenefits').disable();
            this.fnfUserForm.get('totalCTC').disable();
            this.fnfUserForm.get('totalGrossSalary').disable();
            this.fnfUserForm.get('totalTakeHome').disable();
          },
          (err) => {
            this.translate.get('payroll._fnf.title').subscribe(title => {
              this.toast.error(
                this.translate.instant('payroll._fnf.toast.error_fetch_flexi'),
                title
              );
            });
          }
        );
      },
      (err) => {
        this.translate.get('payroll._fnf.title').subscribe(title => {
          this.toast.error(
            this.translate.instant('payroll._fnf.toast.error_fetch_salary'),
            title
          );
        });
      }
    );
  }

  generateYearList() {
    const currentYear = new Date().getFullYear();
    this.years = [currentYear - 1, currentYear, currentYear + 1];
  }

  fetchFnFPayroll() {
    const payload = {
      skip: ((this.currentPage - 1) * this.recordsPerPage).toString(),
      next: this.recordsPerPage.toString()
    };

    this.payrollService.getFnF(payload).subscribe(
      (res: any) => {
        const fnfData = res.data;
        this.totalRecords = res.total;

        const userRequests = fnfData.map((fnf: any) =>
          this.payrollService.getFnFUsers({ skip: '', next: '', payrollFNF: fnf?._id }).pipe(
            map((userRes: any) => ({
              fnfId: fnf._id,
              users: userRes.data
            }))
          )
        );

        forkJoin(userRequests).subscribe(
          (userResponses: any[]) => {
            const updatedFnfData = fnfData.map((fnf: any) => {
              const userResponse = userResponses.find(resp => resp.fnfId === fnf._id);
              const users = userResponse ? userResponse.users : [];
              const userNames = users.map((user: any) => {
                const matchedUser = this.settledUser.find((u: any) => u._id === user.user);
                return matchedUser
                  ? `${matchedUser.firstName} ${matchedUser.lastName}`
                  : 'Unknown User';
              });
              return {
                ...fnf,
                userList: users,
                details: userNames.length > 0 ? userNames.join(', ') : 'No Users'
              };
            });
            this.dataSource.data = updatedFnfData;
            this.allData = updatedFnfData;
          },
          (error: any) => {
            this.translate.get('payroll._fnf.title').subscribe(title => {
              this.toast.error(
                this.translate.instant('payroll._fnf.toast.error_fetch_users'),
                title
              );
            });
          }
        );
      },
      (error: any) => {
        this.translate.get('payroll._fnf.title').subscribe(title => {
          this.toast.error(
            this.translate.instant('payroll._fnf.toast.error_fetch_payroll'),
            title
          );
        });
      }
    );
  }

  applyFilter() {
    this.dataSource.filter = this.searchText.trim().toLowerCase();
    this.currentPage = 1; // Reset to first page on filter
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  open(content: any) {
    if (!this.settledUser || this.settledUser.length === 0) {
      // Show message here
      this.toast.warning('No settled users available.', 'Warning');
      return;
    }
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', backdrop: 'static' }).result.then(
      (result) => {
        this.closeResult = `Closed with: ${result}`;
      },
      (reason) => {
        this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
      });
  }

  editFnF(user: any) {
    this.payrollService.selectedFnFPayroll.next(user);
    this.selectedFnFUser = user;
    this.fnfUserForm.patchValue({
      payrollFNF: this.selectedFnFUser._id
    });
    this.open(this.fnfUserModal);
  }

  openFnFSteps(fnfPayroll: any) {
    this.selectedFnFUser = fnfPayroll;
    this.showFnFPayroll = false;
    this.showFnFSteps = true;
    this.changeView.emit();
  }

  goBack() {
    this.showFnFPayroll = true;
    this.changeView.emit();
  }

  onSubmission() {
    this.isSubmittingPayroll = true;
    console.log(this.isSubmittingPayroll);
    this.fnfForm.get('date')?.enable();
    if (this.fnfForm.invalid) {
      this.fnfForm.markAllAsTouched();
      this.toast.error(this.translate.instant('payroll.RequiredFieldAreMissing'), 'Error!');
      this.isSubmittingPayroll = false;
      return;
    }
    if (this.fnfForm.valid) {
      const payload = { ...this.fnfForm.value };
      payload.date = toUtcDateOnly(payload.date);
      this.payrollService.addFnF(payload).subscribe(
        (res: any) => {

          this.translate.get([
            'payroll._fnf.toast.created',
            'payroll._fnf.title'
          ]).subscribe(translations => {
            this.toast.success(
              translations['payroll._fnf.toast.created'],
              translations['payroll._fnf.title']
            );
          });
          this.fetchFnFPayroll();
          this.modalService.dismissAll();
          this.resetForm();
        },
        (err) => {
          const errorMessage = err?.error?.message || err?.message || err
            || this.translate.instant('payroll._fnf.toast.error_create')
            ;
          this.toast.error(errorMessage, 'Error!');
          this.isSubmittingPayroll = false;
        }
      );
    } else {
      this.fnfForm.markAllAsTouched();
    }
  }

  getTotalByUser(userId: string) {
    let totalCTC = 0;
    this.userService.getSalaryByUserId(userId).subscribe(
      (res: any) => {
        const lastSalaryRecord = res.data[res.data.length - 1];
        if (lastSalaryRecord.enteringAmount === 'Monthly') {
          totalCTC = lastSalaryRecord.Amount * 12;
        }
        if (lastSalaryRecord.enteringAmount === 'Yearly') {
          totalCTC = lastSalaryRecord.Amount;
        }
        this.payrollService.getFlexiByUsers(userId).subscribe(
          (res: any) => {
            const totalFlexiBenefits = res?.data?.records?.reduce((sum, flexiBenefit) =>
              sum + (flexiBenefit.TotalFlexiBenefitAmount || 0), 0) || 0;

            const totalFDYearlyAmount = lastSalaryRecord.fixedDeductionList?.reduce((sum, deduction) =>
              sum + (deduction.yearlyAmount || 0), 0) || 0;

            const totalVDYearlyAmount = lastSalaryRecord.variableDeductionList?.reduce((sum, deduction) =>
              sum + (deduction.yearlyAmount || 0), 0) || 0;

            const totalECYearlyAmount = lastSalaryRecord.employerContributionList?.reduce((sum, contribution) =>
              sum + (contribution.yearlyAmount || 0), 0) || 0;

            const deductions = totalFDYearlyAmount + totalVDYearlyAmount + totalECYearlyAmount;
            const totalTakeHome = totalCTC - deductions;

            this.fnfUserForm.patchValue({
              totalFlexiBenefits: totalFlexiBenefits,
              totalCTC: totalCTC,
              totalGrossSalary: lastSalaryRecord.Amount,
              totalTakeHome: totalTakeHome
            });
            this.fnfUserForm.get('totalFlexiBenefits').disable();
            this.fnfUserForm.get('totalCTC').disable();
            this.fnfUserForm.get('totalGrossSalary').disable();
            this.fnfUserForm.get('totalTakeHome').disable();
          },
          (err) => {
            this.translate.get('payroll._fnf.title').subscribe(title => {
              this.toast.error(
                this.translate.instant('payroll._fnf.toast.error_fetch_flexi'),
                title
              );
            });
          }
        );
      },
      (err) => {
        this.translate.get('payroll._fnf.title').subscribe(title => {
          this.toast.error(
            this.translate.instant('payroll._fnf.toast.error_fetch_salary'),
            title
          );
        });
      }
    );
  }

  onFnFUserSubmission() {
    this.fnfUserForm.patchValue({
      user: this.selectedUserId,
      payrollFNF: this.selectedFnF
    });

    this.fnfUserForm.get('totalFlexiBenefits').enable();
    this.fnfUserForm.get('totalCTC').enable();
    this.fnfUserForm.get('totalGrossSalary').enable();
    this.fnfUserForm.get('totalTakeHome').enable();
    console.log(this.selectedFnF, this.fnfUserForm.value);
    if (this.fnfUserForm.valid) {
      this.payrollService.addFnFUser(this.fnfUserForm.value).subscribe(
        (res: any) => {
          this.translate.get([
            'payroll._fnf.toast.user_updated',
            'payroll._fnf.title'
          ]).subscribe(translations => {
            this.toast.success(
              translations['payroll._fnf.toast.user_updated'],
              translations['payroll._fnf.title']
            );
          });
          this.fetchFnFPayroll();
          this.modalService.dismissAll();
        },
        (error) => {
          this.translate.get('payroll._fnf.title').subscribe(title => {
            this.toast.error(
              error?.error?.message || this.translate.instant('payroll._fnf.toast.error_update_user'),
              title
            );
          });
        }
      );
    } else {
      this.fnfUserForm.markAllAsTouched();
    }

    this.fnfUserForm.get('totalFlexiBenefits').disable();
    this.fnfUserForm.get('totalCTC').disable();
    this.fnfUserForm.get('totalGrossSalary').disable();
    this.fnfUserForm.get('totalTakeHome').disable();
  }

  resetForm() {
    const currentMonthIndex = new Date().getMonth();
    this.selectedMonth = this.fnfMonths[currentMonthIndex];
    const currentYear = new Date().getFullYear();
    this.selectedYear = currentYear;
    this.fnfForm.setValue({
      date: new Date(),
      month: this.selectedMonth,
      year: this.selectedYear
    });
    this.isSubmittingPayroll = false;
  }

  deleteTemplate(_id: string) {
    this.payrollService.deleteFnF(_id).subscribe(
      (res: any) => {
        this.translate.get([
          'payroll._fnf.toast.deleted',
          'payroll._fnf.title'
        ]).subscribe(translations => {
          this.toast.success(
            translations['payroll._fnf.toast.deleted'],
            translations['payroll._fnf.title']
          );
        });
        this.dataSource.data = this.dataSource.data.filter(item => item._id !== _id);
      },
      (error) => {
        this.translate.get('payroll._fnf.title').subscribe(title => {
          this.toast.error(
            error?.error?.message || this.translate.instant('payroll._fnf.toast.error_delete'),
            title
          );
        });
      }
    );
  }

  deleteFnF(id: string): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, { width: '400px' });
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'delete') {
        this.deleteTemplate(id);
      }
    });
  }

  completeFnF() {
    this.translate.get([
      'payroll._fnf.toast.completed',
      'payroll._fnf.title'
    ]).subscribe(translations => {
      this.toast.success(
        translations['payroll._fnf.toast.completed'],
        translations['payroll._fnf.title']
      );
    });
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }

  getUserName(userId: string) {
    const matchedName = this.settledUser.find(user => user._id === userId);
    return matchedName ? `${matchedName.firstName} ${matchedName.lastName}` : '';
  }

  onPageChange(event: any) {
    this.currentPage = event.pageIndex + 1;
    this.recordsPerPage = event.pageSize;
    this.fetchFnFPayroll();
  }

  notSettledUser() {
    this.toast.error('No settled users found!', 'Error');
  }
}