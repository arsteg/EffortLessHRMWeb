import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { LeaveService } from 'src/app/_services/leave.service';
import { TimeLogService } from 'src/app/_services/timeLogService';
import { CommonService } from 'src/app/_services/common.Service';

@Component({
  selector: 'app-add-short-leave',
  templateUrl: './add-short-leave.component.html',
  styleUrl: './add-short-leave.component.css'
})
export class AddShortLeaveComponent {
  shortLeave: FormGroup;
  allAssignee: any;
  bsValue = new Date();
  totalTimeInMinutes: number;
  @Output() close: any = new EventEmitter();
  @Output() shortLeaveRefreshed: EventEmitter<void> = new EventEmitter<void>();
  members: any[] = [];
  member: any;
  currentUser = JSON.parse(localStorage.getItem('currentUser'));
  @Input() tab: number;
  portalView = localStorage.getItem('adminView');
  leaveGeneralSettings: any;
  totalRecords: number = 0 // example total records
  recordsPerPage: number = 10;
  currentPage: number = 1;
  totalShortLeaveCount: number = 0;
  sameDateShortLeaveCount: number = 0;


  constructor(private leaveService: LeaveService,
    private toast: ToastrService,
    private fb: FormBuilder,
    private commonService: CommonService,
    private timeLogService: TimeLogService) {
    this.shortLeave = this.fb.group({
      employee: [''],
      date: [],
      startTime: [],
      endTime: [],
      durationInMinutes: [{ value: '', disabled: true }],
      comments: [''],
      status: [''],
      level1Reason: [''],
      level2Reason: ['']
    });
    this.shortLeave.get('startTime').valueChanges.subscribe(() => this.calculateTotalTime());
    this.shortLeave.get('endTime').valueChanges.subscribe(() => this.calculateTotalTime());
  }

  ngOnInit() {
    this.commonService.populateUsers().subscribe(result => {
      this.allAssignee = result && result.data && result.data.data;
    });
    this.populateMembers();

    this.leaveService.getGeneralSettingsByCompany().subscribe(result => {
      if(result.status =='success'){
        this.leaveGeneralSettings = result.data;
      }
    });

    this.shortLeave.get('employee').valueChanges.subscribe(employee => {
      this.getShortLeaveCountForEmployee(employee);
    });
  }

  getShortLeaveCountForEmployee(userId: any){
    const requestBody = {
      "skip": "0",
      "next": "1000" };
    const currentYear = new Date().getFullYear();
    this.leaveService.getShortLeaveByUserId(userId, requestBody).subscribe(result => {
      if(result.status =='success'){
        this.sameDateShortLeaveCount = result.data.filter((sl: any) => new Date(sl.date).setUTCHours(0, 0, 0, 0) === new Date().setUTCHours(0, 0, 0, 0)).length;
        this.totalShortLeaveCount = result.data.filter((sl: any) => new Date(sl.date).getFullYear() === currentYear).length;
      }
    });
  }

  populateMembers() {
    this.members = [];
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.members.push({ id: currentUser.id, name: "Me", email: currentUser.email });
    this.member = currentUser;
    this.timeLogService.getTeamMembers(this.member.id).subscribe({
      next: response => {
        this.timeLogService.getusers(response.data).subscribe({
          next: result => {
            result.data.forEach(user => {
              if (user.id != currentUser.id) {
                this.members.push({ id: user.id, name: `${user.firstName} ${user.lastName}`, email: user.email });
              }
            })
          },
          error: error => {
            console.log('There was an error!', error);
          }
        });
      },
      error: error => {
        console.log('There was an error!', error);
      }
    });
  }

  calculateTotalTime(): void {
    const startTime = new Date(this.shortLeave.get('startTime').value);
    const endTime = new Date(this.shortLeave.get('endTime').value);

    if (startTime && endTime && startTime < endTime) {
      const timeDiffInMs = endTime.getTime() - startTime.getTime();
      this.totalTimeInMinutes = Math.round(timeDiffInMs / (1000 * 60));
      this.shortLeave.get('durationInMinutes').setValue(this.totalTimeInMinutes);
    } else {
      this.shortLeave.get('durationInMinutes').setValue('');
    }
  }

  onSubmission() {
    if(this.shortLeave.invalid){
      this.toast.error('Please enter valid data');
    }

    const startTime = new Date(this.shortLeave.get('startTime').value);
    const endTime = new Date(this.shortLeave.get('endTime').value);

    if (startTime && endTime && startTime < endTime) {
      const timeDiffInMs = endTime.getTime() - startTime.getTime();
      this.totalTimeInMinutes = Math.round(timeDiffInMs / (1000 * 60));
      this.shortLeave.get('durationInMinutes').setValue(this.totalTimeInMinutes);
    } else {
      this.shortLeave.get('durationInMinutes').setValue('');
    }

    if(this.sameDateShortLeaveCount > 0){
      this.toast.error('You cannot apply for more than one short leave for the same day');
      return;
    }

    if(this.leaveGeneralSettings.maxDurationForShortLeaveApplicationInMin && this.totalTimeInMinutes > this.leaveGeneralSettings.maxDurationForShortLeaveApplicationInMin){
      this.toast.error('You cannot apply for more than '+ this.leaveGeneralSettings.maxDurationForShortLeaveApplicationInMin +' minutes of short leave');
      return;
    }

    if(this.leaveGeneralSettings.shortLeaveApplicationLimit && this.totalShortLeaveCount >= this.leaveGeneralSettings.shortLeaveApplicationLimit){
      this.toast.error('You have reached the limit of short leave application');
      return;
    }

    let payload = {
      employee: this.shortLeave.value.employee,
      date: this.shortLeave.value.date,
      startTime: this.shortLeave.value.startTime,
      endTime: this.shortLeave.value.endTime,
      durationInMinutes: this.shortLeave.get('durationInMinutes').value,
      comments: this.shortLeave.value.comments,
      status: 'Pending',
      level1Reason: this.shortLeave.value.level1Reason,
      level2Reason: this.shortLeave.value.level2Reason
    }
    console.log(payload)
    this.leaveService.addShortLeave(payload).subscribe((res: any) => {
      console.log(res.data);
      this.shortLeaveRefreshed.emit();
      this.closeModal();
    })
  }

  onDateSelected(date: Date): void {
    const timezoneOffset = date.getTimezoneOffset() * 60000;
    const adjustedDate = new Date(date.getTime() - timezoneOffset);
    const formattedDate = adjustedDate.toISOString().slice(0, 10);
    const startTime = formattedDate + 'T00:00';
    const endTime = formattedDate + 'T23:59';
    this.shortLeave.patchValue({
      date: formattedDate,
      startTime: startTime,
      endTime: endTime
    });
  }

  closeModal() {
    this.shortLeave.reset();
    this.close.emit(true);
  }
}
