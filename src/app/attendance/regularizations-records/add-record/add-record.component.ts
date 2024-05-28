import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AttendanceService } from 'src/app/_services/attendance.service';

@Component({
  selector: 'app-add-record',
  templateUrl: './add-record.component.html',
  styleUrl: './add-record.component.css'
})
export class AddRecordComponent {
  user = JSON.parse(localStorage.getItem('currentUser'));
  addRegularization: FormGroup;
  @Output() leaveGrantRefreshed: EventEmitter<void> = new EventEmitter<void>();
  bsValue = new Date();
  shift: any;

  constructor(private attendanceService: AttendanceService,
    private fb: FormBuilder
  ) {
    this.addRegularization = this.fb.group({
      regularizationDate: [],
      requestType: [''],
      shift: [''],
      checkInTime: [],
      checkOutTime: [],
      firstApprover: [''],
      firstApproverDate: [],
      firstApproverComment: [''],
      secondApprover: [''],
      secondApproverDate: [],
      secondApproverComment: [''],
      reason: [''],
      isHalfDayRegularization: [true],
      halfDayType: [''],
      comment: [''],
      user: [this.user.id],
      status: ['Pending']
    })
  }

  ngOnInit() {
    this.getShift();
  }
  getShift() {
    this.attendanceService.getShift().subscribe((res: any) => {
      this.shift = res.data;
    })
  }

  onSubmission() {
    console.log(this.addRegularization.value);
    this.addRegularization.value.firstApprover = null,
      this.addRegularization.value.firstApproverDate = null,
      this.addRegularization.value.firstApproverComment = null,
      this.addRegularization.value.secondApprover = null,
      this.addRegularization.value.secondApproverDate = null,
      this.addRegularization.value.secondApproverComment = null,
      this.attendanceService.addRegularization(this.addRegularization.value).subscribe((res: any) => {
        this.leaveGrantRefreshed.emit();
      })
  }
}
