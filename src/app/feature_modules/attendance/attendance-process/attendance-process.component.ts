import { Component, TemplateRef, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { AttendanceService } from 'src/app/_services/attendance.service';
import { CommonService } from 'src/app/_services/common.Service';
import { UserService } from 'src/app/_services/users.service';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-attendance-process',
  templateUrl: './attendance-process.component.html',
  styleUrl: './attendance-process.component.css'
})
export class AttendanceProcessComponent {
  activeTab: string = 'attendanceProcess';
  searchText: string = '';
  closeResult: string = '';
  changeMode: 'Add' | 'Update' = 'Add';

  lopForm: FormGroup;
  attendanceProcessForm: FormGroup;
  fnfAttendanceProcessForm: FormGroup;

  years: number[] = [];
  selectedYear: number;

  showRemoveButton = false;
  fnfError: boolean = false;

  processAttendance: any
  lop: any;
  allAssignee: any[];

  bsValue = new Date();
  selectedMonth: number = new Date().getMonth() + 1;

  months = [
    { name: 'January', value: 1 },
    { name: 'February', value: 2 },
    { name: 'March', value: 3 },
    { name: 'April', value: 4 },
    { name: 'May', value: 5 },
    { name: 'June', value: 6 },
    { name: 'July', value: 7 },
    { name: 'August', value: 8 },
    { name: 'September', value: 9 },
    { name: 'October', value: 10 },
    { name: 'November', value: 11 },
    { name: 'December', value: 12 }
  ];
  fnfAttendanceProcess: any;
  fnfAttendanceProcessUsers: any;
  @ViewChild('LopFormDialog') dialogTemplate: TemplateRef<any>;


  constructor(private attendanceService: AttendanceService,
    private fb: FormBuilder,
    private modalService: NgbModal,
    public commonService: CommonService,
    private toast: ToastrService,
    private dialog: MatDialog,
    private userService: UserService
  ) {
    this.lopForm = this.fb.group({
      month: ['', Validators.required],
      year: ['', Validators.required],
      user: ['', Validators.required]
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
      runDate: [''[this.runDateValidator.bind(this)]],
      exportToPayroll: ['', Validators.required],
      isFNF: [true],
      users: this.fb.array([])
    });
  }

  ngOnInit() {
    this.commonService.populateUsers().subscribe(result => {
      this.allAssignee = result && result.data && result.data.data;
    });
    this.getUsersByFnFAttendance();
    this.generateYearList();
    this.getProcessAttendance();
    this.lopForm.patchValue({
      month: this.selectedMonth,
      year: this.selectedYear
    });
  }

  getUsersByFnFAttendance() {
    this.userService.getUsersByStatus('FNF Attendance Processed').subscribe((res: any) => {
      this.fnfAttendanceProcessUsers = res.data['users'];
    });
  }
  runDateValidator(control: AbstractControl): ValidationErrors | null {
    const runDate = new Date(control.value);
    const year = this.attendanceProcessForm?.value?.attendanceProcessPeriodYear;
    const month = this.attendanceProcessForm?.value?.attendanceProcessPeriodMonth;
    if (!control.value) {
      return { required: true };
    }
    if (!year || !month) {
      return null;
    }
    const lastDayOfMonth = new Date(year, month, 0);
    const lastFiveDaysStart = new Date(year, month - 1, lastDayOfMonth.getDate() - 4);
    const firstFiveDaysEnd = new Date(year, month, 5);
    if (runDate < lastFiveDaysStart || runDate > firstFiveDaysEnd) {
      return { outOfRange: true };
    }
    return null;
  }

  onMonthChange(event: Event) {
    if (this.activeTab == 'attendanceProcess') { this.getProcessAttendance(); }
    if (this.activeTab == 'fnfattendanceProcess') { this.getFnfAttendanceProcess(); }
  }

  selectTab(tabId: string) {
    this.activeTab = tabId;
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

  open(content: any) {
    if (this.changeMode == 'Add') {
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
    }

    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', backdrop: 'static', keyboard: false }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  openLopFormDialog() {
    const dialogRef = this.dialog.open(this.dialogTemplate, {
      width: '600px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.createAttendanceProcessLOP();
      }
    });
  }

  onYearChange(event: any) {
    if (this.activeTab == 'attendanceProcess') { this.getProcessAttendance(); }
    if (this.activeTab == 'fnfattendanceProcess') { this.getFnfAttendanceProcess(); }
  }


  addfnfUser() {
    const userGroup = this.fb.group({
      user: ['', Validators.required],
      status: [''],
    });
    (this.fnfAttendanceProcessForm.get('users') as FormArray).push(userGroup);
  }

  removefnfUser(index: number) {
    (this.fnfAttendanceProcessForm.get('users') as FormArray).removeAt(index);
  }

  get fnfUsers(): FormArray {
    return this.fnfAttendanceProcessForm.get('users') as FormArray;
  }

  generateYearList() {
    const currentYear = new Date().getFullYear();
    this.years = [currentYear - 1, currentYear];
    this.selectedYear = currentYear;
  }

  getUser(employeeId: string) {
    const matchingUser = this.allAssignee?.find(user => user._id === employeeId);
    return matchingUser ? `${matchingUser.firstName} ${matchingUser.lastName}` : 'N/A';
  }

