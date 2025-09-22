import { Component, TemplateRef, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { AttendanceService } from 'src/app/_services/attendance.service';
import { CommonService } from 'src/app/_services/common.Service';
import { UserService } from 'src/app/_services/users.service';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';
import { catchError, forkJoin, map, Observable, of } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { SeparationService } from 'src/app/_services/separation.service';
import { ActionVisibility, TableColumn } from 'src/app/models/table-column';

@Component({
  selector: 'app-attendance-process',
  templateUrl: './attendance-process.component.html',
  styleUrls: ['./attendance-process.component.css']
})
export class AttendanceProcessComponent {
  activeTab: string = 'attendanceProcess';
  searchText: string = '';
  years: string[] = [];
  selectedYear: string;
  changeMode: 'Add' | 'Update' = 'Update';

  lopForm: FormGroup;
  attendanceProcessForm: FormGroup;
  fnfAttendanceProcessForm: FormGroup;

  showRemoveButton = false;
  fnfError: boolean = false;
  attendancePeriodError: boolean = false;
  lopNotCreatedError: boolean = false;
  terminationDateError: boolean = false;
  noticePeriodError: boolean = false;
  resignationMonth: number;
  resignationYear: number;

  processAttendance: any;
  lop: any;
  fnfAttendanceProcess: any;
  fnfAttendanceProcessUsers: any;
  allAssignee: any[];
  failedUsers: any[];
  activeTabIndex: number = 0;
  usersForFNF: any;
  selectedFnfUser: string;
  termination: any;
  terminationDate: any;
  terminationMonth: any;
  terminationYear: any;
  resignationDate: any;
  noticePeriod: any;
  lastWorkingDay: any;
  isSubmitted: boolean = false;
  bsValue = new Date();
  selectedMonth: string = (new Date().getMonth() + 1).toString();
  attendanceTemplateAssignment: any;

  months = [
    { name: 'January', value: '1' },
    { name: 'February', value: '2' },
    { name: 'March', value: '3' },
    { name: 'April', value: '4' },
    { name: 'May', value: '5' },
    { name: 'June', value: '6' },
    { name: 'July', value: '7' },
    { name: 'August', value: '8' },
    { name: 'September', value: '9' },
    { name: 'October', value: '10' },
    { name: 'November', value: '11' },
    { name: 'December', value: '12' }
  ];
  setlledUsers: any;


  @ViewChild('LopFormDialog') dialogTemplate: TemplateRef<any>;

  processAttendanceColumns: TableColumn[] = [{
    key: 'attendanceProcessPeriod',
    name: 'Attendance Process Period',
    valueFn: (row) => {
      return `${row?.attendanceProcessPeriodMonth}-${row?.attendanceProcessPeriodYear}`
    }
  },
  {
    key: 'users',
    name: 'Employee'
  },
  {
    key: 'runDate',
    name: 'Run Date',
    valueFn: (row) => row?.runDate ? this.datePipe.transform(row?.runDate, 'mediumDate') : ''
  },
  {
    key: 'exportToPayroll',
    name: 'Export to Payroll',
    valueFn: (row) => row?.exportToPayroll ? 'Yes' : 'No'
  },
  {
    key: 'actions',
    name: 'Action',
    isAction: true,
    options: [
      { label: 'Delete', visibility: ActionVisibility.BOTH, icon: 'delete', cssClass: 'delete-btn' }
    ]
  }];

  fnfAttendanceProcessColumns: TableColumn[] = [{
    key: 'attendanceProcessPeriod',
    name: 'Attendance Process Period',
    valueFn: (row) => {
      return `${row?.attendanceProcessPeriodMonth}-${row?.attendanceProcessPeriodYear}`
    }
  },
  {
    key: 'employee',
    name: 'Employee'
  },
  {
    key: 'runDate',
    name: 'Run Date',
    valueFn: (row) => row?.runDate ? this.datePipe.transform(row?.runDate, 'mediumDate') : ''
  },
  {
    key: 'exportToPayroll',
    name: 'Export to Payroll',
    valueFn: (row) => row?.exportToPayroll ? 'Yes' : 'No'
  },
  {
    key: 'isFNF',
    name: 'Full & Final Applicable',
    valueFn: (row) => row?.isFNF ? 'Yes' : 'No'
  }]


  constructor(
    private attendanceService: AttendanceService,
    private fb: FormBuilder,
    public commonService: CommonService,
    private toast: ToastrService,
    private dialog: MatDialog,
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router,
    private separationService: SeparationService,
    private datePipe: DatePipe,
  ) {
    this.lopForm = this.fb.group({
      month: ['', Validators.required],
      year: ['', Validators.required],
      user: [[], [Validators.required, this.attendanceTemplateValidator()]]
    });

    this.attendanceProcessForm = this.fb.group({
      attendanceProcessPeriodYear: ['', Validators.required],
      attendanceProcessPeriodMonth: ['', Validators.required],
      runDate: ['', [this.runDateValidator.bind(this)]],
      status: ['', Validators.required],
      exportToPayroll: ['false', Validators.required],
      users: this.fb.array([])
    });

    this.fnfAttendanceProcessForm = this.fb.group({
      attendanceProcessPeriodYear: ['', Validators.required],
      attendanceProcessPeriodMonth: ['', Validators.required],
      runDate: [''],
      exportToPayroll: [''],
      isFNF: [true],
      users: this.fb.array([]),
    },
      {

        validators: this.validateYearMonthAndResignation.bind(this),

      });
  }

  onActionClick(event: any) {
    if (event.action.label === 'Delete') {
      this.deleteDialog(event.row);
    }
  }

  ngOnInit() {
    this.generateYearList();
    this.userService.getUsersByStatus('Settled').subscribe((res: any) => {
      this.setlledUsers = res.data['users'];
    })
    this.route.queryParams.subscribe(params => {
      this.activeTab = params['tab'] || 'attendanceProcess';
      this.activeTabIndex = this.activeTab === 'attendanceProcess' ? 0 : 1;

      if (this.activeTab === 'attendanceProcess') {
        forkJoin([
          this.commonService.populateUsers().subscribe(usersResult => {
            this.allAssignee = usersResult && usersResult.data && usersResult.data.data;
          }),
          this.getProcessAttendance()
        ]).subscribe(() => { });

      } else if (this.activeTab === 'fnfattendanceProcess') {
        forkJoin([
          this.changeMode = 'Update',
          this.getUsersByStatus(),
          this.getFnfAttendanceProcess()
        ]).subscribe(([users, attendanceProcess]) => {
        });
      }


      this.lopForm.patchValue({
        month: this.selectedMonth,
        year: this.selectedYear
      });
    });
    this.attendanceTemplateAssignment = [];
    this.lopForm.valueChanges.subscribe(() => {
      this.isSubmitted = false;
    });
  }

  attendanceTemplateValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const selectedUserIds: string[] = control.value;
      if (!selectedUserIds || selectedUserIds.length === 0) {
        return null;
      }
      const hasTemplateAssigned = selectedUserIds.every(userId =>
        this.attendanceTemplateAssignment?.find(template => template?.employee?._id === userId)
      );
      return hasTemplateAssigned ? null : { 'noAttendanceTemplate': true };
    };
  }

  async onUserSelectionChange(event: any) {
    const selectedUserIds: string[] = event.value;
    this.attendanceTemplateAssignment = [];

    if (selectedUserIds && selectedUserIds.length > 0) {
      try {
        // Map API calls to promises
        const apiPromises = selectedUserIds.map(userId =>
          this.attendanceService.getAttendanceTemplateByUserId(userId).toPromise()
        );

        // Wait for all API calls to complete
        const results = await Promise.all(
          apiPromises.map(p => p.catch(e => ({ data: [] }))) // Handle individual API errors
        );

        // Process each result
        results.forEach((res, index) => {
          const userId = selectedUserIds[index];
          if (res && res.data && res.data.length > 0) {
            this.attendanceTemplateAssignment.push(...res.data);
          }
        });

        // Mark as touched and update validity to trigger mat-error
        this.lopForm.controls['user'].markAsTouched();
        this.lopForm.controls['user'].updateValueAndValidity();

        // Check for users without templates
        const usersWithoutTemplate = selectedUserIds.filter(userId =>
          !this.attendanceTemplateAssignment.some(template => template.employee?._id === userId)
        );

        if (usersWithoutTemplate.length > 0) {
          const userNames = usersWithoutTemplate.map(userId => {
            const user = this.allAssignee.find(assignee => assignee.id === userId);
            return user ? `${user.firstName} ${user.lastName}` : 'Unknown User';
          }).join(', ');
          this.toast.error(`No Attendance Template assigned for: ${userNames}`);
        }
      } catch (error) {
        this.toast.error('Error fetching attendance templates.');
        this.lopForm.controls['user'].markAsTouched();
        this.lopForm.controls['user'].setErrors({ apiError: true });
      }
    } else {
      // No users selected
      this.lopForm.controls['user'].markAsTouched();
      this.lopForm.controls['user'].updateValueAndValidity();
    }
  }

  // runDateValidator(control: AbstractControl): ValidationErrors | null {
  //   const runDate = new Date(control.value);
  //   const year = this.attendanceProcessForm?.value?.attendanceProcessPeriodYear;
  //   const month = this.attendanceProcessForm?.value?.attendanceProcessPeriodMonth;
  //   if (!control.value) {
  //     return { required: true };
  //   }
  //   if (!year || !month) {
  //     return null;
  //   }
  //   const lastDayOfMonth = new Date(year, month, 1);
  //   console.log(lastDayOfMonth);
  //   const lastFiveDaysStart = new Date(year, month + 1, lastDayOfMonth.getDate() + 4);
  //   console.log(lastFiveDaysStart);

  //   const firstFiveDaysEnd = new Date(year, month - 1, 5);

  //   if (
  //     (runDate >= lastFiveDaysStart && runDate <= lastDayOfMonth) ||
  //     (runDate >= new Date(year, month - 1, 1) && runDate <= firstFiveDaysEnd)
  //   ) {
  //     return null;
  //   }
  //   return { outOfRange: true };
  // }
  runDateValidator(control: AbstractControl): ValidationErrors | null {
    const runDate = new Date(control.value);
    const year = this.attendanceProcessForm?.value?.attendanceProcessPeriodYear;
    const month = this.attendanceProcessForm?.value?.attendanceProcessPeriodMonth;

    if (!control.value) {
      return { required: { message: 'Run date is required' } };
    }
    if (!year || !month) {
      return null;
    }

    // Get the last day of the selected month
    const lastDayOfMonth = new Date(year, month, 0); // Corrected to get the last day
    console.log('Last day of selected month:', lastDayOfMonth);

    // Last 5 days of the selected month (e.g., for June, 26th to 30th)
    const lastFiveDaysStart = new Date(year, month - 1, lastDayOfMonth.getDate() - 4);
    console.log('Last 5 days start:', lastFiveDaysStart);

    // First 5 days of the next month (e.g., for June, July 1st to 5th)
    const nextMonthStart = new Date(year, month, 1); // First day of next month
    const firstFiveDaysEnd = new Date(year, month, 5); // 5th day of next month
    console.log('First 5 days end:', firstFiveDaysEnd);

    // Check if runDate is within the last 5 days of the selected month OR the first 5 days of the next month
    if (
      (runDate >= lastFiveDaysStart && runDate <= lastDayOfMonth) ||
      (runDate >= nextMonthStart && runDate <= firstFiveDaysEnd)
    ) {
      return null; // Valid date
    }

    // Return outOfRange error with a message
    return {
      outOfRange: {
        message: `Selected date must be within the last 5 days of ${month}/${year} or the first 5 days of ${month + 1}/${year}.`
      }
    };
  }

  onMonthChange(event: any) {
    if (this.activeTab == 'attendanceProcess') { this.getProcessAttendance(); }
    if (this.activeTab == 'fnfattendanceProcess') { this.getFnfAttendanceProcess(); }
  }

  selectTab(tabIndex: number) {
    this.activeTabIndex = tabIndex;
    this.activeTab = tabIndex === 0 ? 'attendanceProcess' : 'fnfattendanceProcess';
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab: this.activeTab },
      queryParamsHandling: 'merge'
    });
  }

  open(content: TemplateRef<any>) {
    this.isSubmitted = false;
    this.getUsersByStatus();
    this.attendanceProcessForm.reset({
      exportToPayroll: 'false',
      status: 'Pending',
    });

    this.attendanceProcessForm.get('status').disable();
    this.attendanceProcessForm.get('exportToPayroll').disable();
    const usersFormArray = this.attendanceProcessForm.get('users') as FormArray;
    while (usersFormArray.length) {
      usersFormArray.removeAt(0);
    }

    const fnfUsersFormArray = this.fnfAttendanceProcessForm.get('users') as FormArray;

    while (fnfUsersFormArray.length) {
      fnfUsersFormArray.removeAt(0);
    }

    const dialogRef = this.dialog.open(content, {
      width: '600px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      this.isSubmitted = false;
      this.changeMode = 'Update';
      if (result) {
        this.createAttendanceProcessLOP();
      }
    });
  }

  openLopFormDialog() {
    this.isSubmitted = false;
    const dialogRef = this.dialog.open(this.dialogTemplate, {
      width: '600px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      this.changeMode = 'Update';
      this.isSubmitted = false;
      if (result) {
        this.createAttendanceProcessLOP();
      }
    });
  }

  onYearChange(event: any) {
    if (this.activeTab == 'attendanceProcess') { this.getProcessAttendance(); }
    if (this.activeTab == 'fnfattendanceProcess') { this.getFnfAttendanceProcess(); }
  }

  generateYearList() {
    const currentYear = new Date().getFullYear().toString();
    this.years = [(parseInt(currentYear) - 1).toString(), currentYear];
    this.selectedYear = currentYear;
  }

  getUser(employeeId: string) {
    const matchingUser = this.allAssignee?.find(user => user._id === employeeId);
    return matchingUser ? `${matchingUser.firstName} ${matchingUser.lastName}` : 'N/A';
  }

  createAttendanceProcessLOP() {
    if (this.lopForm.valid) {
      this.isSubmitted = true;
      const selectedUsers = this.lopForm.value.user;
      const requests = selectedUsers.map((userId: string) => {
        const payload = {
          month: this.lopForm.value.month,
          year: this.lopForm.value.year,
          user: userId
        };
        return this.attendanceService.addProcessAttendanceLOP(payload);
      });

      forkJoin(requests).subscribe(
        (responses: any[]) => {
          responses.forEach((res: any) => {
            if (res.status === 'fail') {
              this.toast.error(`LOP Already Processed for user ${res.data.user}`, 'Error!');
            } else if (res.status === 'success') {
              this.lopForm.reset({
                user: ''
              });
            }
          });
          this.toast.success(`LOP Processed For the selected Users`, 'Successfully!');
          this.dialog.closeAll();
          this.lopForm.reset({
            month: this.selectedMonth,
            year: this.selectedYear
          });
        },
        (error) => {
          this.toast.error('Error processing LOP for users', 'Error!');
        }
      );
    } else {
      this.lopForm.markAllAsTouched();
    }
  }

  onUserChange() {
    this.validateLOPAndAttendance();
  }

  onMonthOrYearChange() {
    if (this.activeTab == 'attendanceProcess') {
      this.validateLOPAndAttendance();
    }
    if (this.activeTab == 'fnfattendanceProcess') {
      this.onFnF_userChange();
    }
  }

  validateLOPAndAttendance() {
    const payload = {
      skip: '',
      next: '',
      month: this.attendanceProcessForm.value.attendanceProcessPeriodMonth,
      year: this.attendanceProcessForm.value.attendanceProcessPeriodYear,
    };

    if (!payload.month || !payload.year) {
      this.attendancePeriodError = false;
      this.lopNotCreatedError = false;
      return;
    }

    this.attendanceService.getProcessAttendance(payload).subscribe((res: any) => {
      const existingAttendance = res.data.find((attendance: any) =>
        attendance.attendanceProcessPeriodMonth === this.attendanceProcessForm.value.attendanceProcessPeriodMonth &&
        attendance.attendanceProcessPeriodYear === this.attendanceProcessForm.value.attendanceProcessPeriodYear
      );
      if (existingAttendance) {
        this.attendancePeriodError = true;
        this.lopNotCreatedError = false;
        this.failedUsers = [];
      } else {
        this.attendancePeriodError = false;
        this.validateAttendanceForAllAssignees();
      }
    });
  }


  validateAttendanceForAllAssignees() {
    const month = this.attendanceProcessForm.value.attendanceProcessPeriodMonth;
    const year = this.attendanceProcessForm.value.attendanceProcessPeriodYear;

    const validationRequests = this.allAssignee.map((user: any) => {
      const payload = {
        user: user._id,
        month,
        year
      };
      return this.attendanceService.ValidateMonthlyAttendanceByUser(payload).pipe(
        map((lopRes: any) => ({
          user,
          isValid: lopRes.status
        }))
      );
    });

    forkJoin(validationRequests).subscribe((results: any[]) => {
      const failedUsers = results
        .filter(result => !result.isValid)
        .map(result => ({
          firstName: result.user.firstName,
          lastName: result.user.lastName,
          id: result.user._id
        }));

      if (failedUsers.length > 0) {
        this.lopNotCreatedError = true;

        // You can bind this to your UI to show the failed users
        this.failedUsers = failedUsers;

      } else {
        this.lopNotCreatedError = false;
        this.failedUsers = [];
      }
    });
  }

  getProcessAttendance() {
    let payload = {
      skip: '',
      next: '',
      month: this.selectedMonth.toString(),
      year: this.selectedYear.toString()
    };
    this.attendanceService.getProcessAttendance(payload).subscribe((res: any) => {
      this.processAttendance = res.data.map((data) => {
        return {
          ...data,
          users: data.users.map((user) => this.getUser(user?.user)),
        }
      });
    })
  }

  onSubmission() {
    if (this.attendanceProcessForm.valid && !this.attendancePeriodError && !this.lopNotCreatedError) {
      this.isSubmitted = true;
      let payload = {
        skip: '',
        next: '',
        year: this.selectedYear.toString(),
        month: this.selectedMonth.toString()
      };
      this.attendanceService.getProcessAttendanceLOPByMonth(payload).subscribe((lopRes: any) => {
        const uniqueUsers = new Set(lopRes.data.map((data) => data.user));

        const lopUsers = Array.from(uniqueUsers).map((user) => ({ user, status: 'Pending' }));

        const usersFormArray = this.attendanceProcessForm.get('users') as FormArray;
        usersFormArray.clear();
        lopUsers.forEach(user => {
          usersFormArray.push(this.fb.group(user));
        });

        this.attendanceProcessForm.get('status')?.enable();
        this.attendanceProcessForm.get('exportToPayroll')?.enable();

        this.attendanceService.addProcessAttendance(this.attendanceProcessForm.value).subscribe((res: any) => {
          const processedAttendance = res.data;
          this.selectedMonth = processedAttendance?.attendanceProcess?.attendanceProcessPeriodMonth;
          this.getProcessAttendance();

          this.attendanceProcessForm.reset({
            exportToPayroll: 'false',
            status: 'Pending',
          });

          this.attendanceProcessForm.get('status')?.disable();
          this.attendanceProcessForm.get('exportToPayroll')?.disable();

          while (usersFormArray.length) {
            usersFormArray.removeAt(0);
          }
          this.toast.success('Process Attendance Created', 'Successfully!');
        },
          err => {
            this.toast.error('Process Attendance Already Exists', 'Error!');
          });
      });
    } else {
      this.attendanceProcessForm.markAllAsTouched();
    }
  }

  deleteRecord(data) {
    let payload = {
      attandanaceProcessPeroidMonth: data?.attendanceProcessPeriodMonth,
      attandanaceProcessPeroidYear: data?.attendanceProcessPeriodYear
    };
    this.attendanceService.deleteProcessAttendance(payload).subscribe((res: any) => {
      this.getProcessAttendance();
      this.toast.success('Successfully Deleted!!!', 'Attendance Process');
    }, (err) => {
      this.toast.error(err);
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

  getUsersByStatus(): Observable<any[]> {
    return forkJoin([
      this.userService.getUsersByStatus('Resigned'),
      this.userService.getUsersByStatus('Terminated'),
      this.userService.getUsersByStatus('Settled'),
      this.userService.getUsersByStatus('FNF Attendance Processed'),
    ]).pipe(
      map((results: any[]) => {
        const [resignedUsers, terminatedUsers, settledUsers, fnfAttendanceProcessed] = results;
        this.usersForFNF = [
          ...resignedUsers.data['users'],
          ...terminatedUsers.data['users'],
          ...(this.changeMode === 'Add' ? settledUsers.data['users'] : []),
          ...fnfAttendanceProcessed.data['users']
        ];
        return this.usersForFNF;
      })
    );
  }

  getMatchedUser(userId: string) {
    const matchingUser = this.setlledUsers?.find(user => user._id === userId);
    return matchingUser ? `${matchingUser.firstName} ${matchingUser.lastName}` : 'N/A';
  }

  selectedUser(user: any) {
    this.selectedFnfUser = user.value;

    this.fnfAttendanceProcessForm.reset({
      users: [{ user: user.value, status: '' }]
    });

    this.separationService.getTerminationByUserId(this.selectedFnfUser).subscribe((res: any) => {
      if (res.data) {
        this.termination = res.data;
        this.terminationMonth = new Date(this.termination.termination_date).getMonth() + 1;
        this.terminationYear = new Date(this.termination.termination_date).getFullYear();

        this.resignationMonth = null;
        this.resignationYear = null;
        this.noticePeriod = null;
        this.lastWorkingDay = null;

        this.fnfAttendanceProcessForm.updateValueAndValidity();
      } else {
        this.separationService.getResignationsByUserId(this.selectedFnfUser).subscribe((res: any) => {
          const resignation = res.data;
          if (resignation) {
            this.resignationMonth = new Date(resignation.resignation_date).getMonth() + 1;
            this.resignationYear = new Date(resignation.resignation_date).getFullYear();
            this.noticePeriod = resignation.notice_period;
            this.lastWorkingDay = resignation.last_working_day;

            this.terminationMonth = null;
            this.terminationYear = null;

            this.fnfAttendanceProcessForm.updateValueAndValidity();
          }
        });
      }
    });
  }



  validateYearMonthAndResignation(group: AbstractControl): ValidationErrors | null {
    const year = group.get('attendanceProcessPeriodYear')?.value;
    const month = group.get('attendanceProcessPeriodMonth')?.value;

    if (!year || !month || (!this.terminationMonth && !this.resignationMonth)) {
      return null;
    }

    const selectedDate = new Date(year, month - 1);
    const terminationDate = this.terminationMonth
      ? new Date(this.terminationYear, this.terminationMonth - 1)
      : null;
    const resignationDate = this.resignationMonth
      ? new Date(this.resignationYear, this.resignationMonth - 1)
      : null;
    const lastWorkingDay = this.lastWorkingDay ? new Date(this.lastWorkingDay) : null;

    if (terminationDate && selectedDate < terminationDate) {
      return { beforeTermination: true }; // Selected date is before termination date
    }

    if (resignationDate && selectedDate < resignationDate) {
      return { beforeResignation: true }; // Selected date is before resignation date
    }

    if (lastWorkingDay && selectedDate > lastWorkingDay) {
      return { afterLastWorkingDay: true }; // Selected date is after last working day
    }

    return null;
  }


  onSubmissionFnF() {
    this.fnfAttendanceProcessForm.value.exportToPayroll = 'true';
    this.fnfAttendanceProcessForm.value.isFNF = true
    this.fnfAttendanceProcessForm.value.users = [{ user: this.selectedFnfUser, status: 'FnF Attendance Processed' }];
    if (this.fnfAttendanceProcessForm.valid && !this.terminationDateError && !this.noticePeriodError) {
      this.attendanceService.addFnFAttendanceProcess(this.fnfAttendanceProcessForm.value).subscribe((res: any) => {
        this.getFnfAttendanceProcess();
        this.fnfAttendanceProcessForm.value.users = [{ user: '' }]
        this.fnfAttendanceProcessForm.reset({
          users: [{ user: '', status: '' }]
        });
        this.toast.success('Full & Final Attendance Processed', 'Successfully!');
      }, err => {
        this.toast.error('Full & Final Attendance can not be Processed', 'Error');
      });
    } else {
      this.fnfAttendanceProcessForm.markAllAsTouched();
    }
  }

  getFnfAttendanceProcess(): Observable<any> {
    const payload = {
      skip: '',
      next: '',
      month: this.selectedMonth,
      year: this.selectedYear,
      isFNF: true
    };

    return this.attendanceService.getfnfAttendanceProcess(payload).pipe(
      map((res: any) => {
        this.fnfAttendanceProcess = res.data.map(data => ({
          ...data,
          users: data.users.map(user => this.getMatchedUser(user?.user))
        }));
        return this.fnfAttendanceProcess; // Return the processed data
      })
    );
  }

  onFnF_userChange() {
    let payload = {
      skip: '',
      next: '',
      month: this.fnfAttendanceProcessForm.value.attendanceProcessPeriodMonth,
      year: this.fnfAttendanceProcessForm.value.attendanceProcessPeriodYear,
    };
    this.attendanceService.getfnfAttendanceProcess(payload).subscribe((processRes: any) => {
      this.processAttendance = processRes.data;
      const usersArray = this.fnfAttendanceProcessForm.value.users;
      const selectedUsers = usersArray.map((userObj: any) => userObj.user);
      selectedUsers.forEach((selectedUser, index) => {
        if (selectedUser === null) {
          return;
        }
        this.fnfError = this.processAttendance.some((attendance: any) =>
          attendance.attendanceProcessPeriodMonth === payload.month &&
          attendance.attendanceProcessPeriodYear === payload.year &&
          attendance.users.some((user: any) => user.user === selectedUser)
        );
      });
    });
  }
}