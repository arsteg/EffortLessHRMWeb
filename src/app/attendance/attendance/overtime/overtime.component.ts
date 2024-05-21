import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { AttendanceService } from 'src/app/_services/attendance.service';
import { ExportService } from 'src/app/_services/export.service';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';

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

  constructor(private fb: FormBuilder,
    private modalService: NgbModal,
    private dialog: MatDialog,
    private toast: ToastrService,
    private attendanceService: AttendanceService,
    private exportService: ExportService
  ) {
    this.roundingForm = this.fb.group({
      roundingPatternName: [''],
      roundingPatternCode: [''],
      shift: [''],
      roundingPatternMethod: [''],
      roundingPattern: [''],
      roundingValue: [0],
      OTtypeApplicable: [''],
      OTtypeApplicablePreOT: [''],
      PreOTValueMinutes: [''],
      PreOTValueHour: [''],
      OTtypeApplicablePostOT: [''],
      PostOTValueHour: [''],
      PostOTValueMinutes: [''],
      OTtypeApplicableWeekOFf: ['']
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
      Name: [''],
      OvertimeInformation: [''],
      BaseType: [''],
      AttandanceShift: [''],
      FromTimeHour: [''],
      FromTimeMinutes: [''],
      FromTimeTT: [''],
      ToTimeTT: [''],
      ToTimeHour: [''],
      ToTimeMinutes: [''],
      CutomMultiplier: [0],
      CalculationType: ['']
    })
  }

  ngOnInit() {
    this.getRounding();
    this.getOverTimeRecords();
  }

  selectTab(tabId: string) {
    this.activeTab = tabId;
  }

  closeModal() {
    this.modalService.dismissAll();
  }

  open(content: any) {
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {
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
    if (this.changeMode == 'Add') {
      this.attendanceService.addRounding(this.roundingForm.value).subscribe((res: any) => {
        this.getRounding();
        this.roundingForm.reset();
        this.toast.success('Rounding Information Created', 'Successfully')
      },
        err => {
          this.toast.error('Rounding Information can not be created', 'Error')
        })
    }
    else {
      this.attendanceService.updateRounding(this.selectedRecord._id, this.roundingForm.value).subscribe((res: any) => {
        this.getRounding();
        this.roundingForm.reset();
        this.toast.success('Rounding Information Updated', 'Successfully')
      },
        err => {
          this.toast.error('Rounding Information can not be Updated', 'Error')
        })
    }
  }

  getRounding() {
    this.attendanceService.getRounding().subscribe((res: any) => {
      this.rounding = res.data;
    })
  }
 
  onRoundingPatternChange(event) {
    const selectedPatternName = event.target.value;
    this.selectedRoundingPattern = this.rounding.find(
      pattern => pattern.roundingPatternName === selectedPatternName
    );
  }

  deleteRoundingInfo(id: string) {
    this.attendanceService.deleteRounding(id).subscribe((res: any) => {
      this.getRounding();
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
  

  getOverTimeRecords() {
    this.attendanceService.getOverTime().subscribe((res: any) => {
      this.overTimeRecord = res.data;
    })
  }

  onOverTimeSubmission() {
    if (!this.isEdit) {
      console.log(this.overTimeForm.value)
      this.attendanceService.addOverTime(this.overTimeForm.value).subscribe((res: any) => {
        this.getOverTimeRecords();
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
        this.getOverTimeRecords();
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
      this.getOverTimeRecords();
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