  createAttendanceProcessLOP() {
    if (this.lopForm.valid) {
      this.attendanceService.addProcessAttendanceLOP(this.lopForm.value).subscribe((res: any) => {
        if (res.status == 'fail') {
          this.toast.error('Lop Already Processed for respective user', 'Error!');
          this.lopForm.reset({
            month: this.selectedMonth,
            year: this.selectedYear
          });
        }
        if (res.status == 'success') {
          this.toast.success('LOP Processed', 'Successfully!');
          this.lopForm.reset({
            month: this.selectedMonth,
            year: this.selectedYear
          });
        }
      })
    }
    else this.lopForm.markAllAsTouched();
  }

  onUserChange() {
    this.validateLOPAndAttendance();
  }

  onMonthOrYearChange() {
    if (this.activeTab == 'attendanceProcess') { this.validateLOPAndAttendance(); }
    if (this.activeTab == 'fnfattendanceProcess') { this.onFnF_userChange(); }
  }

  validateLOPAndAttendance() {
    const payload = {
      skip: '',
      next: '',
      month: this.attendanceProcessForm.value.attendanceProcessPeriodMonth,
      year: this.attendanceProcessForm.value.attendanceProcessPeriodYear,
    };

    const usersArray = this.attendanceProcessForm.value.users
    const selectedUsers = usersArray.map((userObj: any) => userObj.user); // Extract the user field for comparison
    this.attendanceService.getProcessAttendanceLOPByMonth(payload).subscribe((lopRes: any) => {
      this.lop = lopRes.data;
      selectedUsers.forEach((selectedUser, index) => {
        if (selectedUser === null) {
          return;
        }
        if (this.lop.some((lop: any) => lop.user === selectedUser)) {
          this.attendanceService.getProcessAttendance(payload).subscribe((processRes: any) => {
            this.processAttendance = processRes.data;
            this.fnfError = this.processAttendance.some((attendance: any) =>
              attendance.attendanceProcessPeriodMonth === payload.month &&
              attendance.attendanceProcessPeriodYear === payload.year &&
              attendance.users.some((user: any) => user.user === selectedUser)
            );
          });
        }
      });
    });
  }

  getProcessAttendance() {
    let payload = {
      skip: '',
      next: '',
      month: this.selectedMonth,
      year: this.selectedYear
    }
    this.attendanceService.getProcessAttendance(payload).subscribe((res: any) => {
      this.processAttendance = res.data.map((data) => {
        return {
          ...data,
          users: data.users.map((user) => this.getUser(user?.user)),
        }
      })
    })
  }

  onSubmission() {
    if (this.attendanceProcessForm.valid) {
      let payload = {
        skip: '',
        next: '',
        month: this.selectedMonth,
        year: this.selectedYear
      }
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
          this.processAttendance.push(res.data.attendanceProcess);

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
            this.toast.error('Process Attendance Already Exists', 'Error!')
          })
      });
    }

    else { this.attendanceProcessForm.markAllAsTouched() }
   
  }

  deleteRecord(data) {
    let payload = {
      attandanaceProcessPeroidMonth: data?.attendanceProcessPeriodMonth,
      attandanaceProcessPeroidYear: data?.attendanceProcessPeriodYear
    }
    this.attendanceService.deleteProcessAttendance(payload).subscribe((res: any) => {
      const index = this.processAttendance.findIndex(res => res._id === data?._id);
      if (index !== -1) {
        this.processAttendance.splice(index, 1);
      }
      this.toast.success('Successfully Deleted!!!', 'Attendance Process');
    }, (err) => {
      this.toast.error('Attendance Process can not be deleted', 'Error');
    })
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

  onSubmissionFnF() {
    console.log(this.fnfAttendanceProcessForm.value);
    // if (this.fnfAttendanceProcessForm.valid) {
    this.attendanceService.addFnFAttendanceProcess(this.fnfAttendanceProcessForm.value).subscribe((res: any) => {
      this.toast.success('Full & Final Attendance Processed', 'Successfully!');
    }, err => {
      this.toast.error('Full & Final Attendance can not be Processed', 'Error')
    })
    // }
    // else { this.fnfAttendanceProcessForm.markAllAsTouched(); }
  }

  getFnfAttendanceProcess() {
    let payload = {
      skip: '',
      next: '',
      month: this.selectedMonth,
      year: this.selectedYear,
      isFNF: true
    }
    this.attendanceService.getfnfAttendanceProcess(payload).subscribe((res: any) => {
      this.fnfAttendanceProcess = res.data.map((data) => {
        return {
          ...data,
          user: data?.users?.length
        }
      })
    })
  }

  onFnF_userChange() {
    let payload = {
      skip: '',
      next: '',
      month: this.fnfAttendanceProcessForm.value.attendanceProcessPeriodMonth,
      year: this.fnfAttendanceProcessForm.value.attendanceProcessPeriodYear,
    }
    this.attendanceService.getProcessAttendance(payload).subscribe((processRes: any) => {
      this.processAttendance = processRes.data;
      const usersArray = this.fnfAttendanceProcessForm.value.users
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