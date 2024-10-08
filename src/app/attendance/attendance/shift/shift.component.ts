import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { AttendanceService } from 'src/app/_services/attendance.service';
import { ExportService } from 'src/app/_services/export.service';
import { CommonService } from 'src/app/_services/common.Service';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-shift',
  templateUrl: './shift.component.html',
  styleUrl: './shift.component.css'
})
export class ShiftComponent {
  isEdit: boolean;
  searchText: string = '';
  closeResult: string = '';
  changeMode: 'Add' | 'Update' = 'Add';
  shift: any;
  p: number = 1;
  selectedShift: any;
  shiftForm: FormGroup;
  showColorPicker: boolean = false;
  color: string = '#fff';
  totalRecords: number
  recordsPerPage: number = 10;
  currentPage: number = 1;

  constructor(
    private attendanceService: AttendanceService,
    private modalService: NgbModal,
    private dialog: MatDialog,
    private exportService: ExportService,
    private toast: ToastrService,
    private commonService: CommonService,
    private fb: FormBuilder,
  ) {
    this.shiftForm = this.fb.group({
      name: ['', Validators.required],
      dashboardColor: ['', Validators.required],
      isOffShift: [true, Validators.required],
      shiftType: [''],
      startTime: [''],
      endTime: [''],
      minHoursPerDayToGetCreditForFullDay: [''],
      isCheckoutTimeNextDay: [true],
      // isLatestDepartureTimeNextDay: [true],
      earliestArrival: [''],
      latestDeparture: ["2024-05-21T11:20:19.901Z"],
      firstHalfDuration: [''],
      secondHalfDuration: [''],
      company: [''],
      isLateComingAllowed: [true],
      noOfDaysLateComing: [0],
      graceTimeLimitForLateComing: [0],
      willLateComingDeductfromPresentDays: [true],
      numberOflateComingDaysAllowed: [0],
      numberOfDaysToBeDeducted: [''],
      maximumTimeLimitForLateComing: [0],
      isEarlyGoingAllowed: [true],
      enterNumberOfDaysForEarlyGoing: [0],
      graceTimeLimitForEarlyGoing: [0],
      isHalfDayApplicable: [true],
      minHoursPerDayToGetCreditforHalfDay: [''],
      maxLateComingAllowedMinutesFirstHalfAttendance: [0],
    })
  }

  ngOnInit() {
    this.loadRecords();
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.loadRecords();
  }

  onRecordsPerPageChange(recordsPerPage: number) {
    this.recordsPerPage = recordsPerPage;
    this.loadRecords();
  }

  loadRecords() {
    const pagination = {
      skip: ((this.currentPage - 1) * this.recordsPerPage).toString(),
      next: this.recordsPerPage.toString()
    };
    this.attendanceService.getShift(pagination.skip, pagination.next).subscribe((res: any) => {
      this.shift = res.data;
      this.totalRecords = res.total;
    })
  }

  clearForm() {
    this.shiftForm.reset();
  }
  closeModal() {
    this.modalService.dismissAll();
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


  exportToCsv() {
    const dataToExport = this.shift
    this.exportService.exportToCSV('Shift', 'Shift', dataToExport);

  }

  setFormValues(data) {
    this.shiftForm.patchValue({
      name: data.name,
      dashboardColor: data.dashboardColor,
      isOffShift: data.isOffShift,
      shiftType: data.shiftType,

      startTime: data.startTime,
      endTime: data.endTime,
      minHoursPerDayToGetCreditForFullDay: data.minHoursPerDayToGetCreditForFullDay,
      isCheckoutTimeNextDay: data.isCheckoutTimeNextDay,
      // isLatestDepartureTimeNextDay: [true],
      earliestArrival: data.earliestArrival,
      latestDeparture: data.latestDeparture,
      firstHalfDuration: data.firstHalfDuration,
      secondHalfDuration: data.secondHalfDuration,
      company: data.company,
      isLateComingAllowed: data.isLateComingAllowed,
      noOfDaysLateComing: data.noOfDaysLateComing,
      graceTimeLimitForLateComing: data.graceTimeLimitForLateComing,
      willLateComingDeductfromPresentDays: data.willLateComingDeductfromPresentDays,
      numberOflateComingDaysAllowed: data.numberOflateComingDaysAllowed,
      numberOfDaysToBeDeducted: data.numberOfDaysToBeDeducted,
      maximumTimeLimitForLateComing: data.maximumTimeLimitForLateComing,
      isEarlyGoingAllowed: data.isEarlyGoingAllowed,
      enterNumberOfDaysForEarlyGoing: data.enterNumberOfDaysForEarlyGoing,
      graceTimeLimitForEarlyGoing: data.graceTimeLimitForEarlyGoing,
      isHalfDayApplicable: data.isHalfDayApplicable,
      minHoursPerDayToGetCreditforHalfDay: data.minHoursPerDayToGetCreditforHalfDay,

      maxLateComingAllowedMinutesFirstHalfAttendance: data.maxLateComingAllowedMinutesFirstHalfAttendance
    })
  }

  toggleColorPicker() {
    this.showColorPicker = true;
  }

  onColorChange(color: string) {
    // this.color = color;
    this.shiftForm.patchValue({
      dashboardColor: color
    });
  }

  closeColorPicker() {
    this.showColorPicker = false
  }

  onSubmission() {
    // this.shiftForm.patchValue({ dashboardColor: this.color });
    const payload = this.fb.group({
      name: this.shiftForm.value.name,
      dashboardColor: this.shiftForm.value.dashboardColor,
      isOffShift: this.shiftForm.value.isOffShift,
    })
    if (this.shiftForm.valid) {
      if (!this.isEdit) {
        this.attendanceService.addShift(this.shiftForm.value).subscribe((res: any) => {
          this.loadRecords();
          this.toast.success('Shift Created', 'Successfully');
          this.shiftForm.reset();
        })
      }
      else {
        this.attendanceService.updateShift(this.selectedShift, this.shiftForm.value).subscribe((res: any) => {
          this.changeMode = 'Add';
          this.loadRecords();
          this.toast.success('Shift Updated', 'Successfully');
          this.shiftForm.reset();
        })
      }
    } else {
      this.toast.error('Please fill the required Fields')
      this.markFormGroupTouched(payload);
    }
  }
  markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else {
        control.markAsTouched();
      }
    });
  }
  deleteTemplate(id: string) {
    this.attendanceService.deleteShift(id).subscribe((res: any) => {
      this.loadRecords();
      this.toast.success('Successfully Deleted!!!', 'Shift');
    },
      (err) => {
        this.toast.error('This Shift Can not be deleted', 'Error')
      })
  }

  deleteDialog(id: string): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'delete') {
        this.deleteTemplate(id);
      }
      err => {
        this.toast.error('Can not be Deleted', 'Error!')
      }
    });
  }
}
