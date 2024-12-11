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
  attendanceProcessForm: FormGroup;
  changeMode: 'Add' | 'Update' = 'Add';
  closeResult: string = '';
  years: number[] = [];
  selectedYear: number;
  allAssignee: any[];
  showRemoveButton = false;
  processAttendance: any
  bsValue = new Date();
  selectedMonth: number = new Date().getMonth() + 1;
  lop: any;
  lopForm: FormGroup;
  isLOPError: boolean = false;
  lopExistsError: boolean = false;

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
      users: this.fb.array([this.createUserFormGroup()])
    });
    this.setupFormListeners();

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
      return { required: true }; // Run Date is required
    }

    if (!year || !month) {
      return null; // Skip validation if year or month is not defined
    }

    const lastDayOfMonth = new Date(year, month, 0); // Last day of the selected month
    const firstDayOfNextMonth = new Date(year, month, 1); // First day of the next month

    // Define valid range
    const lastFiveDaysStart = new Date(year, month - 1, lastDayOfMonth.getDate() - 4);
    const firstFiveDaysEnd = new Date(year, month, 5);

    if (runDate < lastFiveDaysStart || runDate > firstFiveDaysEnd) {
      return { outOfRange: true }; // Run Date must fall in the valid range
    }

    return null; // Validation passed
  }

  setupFormListeners() {
    this.attendanceProcessForm.valueChanges.subscribe((values) => {
      const { attendanceProcessPeriodYear, attendanceProcessPeriodMonth } = values;
      if (attendanceProcessPeriodYear && attendanceProcessPeriodMonth) {
        this.getLOP();
      }
    });
  }

  onMonthChange(event: Event) {
    this.getProcessAttendance();
  }

  selectTab(tabId: string) {
    this.activeTab = tabId;
    console.log(this.activeTab);
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
      this.isLOPError = false;
      this.lopExistsError = false;
      this.attendanceProcessForm.value.exportToPayroll = 'true';
      this.attendanceProcessForm.reset();
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

  addUser() {
    const users = this.attendanceProcessForm.get('users') as FormArray;
    users.push(this.createUserFormGroup());
    this.showRemoveButton = true;
  }

  removeUser(index: number) {
    const users = this.attendanceProcessForm.get('users') as FormArray;
    users.removeAt(index);
    if (users.length === 1) {
      this.showRemoveButton = false;
    }
  }

  createUserFormGroup(): FormGroup {
    return this.fb.group({
      user: [''],
      status: ['']
    });
  }

  get users(): FormArray {
    return this.attendanceProcessForm.get('users') as FormArray;
  }

  generateYearList() {
    const currentYear = new Date().getFullYear();
    this.years = [currentYear - 1, currentYear, currentYear + 1];
    this.selectedYear = currentYear;
  }

  getUser(employeeId: string) {
    const matchingUser = this.allAssignee?.find(user => user._id === employeeId);
    return matchingUser ? `${matchingUser.firstName} ${matchingUser.lastName}` : 'N/A';
  }

  createAttendanceProcessLOP() {
    console.log(this.lopForm.value);
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

  getLOP() {
    const payload = {
      skip: '',
      next: '',
      month: this.attendanceProcessForm.value.attendanceProcessPeriodMonth,
      year: this.attendanceProcessForm.value.attendanceProcessPeriodYear,
    };

    // Fetch LOP data
    this.attendanceService.getProcessAttendanceLOPByMonth(payload).subscribe((lopRes: any) => {
      this.lop = lopRes.data;

      this.isLOPError = !this.lop || this.lop.length === 0;

      this.attendanceService.getProcessAttendance(payload).subscribe((processRes: any) => {
        this.processAttendance = processRes.data;

        this.lopExistsError = this.processAttendance.some(
          (attendance: any) =>
            attendance.attendanceProcessPeriodMonth === this.attendanceProcessForm.value.attendanceProcessPeriodMonth &&
            attendance.attendanceProcessPeriodYear === payload.year
            // this.attendanceProcessForm.value.users.some(
            //   (formUser: any) => formUser.user === attendance.user
            // )
        );
        console.log(this.lopExistsError);
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
    console.log(this.attendanceProcessForm.value)
    if (this.attendanceProcessForm.valid) {
      this.attendanceService.addProcessAttendance(this.attendanceProcessForm.value).subscribe((res: any) => {
        this.processAttendance.push(res.data);
        this.attendanceProcessForm.reset();
        this.toast.success('Process Attendance Created', 'Successfully!');
      },
        err => {
          this.toast.error('Process Attendance Can not be Created', 'Error!')
        })
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
}