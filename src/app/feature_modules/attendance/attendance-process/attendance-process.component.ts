import { Component } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { AttendanceService } from 'src/app/_services/attendance.service';
import { CommonService } from 'src/app/_services/common.Service';
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

  lopForm: FormGroup;
  attendanceProcessForm: FormGroup;
  fnfAttendanceProcessForm: FormGroup;

  changeMode: 'Add' | 'Update' = 'Add';
  years: number[] = [];
  selectedYear: number;

  showRemoveButton = false;

  processAttendance: any
  lop: any;
  allAssignee: any[];

  bsValue = new Date();
  selectedMonth: number = new Date().getMonth() + 1;
  userValidationStates: { error: boolean; matchingAttendance: boolean }[] = [];

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

  constructor(private attendanceService: AttendanceService,
    private fb: FormBuilder,
    private modalService: NgbModal,
    private commonService: CommonService,
    private toast: ToastrService,
    private dialog: MatDialog
  ) {
    this.lopForm = this.fb.group({
      month: [''],
      year: [''],
      user: ['']
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
      attendanceProcessPeriodYear: [''],
      attendanceProcessPeriodMonth: [''],
      runDate: [''],
      exportToPayroll: [''],
      isFNF: [true],
      users: this.fb.array([])
    })
  }

  ngOnInit() {
    this.generateYearList();
    this.commonService.populateUsers().subscribe(result => {
      this.allAssignee = result && result.data && result.data.data;
    });
    this.getProcessAttendance();
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
    this.getProcessAttendance();
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

      this.userValidationStates = [];
    }
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', backdrop: 'static' }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  onYearChange(event: any) {
    this.selectedYear = event.target.value;
    this.getProcessAttendance();
  }

// Attendance process users array
  addUser() {
    const userGroup = this.fb.group({
      user: ['', Validators.required],
      status: [''],
    });
    (this.attendanceProcessForm.get('users') as FormArray).push(userGroup);
  }

  removeUser(index: number) {
    (this.attendanceProcessForm.get('users') as FormArray).removeAt(index);
  }

  get users(): FormArray {
    return this.attendanceProcessForm.get('users') as FormArray;
  }

// FnF Attendance process users array
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
    this.attendanceService.addProcessAttendanceLOP(this.lopForm.value).subscribe((res: any) => {
      if (res.status == 'fail') {
        this.toast.error('This LOP is Already Exist!', 'Error!');
        this.lopForm.reset();
      }
      if (res.status == 'success') {
        this.toast.success('LOP is Created', 'Successfully!');
        this.lopForm.reset();
      }
    })
  }

  onUserChange() {
    this.validateLOPAndAttendance();
  }

  onMonthOrYearChange() {
    this.validateLOPAndAttendance();
  }

  validateLOPAndAttendance() {
    const payload = {
      skip: '',
      next: '',
      month: this.attendanceProcessForm.value.attendanceProcessPeriodMonth,
      year: this.attendanceProcessForm.value.attendanceProcessPeriodYear,
    };

    const usersArray = this.attendanceProcessForm.value.users; // Get the array of users from the form
    const selectedUsers = usersArray.map((userObj: any) => userObj.user); // Extract the user field for comparison

    this.userValidationStates = selectedUsers.map(() => ({ error: false, matchingAttendance: false }));

    this.attendanceService.getProcessAttendanceLOPByMonth(payload).subscribe((lopRes: any) => {
      this.lop = lopRes.data;

      selectedUsers.forEach((selectedUser, index) => {
        if (selectedUser === null) {
          this.userValidationStates[index].error = true; // User not selected
          return;
        }

        this.userValidationStates[index].error = this.lop.some((lop: any) => lop.user === selectedUser);

        if (this.userValidationStates[index].error) {
          this.attendanceService.getProcessAttendance(payload).subscribe((processRes: any) => {
            this.processAttendance = processRes.data;

            this.userValidationStates[index].matchingAttendance = this.processAttendance.some((attendance: any) =>
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
      this.processAttendance = res.data;
    })
  }

  onSubmission() {

    this.attendanceProcessForm.get('status')?.enable();
    this.attendanceProcessForm.get('exportToPayroll')?.enable();

    this.attendanceProcessForm.patchValue({
      status: 'Pending',
      exportToPayroll: false
    })
    if (this.attendanceProcessForm.valid) {
      this.attendanceService.addProcessAttendance(this.attendanceProcessForm.value).subscribe((res: any) => {
        const processedAttendance = res.data;
        this.selectedMonth = processedAttendance?.attendanceProcess?.attendanceProcessPeriodMonth;
        this.processAttendance.push(res.data.attendanceProcess);

        this.attendanceProcessForm.reset({
          exportToPayroll: 'false',
          status: 'Pending',
        });

        const usersFormArray = this.attendanceProcessForm.get('users') as FormArray;
        while (usersFormArray.length) {
          usersFormArray.removeAt(0);
        }
        this.userValidationStates = [];
        this.toast.success('Process Attendance Created', 'Successfully!');
      },
        err => {
          this.toast.error('Process Attendance Can not be Created', 'Error!')
        })
    }

    else { this.attendanceProcessForm.markAllAsTouched() }
    this.attendanceProcessForm.get('status')?.disable();
    this.attendanceProcessForm.get('exportToPayroll')?.disable();
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
}