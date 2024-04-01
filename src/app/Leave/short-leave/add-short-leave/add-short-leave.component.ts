import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { LeaveService } from 'src/app/_services/leave.service';
import { TimeLogService } from 'src/app/_services/timeLogService';
import { CommonService } from 'src/app/common/common.service';

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
  portalView = localStorage.getItem('adminView')


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

    const startTime = new Date(this.shortLeave.get('startTime').value);
    const endTime = new Date(this.shortLeave.get('endTime').value);

    if (startTime && endTime && startTime < endTime) {
      const timeDiffInMs = endTime.getTime() - startTime.getTime();
      this.totalTimeInMinutes = Math.round(timeDiffInMs / (1000 * 60));
      this.shortLeave.get('durationInMinutes').setValue(this.totalTimeInMinutes);
    } else {
      this.shortLeave.get('durationInMinutes').setValue('');
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
