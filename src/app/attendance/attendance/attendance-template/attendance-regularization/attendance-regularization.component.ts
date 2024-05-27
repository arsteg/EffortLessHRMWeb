import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { AttendanceService } from 'src/app/_services/attendance.service';
import { ToastrService } from 'ngx-toastr';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
// import { GoogleMap, MapInfoWindow, MapMarker } from '@angular/google-maps';
import {  GoogleMap } from '@angular/google-maps';
interface Marker {
  lat: number;
  lng: number;
  label?: string; // Optional label for the marker
}

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
  regularizationId: string;
  location: any;
  p: number = 1;
  locationForm: FormGroup;
  display: any;
  center: google.maps.LatLngLiteral;
  // zoom = 16;
  ipAddress: string;
  markerPosition: google.maps.LatLngLiteral;

  @ViewChild(GoogleMap, { static: false }) map: GoogleMap | undefined;
  // center: any = { lat: 30.3753, lng: 76.7881 }; // Default center coordinates (Ambala, Haryana)
  zoom = 15;
  markers: Marker[] = [];
  currentLocation: Marker | undefined;
  radius: number; // Initial radius in meters

  constructor(private fb: FormBuilder,
    private modalService: NgbModal,
    private attendanceService: AttendanceService,
    private toast: ToastrService,
    private dialog: MatDialog,
    private http: HttpClient
  ) {
    this.regularisationForm = this.fb.group({
      canEmpRegularizeOwnAttendance: [false],
      canSupervisorsRegularizeSubordinatesAttendance: [false],
      canAdminEditRegularizeAttendance: [false],
      isIPrestrictedEmployeeCheckInCheckOut: [false],
      IPDetails: this.fb.array([]),
      shouldWeeklyEmailNotificationToBeSent: [''],
      whoReceiveWeeklyEmailNotification: this.fb.array([]),
      isRestrictLocationForCheckInCheckOutUsingMobile: [false],
      restrictLocationDetails: [],
      howAssignLocationsForEachEmployee: [''],
      enableLocationCaptureFromMobile: [false],
      geoLocationAPIProvider: [''],
      googleAPIKey: [''],
      isFacialFingerprintRecognitionFromMobile: [false],
      attendanceTemplate: ['']
    });

    this.locationForm = this.fb.group({
      attendanceRegularization: [this.regularizationId],
      Location: [''],
      Latitude: [''],
      Longitude: [''],
      Radius: ['']
    })

  }

  ngOnInit() {
    console.log(this.isEdit);

    if (this.isEdit) {
      this.getRegularizationByTemplateId();
      this.getCurrentLocation();

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
      this.regularizationId = data._id
      console.log(data);
      this.attendanceService.getLocation(this.regularizationId).subscribe((res: any) => {
        this.location = res.data;
      })
      const ipDetailsControl = <FormArray>this.regularisationForm.get('IPDetails');
      ipDetailsControl.clear();

      if (data.IPDetails) {
        data.IPDetails.forEach(ipDetail => {
          ipDetailsControl.push(this.fb.group({
            IP: [ipDetail.IP]
          }));
        });
      }
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
    this.regularisationForm.value.restrictLocationDetails = []
    if (!this.isEdit) {
      this.attendanceService.addRegularizations(this.regularisationForm.value).subscribe((res: any) => {
        this.getRegularizations();
        this.toast.success('Attendance Regularization Created', 'Successfully!')
      },
        err => {
          this.toast.error('Attendance Regularization can not be Created', 'Error!')

        });
    }
    else {
      console.log(this.regularisationForm.value);
      this.attendanceService.getRegularizationByTemplateId(templateId).subscribe((res: any) => {
        const data = res.data;
        this.attendanceService.updateRegularizations(data._id, this.regularisationForm.value).subscribe((res: any) => {
          this.toast.success('Attendance Regularization Updated', 'Successfully!')

        },
          err => {
            this.toast.error('Attendance Regularization can not be updated', 'Error!')

          });
      })
    }
  }

  //  map locations
  deleteTemplate(id: string, index: number) {
    this.attendanceService.deleteLocation(id).subscribe((res: any) => {
      this.location.splice(index)
      this.toast.success('Successfully Deleted!!!', 'Attendance Template')
    },
      (err) => {
        this.toast.error('This Attendance Template Can not be deleted'
          , 'Error')
      })
  }

  deleteDialog(id: string, index: number): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'delete') {
        this.deleteTemplate(id, index);
      }
      err => {
        this.toast.error('Can not be Deleted', 'Error!')
      }
    });
  }


  getCurrentLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.center = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          console.log(position)
        },
        () => {
          console.log('Location access denied.');
          this.center = { lat: 22.2736308, lng: 70.7512555 };
        }
      );
    } else {
      console.log('Geolocation is not supported by this browser.');
      this.center = { lat: 22.2736308, lng: 70.7512555 };
    }
  }

  moveMap(event: google.maps.MapMouseEvent) {
    if (event.latLng != null) this.center = (event.latLng.toJSON());
  }

  move(event: google.maps.MapMouseEvent) {
    if (event.latLng != null) this.display = event.latLng.toJSON();
  }

  // closeModal() {
  //   this.closeMap.emit(true);
  // }

  onSubmissionMap() {
    console.log(this.display);
    this.locationForm.value.Latitude = this.display.lat,
      this.locationForm.value.Longitude = this.display.lng,
      this.locationForm.value.attendanceRegularization = this.regularizationId
    console.log(this.locationForm.value)

    this.attendanceService.addLocation(this.locationForm.value).subscribe((res: any) => {
      const newLocation = res.data;
      this.location.push(newLocation);
    })
  }
  
  geolocationSuccess(position: GeolocationPosition) {
    const { latitude, longitude } = position.coords;
    this.center = { lat: latitude, lng: longitude };
    this.currentLocation = { lat: latitude, lng: longitude, label: 'Your Location' };
    this.markers?.push(this.currentLocation);
    console.log(this.markers)
  }

  geolocationError(error: GeolocationPositionError) {
    console.error('Error getting location:', error.message);
  }

  // Call geolocation API to get user's location
  getUserLocation() {
    if (navigator.geolocation) {
      console.log(navigator.geolocation.getCurrentPosition(this.geolocationSuccess.bind(this), this.geolocationError.bind(this)));
      navigator.geolocation.getCurrentPosition(this.geolocationSuccess.bind(this), this.geolocationError.bind(this));
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  }

  // Function to update map center and marker on user interaction (optional)
  handleMapClick(event: google.maps.MapMouseEvent) {
    const newLat = event.latLng.lat();
    const newLng = event.latLng.lng();
    this.center = { lat: newLat, lng: newLng };
    this.currentLocation = { lat: newLat, lng: newLng, label: 'Your Location' };
    console.log(this.currentLocation)
  }
}
