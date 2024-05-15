import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';

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

  constructor(private fb: FormBuilder,
    private modalService: NgbModal,
  ) {
    this.regularisationForm = this.fb.group({
      canEmpRegularizeOwnAttendance: [''],
      canSupervisorsRegularizeSubordinatesAttendance: [''],
      canAdminEditRegularizeAttendance: [''],
      isIPrestrictedEmployeeCheckInCheckOut: [''],
      IPDetails: this.fb.array([]),
      shouldWeeklyEmailNotificationToBeSent: [''],
      whoReceiveWeeklyEmailNotification: [
        ['']
      ],
      isRestrictLocationForCheckInCheckOutUsingMobile: [''],
      restrictLocationDetails: [
        {
          "Location": "string",
          "Latitude": "string",
          "Longitude": "string",
          "Radius": "string"
        }
      ],
      howAssignLocationsForEachEmployee: [''],
      enableLocationCaptureFromMobile: [''],
      geoLocationAPIProvider: [''],
      googleAPIKey: [''],
      isFacialFingerprintRecognitionFromMobile: [''],
      attendanceTemplate: ['']
    })
  }

  ngOnInit() { }

  closeModal() {
    this.close.emit(true);
  }

  addField(): void {
    const fieldGroup = this.fb.group({
      IP: ['', Validators.required],

    });
    (this.regularisationForm.get('IPDetails') as FormArray).push(fieldGroup);
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

}
