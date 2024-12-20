import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { LeaveService } from 'src/app/_services/leave.service';
import { TimeLogService } from 'src/app/_services/timeLogService';
import { CommonService } from 'src/app/_services/common.Service';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
export function duplicateLeaveValidator(existingLeaves: any[]): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }

    // Example logic to check for duplicates
    const isDuplicate = existingLeaves.some((leave: any) =>
      leave.employee === control.value &&
      // Assuming leave.startDate is the date you want to compare
      leave.startDate === control.root.get('date').value
    );

    return isDuplicate ? { duplicateLeave: true } : null;
  };
}

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
  allShortLeave: any;
  submitButtonDisabled: any;
  isDuplicateLeave: any;
  @Input() status: string;
  @Input() url: string;
  existingLeaves: any[] = [];
  existingShortLeaves: any[] = [];

  constructor(private leaveService: LeaveService,
    private toast: ToastrService,
    private fb: FormBuilder,
    private commonService: CommonService,
    private timeLogService: TimeLogService,
  ) {
    this.shortLeave = this.fb.group({
      employee: ['', Validators.required],
      date: [new Date, Validators.required],
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
      if (result.status == 'success') {
        this.leaveGeneralSettings = result.data;
      }
    });

    // Trigger check for duplicate leave whenever employee or date changes
    this.shortLeave.get('employee').valueChanges.pipe(distinctUntilChanged(), debounceTime(500)).subscribe(() => {
      this.checkForDuplicateLeave();
    });

    this.shortLeave.get('date').valueChanges.pipe(distinctUntilChanged(), debounceTime(500)).subscribe(() => {
      this.checkForDuplicateLeave();
    });

    this.shortLeave.get('startTime').valueChanges.pipe(distinctUntilChanged(), debounceTime(500)).subscribe(() => {
      this.checkForDuplicateLeave();
    });

    this.shortLeave.get('endTime').valueChanges.pipe(distinctUntilChanged(), debounceTime(500)).subscribe(() => {
      this.checkForDuplicateLeave();
    });
    this.checkForDuplicateLeave();
  }


  checkForDuplicateLeave() {
    const employeeId = this.shortLeave.get('employee')?.value || this.userId || this.currentUser.id;
    const date = this.shortLeave.get('date')?.value;
    const startTime = this.shortLeave.get('startTime')?.value;
    const endTime = this.shortLeave.get('endTime')?.value;

    if (!employeeId || !date) {
      return;
    }

    let payload = { skip: '', next: '' };
    this.leaveService.getLeaveApplicationbyUser(payload, employeeId).subscribe((res: any) => {
      this.existingLeaves = res.data;
      const isExistingLeave = this.existingLeaves.some((leave: any) =>
        leave.employee === employeeId &&
        this.stripTime(new Date(leave.startDate)) === this.stripTime(new Date(date))
      );

      let shortLeavePyaload = { skip: '', next: '', status: 'Pending' };
      this.leaveService.getShortLeave(shortLeavePyaload).subscribe((res: any) => {
        this.existingShortLeaves = res.data;

        const isDuplicateShortLeave = this.existingShortLeaves.some((shortLeave: any) => {
          const shortLeaveDate = new Date(this.stripTime(new Date(shortLeave.date))).toLocaleDateString();
          const selectedDate = new Date(this.stripTime(new Date(date))).toLocaleDateString();

          const shortLeaveStartTime = new Date(shortLeave.startTime).toLocaleTimeString();
          const shortLeaveEndTime = new Date(shortLeave.endTime).toLocaleTimeString();

          const selectedStartTime = new Date(startTime).toLocaleTimeString();
          const selectedEndTime = new Date(endTime).toLocaleTimeString();

          return shortLeave.employee === employeeId &&
            shortLeaveDate === selectedDate &&
            shortLeaveStartTime === selectedStartTime &&
            shortLeaveEndTime === selectedEndTime;
        });

        if (
          (this.leaveGeneralSettings.maxDurationForShortLeaveApplicationInMin && this.totalTimeInMinutes > this.leaveGeneralSettings.maxDurationForShortLeaveApplicationInMin) ||
          isExistingLeave ||
          isDuplicateShortLeave
        ) {
          if (this.leaveGeneralSettings.maxDurationForShortLeaveApplicationInMin && this.totalTimeInMinutes > this.leaveGeneralSettings.maxDurationForShortLeaveApplicationInMin) {
            this.shortLeave.setErrors({ limitExceeded: true });
          }
          if (isExistingLeave) {
            this.shortLeave.setErrors({ duplicateLeave: true });
          }
          if (isDuplicateShortLeave) {
            this.shortLeave.setErrors({ isDuplicateShortLeave: true });
          }
          this.shortLeave.markAsTouched();
          this.submitButtonDisabled = true;
        } else {
          this.shortLeave.setErrors(null);
          this.submitButtonDisabled = false;
        }
      });
    });
  }
  getShortLeaveCountForEmployee(userId: any) {
    const requestBody = {
      skip: '',
      next: ''
    };
    const currentYear = new Date().getFullYear();
    this.leaveService.getShortLeaveByUserId(userId, requestBody).subscribe(result => {
      if (result.status == 'success') {
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

 
  stripTime(date: Date): string {
    date.setUTCHours(0, 0, 0, 0);
    return date.toISOString();
  }
  userId: string;
  selectedUsersChanged($event: string): void {
    this.userId = $event;
    this.checkForDuplicateLeave();
  }

  onSubmission() {
    if (this.shortLeave.invalid) {
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



    if (this.leaveGeneralSettings.maxDurationForShortLeaveApplicationInMin && this.totalTimeInMinutes > this.leaveGeneralSettings.maxDurationForShortLeaveApplicationInMin) {
      this.toast.error('You cannot apply for more than ' + this.leaveGeneralSettings.maxDurationForShortLeaveApplicationInMin + ' minutes of short leave');
      return;
    }

    if (this.leaveGeneralSettings.shortLeaveApplicationLimit && this.totalShortLeaveCount >= this.leaveGeneralSettings.shortLeaveApplicationLimit) {
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
    this.toast.success('Short leave application submitted successfully');
    if (this.url == 'my-short-leave') {
      payload.employee = this.currentUser.id
    }
    if (this.url == 'team-short-leave') {
      payload.employee = this.userId
    }
    if (this.shortLeave.valid) {
      this.leaveService.addShortLeave(payload).subscribe((res: any) => {
        this.shortLeaveRefreshed.emit();
        this.shortLeave.reset();
      })
    }
  }

  onDateSelected(date: Date): void {
    this.checkForDuplicateLeave();
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
