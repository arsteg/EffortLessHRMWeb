import { Component, EventEmitter, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AttendanceService } from 'src/app/_services/attendance.service';
import * as moment from 'moment';
import { CommonService } from 'src/app/common/common.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-add-on-duty',
  templateUrl: './add-on-duty.component.html',
  styleUrl: './add-on-duty.component.css'
})
export class AddOnDutyComponent {
  p: number = 1;
  onDutyShiftForm: FormGroup;
  bsValue = new Date();
  user = JSON.parse(localStorage.getItem('currentUser'));
  portalView = localStorage.getItem('adminView');
  shift: any;
  allAssignee: any;
  onDutyReason: any;
  @Output() requestRefreshed: EventEmitter<void> = new EventEmitter<void>();

  constructor(private fb: FormBuilder,
    private attendanceService: AttendanceService,
    private commonService: CommonService,
    private toast: ToastrService
  ) {
    this.onDutyShiftForm = this.fb.group({
      user: ['', Validators.required],
      onDutyReason: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      comment: ['', Validators.required],
      status: ['Pending'],
      primaryApprovar: [null],
      primaryApprovarComment: [''],
      secondaryApprovar: [null],
      secondaryApprovarComment: [''],
      onDutyShift: this.fb.array([])
    })
  }

  ngOnInit() {
    if (this.portalView == 'user') { this.getShiftByUser(); }
    this.getDutyReason();
    this.onDutyShiftForm.get('startDate').valueChanges.subscribe(() => this.populateShifts());
    this.onDutyShiftForm.get('endDate').valueChanges.subscribe(() => this.populateShifts());
    this.commonService.populateUsers().subscribe(result => {
      this.allAssignee = result && result.data && result.data.data;
    });
  }

  get onDutyShiftControls() {
    return (this.onDutyShiftForm.get('onDutyShift') as FormArray).controls;
  }

  generateDateRange(start: string, end: string) {
    const startDate = moment(start);
    const endDate = moment(end);
    const dateArray = [];

    while (startDate <= endDate) {
      dateArray.push(startDate.format('YYYY-MM-DD'));
      startDate.add(1, 'days');
    }

    return dateArray;
  }

  populateShifts() {
    const startDate = this.onDutyShiftForm.get('startDate').value;
    const endDate = this.onDutyShiftForm.get('endDate').value;

    if (startDate && endDate) {
      const dateArray = this.generateDateRange(startDate, endDate);
      const onDutyShift = this.onDutyShiftForm.get('onDutyShift') as FormArray;
      onDutyShift.clear();

      dateArray.forEach(date => {
        const shiftGroup = this.fb.group({
          date: [date, Validators.required],
          shift: [this.shift?._id, Validators.required],
          shiftDuration: ['', Validators.required],
          startTime: ['', Validators.required],
          endTime: ['', Validators.required],
          remarks: ['', Validators.required]
        });

        // Pre-fill startTime and endTime based on shiftDuration
        shiftGroup.get('shiftDuration').valueChanges.subscribe(shiftDuration => {
          if (shiftDuration === 'full-day') {
            shiftGroup.patchValue({
              startTime: this.shift?.startTime,
              endTime: this.shift?.endTime
            });
          } else if (shiftDuration === 'first-half') {
            const time = this.shift?.startTime;
            const firstHalfDuration = this.shift?.firstHalfDuration;

            const startTime = moment(time, 'HH:mm'); 
            const endTime = moment(startTime).add(firstHalfDuration, 'hours');

            shiftGroup.patchValue({
              startTime: startTime.format('HH:mm'),
              endTime: endTime.format('HH:mm')
            });
          }
          else if (shiftDuration === 'second-half') {
            const time = this.shift?.startTime;
            const secondHalfDuration = this.shift?.secondHalfDuration;

            const startTime = moment(time, 'HH:mm').add(secondHalfDuration, 'hours');
            const endTime = moment(startTime).add(secondHalfDuration, 'hours');
            shiftGroup.patchValue({
              startTime: startTime.format('HH:mm'),
              endTime: endTime.format('HH:mm')
            });
          }
          else {
            shiftGroup.patchValue({
              startTime: '',
              endTime: ''
            });
          }
        });

        onDutyShift.push(shiftGroup);
      });
    }
  }


  onEmployeeSelected() {
    this.getShiftByUser();
  }

  getShiftByUser() {
    if (this.portalView == 'admin') {
      this.attendanceService.getShiftByUser(this.onDutyShiftForm.value.user).subscribe((res: any) => {
        if (res.status === "failure" || !res.data || res.data.length === 0 || res.data == null) {
          this.toast.error('Shift is not assigned to the selected employee', 'Error');
        } else {
          this.shift = res.data;
        }
      }, (error) => {
        this.toast.error('Failed to fetch advance category. Please try again later.', 'Error');
      });
    }
    else {
      this.attendanceService.getShiftByUser(this.user.id).subscribe((res: any) => {
        this.shift = res.data;
      })
    }
  }


  getDutyReason() {
    // this.attendanceService.getDutyReason().subscribe((res: any) => {
    //   this.onDutyReason = res.data;
    // })
  }

  onSubmission() {
    if (this.portalView === 'user') {
      this.onDutyShiftForm.value.user = this.user.id
    }
    this.attendanceService.addOnDutyRequest(this.onDutyShiftForm.value).subscribe((res: any) => {
      this.requestRefreshed.emit();
      this.onDutyShiftForm.reset();
      this.toast.success('OnDuty Request Created', 'Successfully!');
    })
  }

}