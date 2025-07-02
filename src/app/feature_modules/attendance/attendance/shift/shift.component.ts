import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { AttendanceService } from 'src/app/_services/attendance.service';
import { ExportService } from 'src/app/_services/export.service';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';

// const labelValidator: ValidatorFn = (control: AbstractControl) => {
//   const value = control.value as string;
//   if (!value || /^\s*$/.test(value)) {
//     return { required: true };
//   }
//   const valid = /^(?=.*[a-zA-Z])[a-zA-Z\s(),\-/]*$/.test(value);
//   return valid ? null : { invalidLabel: true };
// };
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
  totalRecords: number
  recordsPerPage: number = 10;
  currentPage: number = 1;

  private shiftTypeSubscription: Subscription; // To manage subscription
  private isLateComingAllowedSubscription: Subscription;
  private willLateComingDeductfromPresentDaysSubscription: Subscription;
  private isEarlyGoingAllowedSubscription: Subscription;

  constructor(
    private attendanceService: AttendanceService,
    private modalService: NgbModal,
    private dialog: MatDialog,
    private exportService: ExportService,
    private toast: ToastrService,
    private fb: FormBuilder,
  ) {
    this.shiftForm = this.fb.group({
      name: ['', [Validators.required, this.labelValidator()]],
      shiftType: ['', Validators.required],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required],
      minHoursPerDayToGetCreditForFullDay: ['', [Validators.required, Validators.min(1),
      Validators.max(8)]],
      earliestArrival: ['', Validators.required],
      latestDeparture: ['', Validators.required],
      firstHalfDuration: ['', [Validators.required, Validators.min(1)]], // Added min
      secondHalfDuration: ['', [Validators.required, Validators.min(1)]], // Added min
      company: [''],
      isLateComingAllowed: [false],
      noOfDaysLateComing: [0],
      graceTimeLimitForLateComing: [0],
      willLateComingDeductfromPresentDays: [false],
      numberOflateComingDaysAllowed: [0],
      numberOfDaysToBeDeducted: [''],
      maximumTimeLimitForLateComing: [0],
      isEarlyGoingAllowed: [false],
      enterNumberOfDaysForEarlyGoing: [0],
      graceTimeLimitForEarlyGoing: [0],
      isHalfDayApplicable: [false],
      minHoursPerDayToGetCreditforHalfDay: ['', [Validators.min(0)]], // Added min validator
      maxLateComingAllowedMinutesFirstHalfAttendance: [0],
    }, {
      validators: this.timeComparisonValidator // Apply the custom validator at the form group level
    });
  }

  ngOnInit() {
    this.loadRecords();
    this.setupShiftTypeListener();
    this.setupConditionalValidation();
  }
  ngOnDestroy(): void {
    // Unsubscribe to prevent memory leaks
    if (this.shiftTypeSubscription) {
      this.shiftTypeSubscription.unsubscribe();
    }
    if (this.isLateComingAllowedSubscription) {
      this.isLateComingAllowedSubscription.unsubscribe();
    }
    if (this.willLateComingDeductfromPresentDaysSubscription) {
      this.willLateComingDeductfromPresentDaysSubscription.unsubscribe();
    }
    if (this.isEarlyGoingAllowedSubscription) {
      this.isEarlyGoingAllowedSubscription.unsubscribe();
    }
  }

  setupConditionalValidation(): void {
    // Conditional validation for 'noOfDaysLateComing', 'graceTimeLimitForLateComing', etc.
    this.isLateComingAllowedSubscription = this.shiftForm.get('isLateComingAllowed').valueChanges.subscribe(value => {
      const noOfDaysLateComingControl = this.shiftForm.get('noOfDaysLateComing');
      const graceTimeLimitForLateComingControl = this.shiftForm.get('graceTimeLimitForLateComing');
      const willLateComingDeductControl = this.shiftForm.get('willLateComingDeductfromPresentDays');

      if (value) {
        noOfDaysLateComingControl.setValidators([Validators.required, Validators.min(0)]);
        graceTimeLimitForLateComingControl.setValidators([Validators.required, Validators.min(0)]);
        willLateComingDeductControl.setValidators(Validators.required);
      } else {
        noOfDaysLateComingControl.clearValidators();
        graceTimeLimitForLateComingControl.clearValidators();
        willLateComingDeductControl.clearValidators();
        // Reset values if not allowed
        noOfDaysLateComingControl.setValue(0);
        graceTimeLimitForLateComingControl.setValue(0);
        willLateComingDeductControl.setValue(false);
      }
      noOfDaysLateComingControl.updateValueAndValidity();
      graceTimeLimitForLateComingControl.updateValueAndValidity();
      willLateComingDeductControl.updateValueAndValidity();
    });

    this.willLateComingDeductfromPresentDaysSubscription = this.shiftForm.get('willLateComingDeductfromPresentDays').valueChanges.subscribe(value => {
      const noOfLateComingDaysAllowedControl = this.shiftForm.get('numberOflateComingDaysAllowed');
      const numberOfDaysToBeDeductedControl = this.shiftForm.get('numberOfDaysToBeDeducted');
      const maximumTimeLimitForLateComingControl = this.shiftForm.get('maximumTimeLimitForLateComing');

      if (value) {
        noOfLateComingDaysAllowedControl.setValidators([Validators.required, Validators.min(0)]);
        numberOfDaysToBeDeductedControl.setValidators(Validators.required);
        maximumTimeLimitForLateComingControl.setValidators([Validators.required, Validators.min(0)]);
      } else {
        noOfLateComingDaysAllowedControl.clearValidators();
        numberOfDaysToBeDeductedControl.clearValidators();
        maximumTimeLimitForLateComingControl.clearValidators();
        // Reset values if not applicable
        noOfLateComingDaysAllowedControl.setValue(0);
        numberOfDaysToBeDeductedControl.setValue('');
        maximumTimeLimitForLateComingControl.setValue(0);
      }
      noOfLateComingDaysAllowedControl.updateValueAndValidity();
      numberOfDaysToBeDeductedControl.updateValueAndValidity();
      maximumTimeLimitForLateComingControl.updateValueAndValidity();
    });

    this.isEarlyGoingAllowedSubscription = this.shiftForm.get('isEarlyGoingAllowed').valueChanges.subscribe(value => {
      const enterNumberOfDaysForEarlyGoingControl = this.shiftForm.get('enterNumberOfDaysForEarlyGoing');
      const graceTimeLimitForEarlyGoingControl = this.shiftForm.get('graceTimeLimitForEarlyGoing');

      if (value) {
        enterNumberOfDaysForEarlyGoingControl.setValidators([Validators.required, Validators.min(0)]);
        graceTimeLimitForEarlyGoingControl.setValidators([Validators.required, Validators.min(0)]);
      } else {
        enterNumberOfDaysForEarlyGoingControl.clearValidators();
        graceTimeLimitForEarlyGoingControl.clearValidators();
        // Reset values
        enterNumberOfDaysForEarlyGoingControl.setValue(0);
        graceTimeLimitForEarlyGoingControl.setValue(0);
      }
      enterNumberOfDaysForEarlyGoingControl.updateValueAndValidity();
      graceTimeLimitForEarlyGoingControl.updateValueAndValidity();
    });

    // Conditional validation for shiftType, minHoursPerDayToGetCreditforHalfDay, and minHoursPerDayToGetCreditForFullDay
    this.shiftTypeSubscription = this.shiftForm.get('shiftType').valueChanges.subscribe(shiftType => {
      const minHoursHalfDayControl = this.shiftForm.get('minHoursPerDayToGetCreditforHalfDay');
      const minHoursFullDayControl = this.shiftForm.get('minHoursPerDayToGetCreditForFullDay');
      const isHalfDayApplicableControl = this.shiftForm.get('isHalfDayApplicable');

      if (shiftType === 'fixed duration') {
        isHalfDayApplicableControl.setValidators(Validators.required);
      } else {
        isHalfDayApplicableControl.clearValidators();
        minHoursHalfDayControl.clearValidators();
        minHoursFullDayControl.clearValidators();
        isHalfDayApplicableControl.setValue(false); // Reset if not fixed duration
        minHoursHalfDayControl.setValue(''); // Clear value if not applicable
        minHoursFullDayControl.setValue(''); // Clear value if not applicable
      }
      isHalfDayApplicableControl.updateValueAndValidity();
      minHoursHalfDayControl.updateValueAndValidity();
      minHoursFullDayControl.updateValueAndValidity();
    });

    // Handle minHoursPerDayToGetCreditforHalfDay and minHoursPerDayToGetCreditForFullDay based on isHalfDayApplicable
    this.shiftForm.get('isHalfDayApplicable').valueChanges.subscribe(isHalfDayApplicable => {
      const minHoursHalfDayControl = this.shiftForm.get('minHoursPerDayToGetCreditforHalfDay');
      const minHoursFullDayControl = this.shiftForm.get('minHoursPerDayToGetCreditForFullDay');
      if (isHalfDayApplicable && this.shiftForm.get('shiftType').value === 'fixed duration') {
        minHoursHalfDayControl.setValidators([Validators.required, Validators.min(1)]);
        minHoursFullDayControl.setValidators([Validators.required, Validators.min(1)]);
      } else {
        minHoursHalfDayControl.clearValidators();
        minHoursFullDayControl.clearValidators();
        minHoursHalfDayControl.setValue(''); // Clear value if not applicable
        minHoursFullDayControl.setValue(''); // Clear value if not applicable
      }
      minHoursHalfDayControl.updateValueAndValidity();
      minHoursFullDayControl.updateValueAndValidity();
    });
}

  // Custom validator for shift name
  labelValidator(): ValidatorFn {
    return (control: AbstractControl): {
      [key: string]: any
    } | null => {
      const value = control.value as string;
      if (!value || /^\s*$/.test(value)) {
        return {
          required: true
        };
      }
      // Allows letters, spaces, commas, hyphens, forward slashes, and parentheses
      const valid = /^(?=.*[a-zA-Z])[a-zA-Z0-9\s(),\-/]*$/.test(value);
      return valid ? null : {
        invalidLabel: true
      };
    };
  }


  // Custom validator for start and end times
  timeComparisonValidator: ValidatorFn = (control: AbstractControl): {
    [key: string]: boolean
  } | null => {
    const startTime = control.get('startTime').value;
    const endTime = control.get('endTime').value;

    if (startTime && endTime && startTime === endTime) {
      return {
        timesCannotBeSame: true
      };
    }
    if (startTime > endTime) {
      return {
        startTimeGreaterThanEndTime: true
      };
    }
    return null;
  };


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
      shiftType: data.shiftType,
      startTime: data.startTime,
      endTime: data.endTime,
      minHoursPerDayToGetCreditForFullDay: data.minHoursPerDayToGetCreditForFullDay,
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
