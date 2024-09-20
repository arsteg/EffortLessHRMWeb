import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { AttendanceService } from 'src/app/_services/attendance.service';
import { ExportService } from 'src/app/_services/export.service';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';

export function timeValidator(controlName: string): ValidatorFn {
  return (control: FormControl) => {
    const value = control.value;
    if (controlName === 'FromTimeHour' || controlName === 'ToTimeHour') {
      if (value < 0 || value > 23) {
        return { hour: true };
      }
    } else if (controlName === 'FromTimeMinutes' || controlName === 'ToTimeMinutes') {
      if (value < 0 || value > 59) {
        return { minute: true };
      }
    }
    return null;
  };
}
@Component({
  selector: 'app-overtime',
  templateUrl: './overtime.component.html',
  styleUrl: './overtime.component.css'
})
export class OvertimeComponent {
  roundingForm: FormGroup;
  overTimeForm: FormGroup;
  isEdit: boolean;
  searchText: string = '';
  closeResult: string = '';
  p: number = 1;
  selectedRecord: any;
  rounding: any;
  overTimeRecord: any;
  changeMode: 'Add' | 'Update' = 'Add';
  activeTab: string = 'rounding';
  selectedTab: number = 1;
  selectedOverTime: any;
  selectedRoundingPattern: any;
  totalRecords: number
  recordsPerPage: number = 10;
  currentPage: number = 1;

