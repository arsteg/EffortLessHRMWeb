import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { AttendanceService } from 'src/app/_services/attendance.service';

@Component({
  selector: 'app-attendance-regularization',
  templateUrl: './attendance-regularization.component.html',
  styleUrl: './attendance-regularization.component.css'
})
export class AttendanceRegularizationComponent {
  @Input() isEdit: boolean;
  @Output() close: any = new EventEmitter();
  regularisationForm: FormGroup;
  closeResult: string = '';
  searchText: string = '';
  @Output() changeStep: any = new EventEmitter();
  regularizations: any;

  constructor(private fb: FormBuilder,
    private modalService: NgbModal,
    private attendanceService: AttendanceService
  ) {
    this.regularisationForm = this.fb.group({
      canEmpRegularizeOwnAttendance: [''],
      canSupervisorsRegularizeSubordinatesAttendance: [''],
      canAdminEditRegularizeAttendance: [''],
      isIPrestrictedEmployeeCheckInCheckOut: [''],
      IPDetails: this.fb.array([]),
      shouldWeeklyEmailNotificationToBeSent: [''],
      whoReceiveWeeklyEmailNotification: this.fb.array([]),
      isRestrictLocationForCheckInCheckOutUsingMobile: [''],
      restrictLocationDetails: [null],
      howAssignLocationsForEachEmployee: [''],
      enableLocationCaptureFromMobile: [''],
      geoLocationAPIProvider: [''],
      googleAPIKey: [''],
      isFacialFingerprintRecognitionFromMobile: [''],
      attendanceTemplate: ['']
    })
  }

  ngOnInit() {
    console.log(this.isEdit);

    if (this.isEdit) {
      this.getRegularizationByTemplateId();
    }
  }

  closeModal() {
    this.changeStep.emit(1);
    this.close.emit(true);
  }

  onCheckboxChange(event: any) {
    const formArray: FormArray = this.regularisationForm.get('whoReceiveWeeklyEmailNotification') as FormArray;
    if (event.target.checked) {
      formArray.push(new FormControl(event.target.value));
      console.log(formArray)
    } else {
      let i: number = 0;
      formArray.controls.forEach((ctrl: FormControl) => {
        if (ctrl.value === event.target.value) {
          formArray.removeAt(i);
          return;
        }
        i++;
      });
    }
  }

  addField(): void {
    const control = <FormArray>this.regularisationForm.get('IPDetails');
    control.push(this.fb.group({
      IP: ['']
    }));
  }

  get fields() {
    return this.regularisationForm.get('IPDetails') as FormArray;
  }

  removeCatgoryField(index: number) {
    if (this.fields.value[index].id) {
      console.log(this.fields.value[index].id);
      // this.expenses.deleteApplicationField(this.fields.value[index].id).subscribe((res: any) => {
      //   this.fields.removeAt(index);
      //   this.toast.success('Successfully Deleted!!!', 'Expense Category Field');
      // });
    }
    else {
      this.fields.removeAt(index);
    }
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

  onClose(event) {
    if (event) {
      this.modalService.dismissAll();
    }
  }

  onCloseMap(event) {
    if (event) {
      this.modalService.dismissAll();
    }
  }

  getRegularizations() {
    this.attendanceService.getRegularizations().subscribe((res: any) => {
      this.regularizations = res.data;
    })
  }
  getRegularizationByTemplateId() {
    const templateId = this.attendanceService.selectedTemplate.getValue()._id;
    this.attendanceService.getRegularizationByTemplateId(templateId).subscribe((res: any) => {
      const data = res.data;
      console.log(data);
  
      // Clear existing IPDetails form array
      const ipDetailsControl = <FormArray>this.regularisationForm.get('IPDetails');
      ipDetailsControl.clear();
  
      // Populate IPDetails form array with new data
      if (data.IPDetails) {
        data.IPDetails.forEach(ipDetail => {
          ipDetailsControl.push(this.fb.group({
            IP: [ipDetail.IP]
          }));
        });
      }
  
      // Populate whoReceiveWeeklyEmailNotification form array with new data
      const whoReceiveWeeklyEmailNotificationControl = <FormArray>this.regularisationForm.get('whoReceiveWeeklyEmailNotification');
      whoReceiveWeeklyEmailNotificationControl.clear();
      if (data.whoReceiveWeeklyEmailNotification) {
        data.whoReceiveWeeklyEmailNotification.forEach(notification => {
          whoReceiveWeeklyEmailNotificationControl.push(new FormControl(notification));
        });
      }
  
      this.regularisationForm.patchValue({
        canEmpRegularizeOwnAttendance: data.canEmpRegularizeOwnAttendance,
        canSupervisorsRegularizeSubordinatesAttendance: data.canSupervisorsRegularizeSubordinatesAttendance,
        canAdminEditRegularizeAttendance: data.canAdminEditRegularizeAttendance,
        isIPrestrictedEmployeeCheckInCheckOut: data.isIPrestrictedEmployeeCheckInCheckOut,
        shouldWeeklyEmailNotificationToBeSent: data.shouldWeeklyEmailNotificationToBeSent,
        isRestrictLocationForCheckInCheckOutUsingMobile: data.isRestrictLocationForCheckInCheckOutUsingMobile,
        restrictLocationDetails: data.restrictLocationDetails,
        howAssignLocationsForEachEmployee: data.howAssignLocationsForEachEmployee,
        enableLocationCaptureFromMobile: data.enableLocationCaptureFromMobile,
        geoLocationAPIProvider: data.geoLocationAPIProvider,
        googleAPIKey: data.googleAPIKey,
        isFacialFingerprintRecognitionFromMobile: data.isFacialFingerprintRecognitionFromMobile,
        attendanceTemplate: data.attendanceTemplate
      });
  
      console.log(this.regularisationForm.value);
    });
  }
  


  onSubmission() {
    const templateId = this.attendanceService.selectedTemplate.getValue()._id;
    this.regularisationForm.value.attendanceTemplate = templateId;

    if (!this.isEdit) {
      console.log(this.regularisationForm.value)
      this.attendanceService.addRegularizations(this.regularisationForm.value).subscribe((res: any) => {
        this.getRegularizations();
      });
    }
    else {
      console.log(this.regularisationForm.value);
      this.attendanceService.getRegularizationByTemplateId(templateId).subscribe((res: any) => {
        const data = res.data;
        this.attendanceService.updateRegularizations(data._id, this.regularisationForm.value).subscribe((res: any) => {
        });
      })
    }

  }
}
