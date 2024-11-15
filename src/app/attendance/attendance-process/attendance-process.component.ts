import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
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
    this.attendanceProcessForm = this.fb.group({
      attendanceProcessPeriodYear: [''],
      attendanceProcessPeriodMonth: [''],
      runDate: [''],
      status: [''],
      exportToPayroll: [''],
      users: this.fb.array([this.createUserFormGroup()])
    })
  }

  ngOnInit() {
    this.generateYearList();
    this.commonService.populateUsers().subscribe(result => {
      this.allAssignee = result && result.data && result.data.data;
    });
    this.getProcessAttendance();
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
  // Getter for the users FormArray
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

  getProcessAttendance() {
    let payload = {
      skip: '',
      next: '',
      month: this.selectedMonth,
      year: this.selectedYear
    }
    console.log(payload);
    this.attendanceService.getProcessAttendance(payload).subscribe((res: any) => {
      this.processAttendance = res.data;
    })
  }
  onSubmission() {
    console.log('Form Submitted', this.attendanceProcessForm.value);
    this.attendanceService.addProcessAttendance(this.attendanceProcessForm.value).subscribe((res: any) => {
      this.processAttendance.push(res.data);
      this.attendanceProcessForm.reset();
      this.toast.success('Process ATtendance Created', 'Successfully!');
    },
      err => {
        this.toast.error('Process Attendance Can not be Created', 'Error!')
      })
  }

  deleteRecord(_id: string) {
    // this.payroll.deleteCTCTemplate(_id).subscribe((res: any) => {
    //   const index = this.ctcTemplate.findIndex(res => res._id === _id);
    //   if (index !== -1) {
    //     this.ctcTemplate.splice(index, 1);
    //   }
    //   this.toast.success('Successfully Deleted!!!', 'CTC Template');
    // }, (err) => {
    //   this.toast.error('CTC Template can not be deleted', 'Error');
    // })
  }

  deleteDialog(id: string): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'delete') {
        this.deleteRecord(id);
      }
    });
  }

}
