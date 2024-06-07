import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
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
  reason: any;

  constructor(private attendanceService: AttendanceService,
    private fb: FormBuilder,
    private toast: ToastrService
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
    this.getregularizationReason();
  }
  getShift() {
    this.attendanceService.getShift().subscribe((res: any) => {
      this.shift = res.data;
    })
  }
  getregularizationReason() {
    this.attendanceService.getRegularizationReason().subscribe((res: any) => {
      this.reason = res.data;
    })
  }
  onSubmission() {
    this.addRegularization.value.firstApprover = null,
      this.addRegularization.value.firstApproverDate = null,
      this.addRegularization.value.firstApproverComment = null,
      this.addRegularization.value.secondApprover = null,
      this.addRegularization.value.secondApproverDate = null,
      this.addRegularization.value.secondApproverComment = null,
      this.attendanceService.addRegularization(this.addRegularization.value).subscribe((res: any) => {
        this.leaveGrantRefreshed.emit();
        this.addRegularization.reset();
        this.toast.success('Successfully Created!!!', 'Regularization Request');

      }, (err) => {
        this.toast.error('This Regularization Request Can not be Created', 'Error')
      })
  }
}