  constructor(private fb: FormBuilder,
    private modalService: NgbModal,
    private dialog: MatDialog,
    private toast: ToastrService,
    private attendanceService: AttendanceService,
    private exportService: ExportService
  ) {
    this.roundingForm = this.fb.group({
      roundingPatternName: ['', Validators.required],
      roundingPatternCode: ['', Validators.required],
      shift: ['', Validators.required],
      roundingPatternMethod: ['', Validators.required],
      roundingPattern: ['', Validators.required],
      roundingValue: [0, Validators.required],
      OTtypeApplicable: [''],
      OTtypeApplicablePreOT: ['', Validators.required],
      PreOTValueMinutes: ['0', Validators.required],
      PreOTValueHour: ['0', Validators.required],
      OTtypeApplicablePostOT: ['', Validators.required],
      PostOTValueHour: ['0', Validators.required],
      PostOTValueMinutes: ['0', Validators.required],
      OTtypeApplicableWeekOFf: ['', Validators.required]
    });
    this.roundingForm.get('OTtypeApplicablePreOT').valueChanges.subscribe(value => {
      if (value) {
        this.roundingForm.get('PreOTValueHour').enable();
        this.roundingForm.get('PreOTValueMinutes').enable();
      } else {
        this.roundingForm.get('PreOTValueHour').disable();
        this.roundingForm.get('PreOTValueMinutes').disable();
      }
    });
    this.roundingForm.get('OTtypeApplicablePostOT').valueChanges.subscribe(value => {
      if (value) {
        this.roundingForm.get('PostOTValueHour').enable();
        this.roundingForm.get('PostOTValueMinutes').enable();
      } else {
        this.roundingForm.get('PostOTValueHour').disable();
        this.roundingForm.get('PostOTValueMinutes').disable();
      }
    });
    this.overTimeForm = this.fb.group({
      Name: ['', Validators.required],
      OvertimeInformation: ['', Validators.required],
      BaseType: ['', Validators.required],
      AttandanceShift: [''],
      FromTimeHour: ['', [Validators.required, timeValidator('FromTimeHour')]],
      FromTimeMinutes: ['', [Validators.required, timeValidator('FromTimeMinutes')]],
      FromTimeTT: ['', Validators.required],
      ToTimeTT: ['', Validators.required],
      ToTimeHour: ['', [Validators.required, timeValidator('ToTimeHour')]],
      ToTimeMinutes: ['', [Validators.required, timeValidator('ToTimeMinutes')]],
      CutomMultiplier: [0],
      CalculationType: ['']
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
    if (this.activeTab == 'overTime') {
      this.attendanceService.getOverTime(pagination.skip, pagination.next).subscribe((res: any) => {
        this.overTimeRecord = res.data;
        this.totalRecords = res.total;
      })
    }
    else {
      this.attendanceService.getRounding(pagination.skip, pagination.next).subscribe((res: any) => {
        this.rounding = res.data;
        this.totalRecords = res.total;
      })
    }

  }

  selectTab(tabId: string) {
    this.activeTab = tabId;
    console.log(this.activeTab);
    this.loadRecords();
  }

  closeModal() {
    this.modalService.dismissAll();
  }

  open(content: any) {
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', backdrop: 'static' }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
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

  setFormValues(records) {
    this.roundingForm.patchValue({
      roundingPatternName: records.roundingPatternName,
      roundingPatternCode: records.roundingPatternCode,
      shift: records.shift,
      roundingPatternMethod: records.roundingPatternMethod,
      roundingPattern: records.roundingPattern,
      roundingValue: records.roundingValue,
      OTtypeApplicable: records.OTtypeApplicable,
      OTtypeApplicablePreOT: records.OTtypeApplicablePreOT,
      PreOTValueMinutes: records.PreOTValueMinutes,
      PreOTValueHour: records.PreOTValueHour,
      OTtypeApplicablePostOT: records.OTtypeApplicablePostOT,
      PostOTValueHour: records.PostOTValueHour,
      PostOTValueMinutes: records.PostOTValueMinutes,
      OTtypeApplicableWeekOFf: records.OTtypeApplicableWeekOFf
    })
  }

  clearForm() {
    this.roundingForm.reset();
  }

  onSubmission() {
    let payload = {
      roundingPatternName: this.roundingForm.value.roundingPatternName,
      roundingPatternCode: this.roundingForm.value.roundingPatternCode,
      shift: this.roundingForm.value.shift,
      roundingPatternMethod: this.roundingForm.value.roundingPatternMethod,
      roundingPattern: this.roundingForm.value.roundingPattern,
      roundingValue: this.roundingForm.value.roundingValue,
      OTtypeApplicable: this.roundingForm.value.OTtypeApplicable,
      OTtypeApplicablePreOT: this.roundingForm.value.OTtypeApplicablePreOT,
      PreOTValueMinutes: this.roundingForm.value.PreOTValueMinutes,
      PreOTValueHour: this.roundingForm.value.PreOTValueHour,
      OTtypeApplicablePostOT: this.roundingForm.value.OTtypeApplicablePostOT,
      PostOTValueHour: this.roundingForm.value.PostOTValueHour,
      PostOTValueMinutes: this.roundingForm.value.PostOTValueMinutes,
      OTtypeApplicableWeekOFf: this.roundingForm.value.OTtypeApplicableWeekOFf
    }
    console.log(payload);
    if (this.roundingForm.valid) {
      if (this.changeMode == 'Add') {
        this.attendanceService.addRounding(payload).subscribe((res: any) => {
          this.loadRecords();
          this.roundingForm.reset();
          this.toast.success('Rounding Information Created', 'Successfully')
        },
          err => {
            this.toast.error('Rounding Information can not be created', 'Error')
          })
      }
      else {
        this.attendanceService.updateRounding(this.selectedRecord._id, payload).subscribe((res: any) => {
          this.loadRecords();
          this.roundingForm.reset();
          this.changeMode = 'Add';
          this.toast.success('Rounding Information Updated', 'Successfully')
        },
          err => {
            this.toast.error('Rounding Information can not be Updated', 'Error')
          })
      }
    }
    else {
      this.markFormGroupTouched(this.roundingForm);
    }
  }
  markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  onRoundingPatternChange(event) {
    const selectedPatternName = event.target.value;
    this.selectedRoundingPattern = this.rounding.find(
      pattern => pattern.roundingPatternName === selectedPatternName
    );
  }

  deleteRoundingInfo(id: string) {
    this.attendanceService.deleteRounding(id).subscribe((res: any) => {
      this.loadRecords();
      this.toast.success('Successfully Deleted!!!', 'Rounding Information')
    },
      (err) => {
        this.toast.error('This Rounding Information Can not be deleted'
          , 'Error')
      })
  }

  deleteDialog(id: string): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'delete') {
        this.deleteRoundingInfo(id);
      }
      err => {
        this.toast.error('Can not be Deleted', 'Error!')
      }
    });
  }

  exportToCsv() {
    const dataToExport = this.rounding;
    this.exportService.exportToCSV('Rounding-information', 'Rounding-information', dataToExport);
  }

  exportToCsvOverTime() {
    const dataToExport = this.overTimeRecord;
    this.exportService.exportToCSV('Overtime-Information', 'Overtime-Information', dataToExport);
  }

  onOverTimeSubmission() {
    if (!this.isEdit) {
      this.attendanceService.addOverTime(this.overTimeForm.value).subscribe((res: any) => {
        this.loadRecords();
        this.overTimeForm.reset();
        this.toast.success('Over Time Information Created', 'Successfully');
      },
        err => {
          this.toast.error('Over Time Information ca not be created', 'ERROR')
        })
    }
    else {
      console.log(this.selectedOverTime)
      this.attendanceService.updateOverTime(this.selectedOverTime._id, this.overTimeForm.value).subscribe((res: any) => {
        this.loadRecords();
        this.toast.success('Over Time Information Updated', 'Successfully');
      },
        err => {
          this.toast.error('Over Time Information can not be Updated', 'ERROR');
        })
    }
  }

  setOvertimeFormValues(overtime) {
    this.selectedRoundingPattern = this.rounding.find(
      pattern => pattern.roundingPatternName === overtime.OvertimeInformation
    );
    this.overTimeForm.patchValue({
      Name: overtime.Name,
      OvertimeInformation: overtime.OvertimeInformation,
      BaseType: overtime.BaseType,
      AttandanceShift: overtime.AttandanceShift,
      FromTimeHour: overtime.FromTimeHour,
      FromTimeMinutes: overtime.FromTimeMinutes,
      FromTimeTT: overtime.FromTimeTT,
      ToTimeTT: overtime.ToTimeTT,
      ToTimeHour: overtime.ToTimeHour,
      ToTimeMinutes: overtime.ToTimeMinutes,
      CutomMultiplier: overtime.CutomMultiplier,
      CalculationType: overtime.CalculationType
    });
  }

  clearOvertimeForm() {
    this.overTimeForm.reset();
  }

  deleteOvertimeInfo(id: string) {
    this.attendanceService.deleteOverTime(id).subscribe((res: any) => {
      this.loadRecords();
      this.toast.success('Successfully Deleted!!!', 'Overtime Information')
    },
      (err) => {
        this.toast.error('This Overtime information Can not be deleted'
          , 'Error')
      })
  }

  deleteOverTimeDialog(id: string): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'delete') {
        this.deleteOvertimeInfo(id);
      }
      (err) => {
        this.toast.error('Can not be Deleted', 'Error!')
      }
    });
  }

}
