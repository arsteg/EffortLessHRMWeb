import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
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
      dashboardColor: [''],
      // isOffShift: [true, Validators.required],
      shiftType: ['', Validators.required],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required],
      minHoursPerDayToGetCreditForFullDay: ['', Validators.required],
      isCheckoutTimeNextDay: [true],
      // isLatestDepartureTimeNextDay: [true],
      earliestArrival: ['', Validators.required],
      latestDeparture: ['', Validators.required],
      firstHalfDuration: ['', Validators.required],
      secondHalfDuration: ['', Validators.required],
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
      minHoursPerDayToGetCreditforHalfDay: ['', this.minHoursValidator()],
      maxLateComingAllowedMinutesFirstHalfAttendance: [0],
    })
  }

  ngOnInit() {
    this.loadRecords();
    this.setupShiftTypeListener();
  }

  minHoursValidator() {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null; // If the field is empty, the 'required' validator will handle it
      }
      const [hours, minutes] = control.value.split(':').map(Number);
      if (hours < 1 || hours > 8 || (hours === 8 && minutes > 0)) {
        return { invalidTime: true };
      }
      return null;
    };
  }

  setupShiftTypeListener() {
    this.shiftForm.get('shiftType')?.valueChanges.subscribe((shiftType) => {
      const minHoursControl = this.shiftForm.get('minHoursPerDayToGetCreditForFullDay');

      if (shiftType === 'fixed duration' || shiftType === 'flexi') {
        minHoursControl?.setValidators([Validators.required, this.minHoursValidator()]);
      } else {
        minHoursControl?.clearValidators();
      }

      minHoursControl?.updateValueAndValidity(); // Ensure validation updates
    });
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
      shiftType: data.shiftType,
      startTime: data.startTime,
      endTime: data.endTime,
      minHoursPerDayToGetCreditForFullDay: data.minHoursPerDayToGetCreditForFullDay,
      isCheckoutTimeNextDay: data.isCheckoutTimeNextDay,
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
    this.shiftForm.patchValue({
      dashboardColor: color
    });
  }

  closeColorPicker() {
    this.showColorPicker = false
  }

  onSubmission() {
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
          this.isEdit = false;
          this.loadRecords();
          this.toast.success('Shift Updated', 'Successfully');
          this.shiftForm.reset();
        })
      }
    } 
    else {
      this.shiftForm.markAllAsTouched();
    }
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
