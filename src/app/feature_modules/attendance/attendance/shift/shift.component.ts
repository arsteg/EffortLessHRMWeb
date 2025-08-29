import { Component, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { CustomValidators } from 'src/app/_helpers/custom-validators';
import { AttendanceService } from 'src/app/_services/attendance.service';
import { ExportService } from 'src/app/_services/export.service';
import { ActionVisibility, TableColumn } from 'src/app/models/table-column';
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
  shift: any[] = [];
  p: number = 1;
  selectedShift: any;
  shiftForm: FormGroup;
  totalRecords: number = 0
  recordsPerPage: number = 10;
  currentPage: number = 1;
  allData: any[] = [];
  @ViewChild('addModal') addModal: any;
  dialogRef: MatDialogRef<any> | null = null;

  columns: TableColumn[] = [
    { key: 'name', name: 'Shift' },
    { key: 'startTime', name: 'Starts From' },
    { key: 'endTime', name: 'Ends At' },
    {
      key: 'actions',
      name: 'Action',
      isAction: true,
      options: [
        { label: 'Edit', icon: 'edit', visibility: ActionVisibility.LABEL },
        { label: 'Delete', icon: 'delete', visibility: ActionVisibility.LABEL }
      ]
    }
  ];

  private shiftTypeSubscription: Subscription; // To manage subscription
  private isLateComingAllowedSubscription: Subscription;
  private willLateComingDeductfromPresentDaysSubscription: Subscription;
  private isEarlyGoingAllowedSubscription: Subscription;

  constructor(
    private attendanceService: AttendanceService,
    private dialog: MatDialog,
    private exportService: ExportService,
    private toast: ToastrService,
    private translate: TranslateService,
    private fb: FormBuilder,
  ) {
    this.shiftForm = this.fb.group({
      name: ['', [Validators.required, CustomValidators.labelValidator, CustomValidators.noLeadingOrTrailingSpaces.bind(this)]],
      shiftType: ['fixed duration', Validators.required],
      startTime: ['10:00', Validators.required], // Default to 10 AM
      endTime: ['18:00', Validators.required], // Default to 6 PM
      minHoursPerDayToGetCreditForFullDay: ['', [Validators.required, Validators.min(1), Validators.max(8), CustomValidators.minHoursFullDayValidator()]], 
      earliestArrival: ['', Validators.required],
      latestDeparture: ['', Validators.required],
      firstHalfDuration: ['', [Validators.required, Validators.min(0)]], // Added min
      secondHalfDuration: ['', [Validators.required, Validators.min(0)]], // Added min
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
      minHoursPerDayToGetCreditforHalfDay: ['0', [Validators.max(6), CustomValidators.minHoursHalfDayValidator()]],  // Added min validator
      maxLateComingAllowedMinutesFirstHalfAttendance:['0', Validators.min(0)], 
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
        minHoursHalfDayControl?.setValidators([Validators.required, CustomValidators.minHoursHalfDayValidator()]);
        minHoursFullDayControl?.setValidators([Validators.required, CustomValidators.minHoursFullDayValidator()]);
      }
      isHalfDayApplicableControl.updateValueAndValidity();
      minHoursHalfDayControl.updateValueAndValidity();
      minHoursFullDayControl.updateValueAndValidity();
    });
    this.shiftForm.get('isHalfDayApplicable')?.valueChanges.subscribe((isApplicable) => {
      const halfDayControl = this.shiftForm.get('minHoursPerDayToGetCreditforHalfDay');
    
      if (isApplicable) {
        halfDayControl.setValidators([
          Validators.required,
          Validators.min(1),
          Validators.max(6),
          CustomValidators.minHoursHalfDayValidator()
        ]);
      } else {
        halfDayControl.clearValidators();
        halfDayControl.setValue(null); // or '', depending on type
      }
    });
    
  }  


  // Custom validator for start and end times
  timeComparisonValidator: ValidatorFn = (control: AbstractControl): { [key: string]: boolean } | null => {
    const startTime = control.get('startTime')?.value;
    const endTime = control.get('endTime')?.value;
    const earliestArrival = control.get('earliestArrival')?.value;
    const latestDeparture = control.get('latestDeparture')?.value;

    const errors: { [key: string]: boolean } = {};

    if (startTime && endTime) {
      if (startTime === endTime) {
        errors['timesCannotBeSame'] = true;
      }
      if (startTime > endTime) {
        errors['startTimeGreaterThanEndTime'] = true;
      }
    }

    if (earliestArrival && startTime && earliestArrival > startTime) {
      errors['earliestArrivalAfterStartTime'] = true;
    }

    if (latestDeparture && endTime && latestDeparture < endTime) {
      errors['latestDepartureBeforeEndTime'] = true;
    }

    return Object.keys(errors).length > 0 ? errors : null;
  };



  setupShiftTypeListener() {
    this.shiftForm.get('shiftType')?.valueChanges.subscribe((shiftType) => {
      const minHoursControl = this.shiftForm.get('minHoursPerDayToGetCreditForFullDay');

      if (shiftType === 'fixed duration' || shiftType === 'flexi') {
        minHoursControl?.setValidators([Validators.required, CustomValidators.minHoursFullDayValidator()]);
      } else {
        minHoursControl?.setValidators([CustomValidators.minHoursFullDayValidator()]);
      }

      minHoursControl?.updateValueAndValidity(); // Ensure validation updates
    });
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
      this.allData = res.data;
      this.totalRecords = res.total;
    })
  }

  clearForm() {
    this.shiftForm.reset({
      name: '',
      shiftType: 'fixed duration', // Reset to 'fixed duration'
      startTime: '10:00', // Default to 10 AM
      endTime: '18:00', // Default to 6 PM
      minHoursPerDayToGetCreditForFullDay: '',
      earliestArrival: '',
      latestDeparture: '',
      firstHalfDuration: '',
      secondHalfDuration: '',
      company: '',
      isLateComingAllowed: false,
      noOfDaysLateComing: 0,
      graceTimeLimitForLateComing: 0,
      willLateComingDeductfromPresentDays: false,
      numberOflateComingDaysAllowed: 0,
      numberOfDaysToBeDeducted: '',
      maximumTimeLimitForLateComing: 0,
      isEarlyGoingAllowed: false,
      enterNumberOfDaysForEarlyGoing: 0,
      graceTimeLimitForEarlyGoing: 0,
      isHalfDayApplicable: false,
      minHoursPerDayToGetCreditforHalfDay: 0,
      maxLateComingAllowedMinutesFirstHalfAttendance: 0
    });
  }
  closeModal() {
    this.clearForm();
    this.dialogRef.close(true);
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
    this.dialogRef = this.dialog.open(this.addModal, {
      width: '50%',
      disableClose: true
    });
    this.dialogRef.afterClosed().subscribe(result => {
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
          this.toast.success(
            this.translate.instant('attendance.successShiftCreate'),
            this.translate.instant('common.success')
          );
          this.shiftForm.reset();
        }, (err) => {         
          const errorMessage = err?.error?.message || err?.message || err 
          ||  this.translate.instant('attendance.createShiftError')
          ;
          this.toast.error(errorMessage, this.translate.instant('common.error'));
        })
      }
      else {
        this.attendanceService.updateShift(this.selectedShift, this.shiftForm.value).subscribe((res: any) => {
          this.changeMode = 'Add';
          this.isEdit = false;
          this.loadRecords();
          this.toast.success(
            this.translate.instant('attendance.successShiftUpdate'),
            this.translate.instant('common.success')
          );
          this.shiftForm.reset();
        }, (err) => {         
          const errorMessage = err?.error?.message || err?.message || err 
          ||  this.translate.instant('attendance.updateShiftError')
          ;
          this.toast.error(errorMessage, this.translate.instant('common.error'));
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
      this.toast.success(
        this.translate.instant('attendance.deleteSuccess'),
        this.translate.instant('common.success')
      );
    },
      (err) => {
        const errorMessage = err?.error?.message || err?.message || err 
        ||  this.translate.instant('attendance.deleteError')
        ;
        this.toast.error(errorMessage, this.translate.instant('common.error'));
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
        const errorMessage = err?.error?.message || err?.message || err 
        ||  this.translate.instant('attendance.deleteError')
        ;
        this.toast.error(errorMessage, this.translate.instant('common.error'));
      }
    });
  }

  onPageChange(event: any) {
    this.currentPage = event.pageIndex + 1; // Mat Paginator uses 0-based index
    this.recordsPerPage = event.pageSize;
    this.loadRecords();
  }

  onSortChange(event: any) {
    const sorted = this.shift.slice().sort((a: any, b: any) => {
      const valueA = a[event.active];
      const valueB = b[event.active];
      return event.direction === 'asc' ? (valueA > valueB ? 1 : -1) : (valueA < valueB ? 1 : -1);
    });
    this.shift = sorted;
  }

  onSearchChange(event: string) {
    this.searchText = event;
    this.shift = this.allData?.filter(row => {
      return this.columns.some(col => {
        if (col.key !== 'actions') {
          return row[col.key]?.toString().toLowerCase().includes(event.toLowerCase());
        }
        return false;
      });
    });
  }

  handleAction(event: any) {
    if (event.action.label === 'Edit') {
      this.changeMode == 'Update';
      this.isEdit = true;
      this.open(this.addModal);
      this.selectedShift = event?.row?._id;
      this.setFormValues(event?.row);
    }
    if (event.action.label === 'Delete') {
      this.deleteDialog(event.row._id);
    }
  }
}
