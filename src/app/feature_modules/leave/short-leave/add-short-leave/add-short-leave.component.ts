import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { LeaveService } from 'src/app/_services/leave.service';
import { TimeLogService } from 'src/app/_services/timeLogService';
import { CommonService } from 'src/app/_services/common.Service';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

export function duplicateLeaveValidator(existingLeaves: any[]): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }

    const dateControl = control.root.get('date');
    const isDuplicate = existingLeaves.some((leave: any) =>
      leave.employee === control.value &&
      leave.startDate === dateControl?.value
    );

    return isDuplicate ? { duplicateLeave: true } : null;
  };
}

@Component({
  selector: 'app-add-short-leave',
  templateUrl: './add-short-leave.component.html',
  styleUrls: ['./add-short-leave.component.css']
})
export class AddShortLeaveComponent {
  shortLeave: FormGroup;
  allAssignee: any[] = [];
  bsValue = new Date();
  totalTimeInMinutes: number = 0;
  @Output() close = new EventEmitter<boolean>();
  @Output() shortLeaveRefreshed = new EventEmitter<void>();
  members: { id: string; name: string; email: string }[] = [];
  member: any;
  currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  @Input() tab: number = 1;
  portalView = localStorage.getItem('adminView');
  leaveGeneralSettings: any;
  totalRecords: number = 0;
  recordsPerPage: number = 10;
  currentPage: number = 1;
  totalShortLeaveCount: number = 0;
  sameDateShortLeaveCount: number = 0;
  allShortLeave: any[] = [];
  submitButtonDisabled: boolean = false;
  isDuplicateLeave: boolean = false;
  @Input() status: string = '';
  @Input() url: string = '';
  existingLeaves: any[] = [];
  existingShortLeaves: any[] = [];
  userId: string = '';

  constructor(
    private leaveService: LeaveService,
    private toast: ToastrService,
    private fb: FormBuilder,
    private commonService: CommonService,
    private timeLogService: TimeLogService,
    private translate: TranslateService
  ) {
    this.translate.setDefaultLang('en');
    this.shortLeave = this.fb.group({
      employee: ['', this.url === 'short-leave' ? Validators.required : null],
      date: [new Date(), Validators.required],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required],
      durationInMinutes: [{ value: '', disabled: true }],
      comments: [''],
      status: ['Pending'],
      level1Reason: [''],
      level2Reason: ['']
    }, { validators: this.validateForm.bind(this) });

    this.shortLeave.get('startTime')?.valueChanges.subscribe(() => this.calculateTotalTime());
    this.shortLeave.get('endTime')?.valueChanges.subscribe(() => this.calculateTotalTime());
  }

  ngOnInit() {
    this.commonService.populateUsers().subscribe({
      next: (result: any) => {
        this.allAssignee = result?.data?.data || [];
      },
      error: () => {
        this.toast.error(this.translate.instant('leave.errorFetchingUsers'));
      }
    });

    this.populateMembers();

    this.leaveService.getGeneralSettingsByCompany().subscribe({
      next: (result: any) => {
        if (result.status === 'success') {
          this.leaveGeneralSettings = result.data;
        }
      },
      error: () => {
        this.toast.error(this.translate.instant('leave.errorFetchingSettings'));
      }
    });

    ['employee', 'date', 'startTime', 'endTime'].forEach(field => {
      this.shortLeave.get(field)?.valueChanges.pipe(
        distinctUntilChanged(),
        debounceTime(500)
      ).subscribe(() => this.checkForDuplicateLeave());
    });

    this.checkForDuplicateLeave();
  }

  validateForm(group: FormGroup): ValidationErrors | null {
    const startTime = group.get('startTime')?.value;
    const endTime = group.get('endTime')?.value;

    if (startTime && endTime) {
      const start = new Date(startTime);
      const end = new Date(endTime);
      if (start >= end) {
        return { invalidDuration: true };
      }
    }
    return null;
  }

  checkForDuplicateLeave() {
    const employeeId = this.shortLeave.get('employee')?.value || this.userId || this.currentUser.id;
    const date = this.shortLeave.get('date')?.value;
    const startTime = this.shortLeave.get('startTime')?.value;
    const endTime = this.shortLeave.get('endTime')?.value;

    if (!employeeId || !date) {
      return;
    }

    const payload = { skip: '', next: '' };
    this.leaveService.getLeaveApplicationbyUser(payload, employeeId).subscribe({
      next: (res: any) => {
        this.existingLeaves = res.data || [];
        const isExistingLeave = this.existingLeaves.some((leave: any) =>
          leave.employee === employeeId &&
          this.stripTime(new Date(leave.startDate)) === this.stripTime(new Date(date))
        );

        const shortLeavePayload = { skip: '', next: '', status: 'Pending' };
        this.leaveService.getShortLeave(shortLeavePayload).subscribe({
          next: (res: any) => {
            this.existingShortLeaves = res.data || [];
            const isDuplicateShortLeave = this.existingShortLeaves.some((shortLeave: any) => {
              const shortLeaveDate = new Date(this.stripTime(new Date(shortLeave.date))).toLocaleDateString();
              const selectedDate = new Date(this.stripTime(new Date(date))).toLocaleDateString();
              const shortLeaveStartTime = new Date(shortLeave.startTime).toLocaleTimeString();
              const shortLeaveEndTime = new Date(shortLeave.endTime).toLocaleTimeString();
              const selectedStartTime = startTime ? new Date(startTime).toLocaleTimeString() : '';
              const selectedEndTime = endTime ? new Date(endTime).toLocaleTimeString() : '';

              return shortLeave.employee === employeeId &&
                shortLeaveDate === selectedDate &&
                shortLeaveStartTime === selectedStartTime &&
                shortLeaveEndTime === selectedEndTime;
            });

            const errors: ValidationErrors = {};
            if (this.leaveGeneralSettings?.maxDurationForShortLeaveApplicationInMin &&
                this.totalTimeInMinutes > this.leaveGeneralSettings.maxDurationForShortLeaveApplicationInMin) {
              errors['limitExceeded'] = true;
            }
            if (isExistingLeave) {
              errors['duplicateLeave'] = true;
            }
            if (isDuplicateShortLeave) {
              errors['isDuplicateShortLeave'] = true;
            }

            if (Object.keys(errors).length > 0) {
              this.shortLeave.setErrors(errors);
              this.submitButtonDisabled = true;
            } else {
              this.shortLeave.setErrors(null);
              this.submitButtonDisabled = false;
            }
            this.shortLeave.markAsTouched();
          },
          error: () => {
            this.toast.error(this.translate.instant('leave.errorFetchingShortLeaves'));
          }
        });
      },
      error: () => {
        this.toast.error(this.translate.instant('leave.errorFetchingLeaves'));
      }
    });
  }

  getShortLeaveCountForEmployee(userId: string) {
    const requestBody = { skip: '', next: '' };
    const currentYear = new Date().getFullYear();
    this.leaveService.getShortLeaveByUserId(userId, requestBody).subscribe({
      next: (result: any) => {
        if (result.status === 'success') {
          this.sameDateShortLeaveCount = result.data.filter((sl: any) =>
            new Date(sl.date).setUTCHours(0, 0, 0, 0) === new Date().setUTCHours(0, 0, 0, 0)
          ).length;
          this.totalShortLeaveCount = result.data.filter((sl: any) =>
            new Date(sl.date).getFullYear() === currentYear
          ).length;
        }
      },
      error: () => {
        this.toast.error(this.translate.instant('leave.errorFetchingShortLeaveCount'));
      }
    });
  }

  populateMembers() {
    this.members = [];
    this.members.push({
      id: this.currentUser.id,
      name: this.translate.instant('leave.userMe'),
      email: this.currentUser.email
    });
    this.member = this.currentUser;

    this.timeLogService.getTeamMembers(this.member.id).subscribe({
      next: (response: any) => {
        this.timeLogService.getusers(response.data).subscribe({
          next: (result: any) => {
            result.data.forEach((user: any) => {
              if (user.id !== this.currentUser.id) {
                this.members.push({
                  id: user.id,
                  name: `${user.firstName} ${user.lastName}`,
                  email: user.email
                });
              }
            });
          },
          error: () => {
            this.toast.error(this.translate.instant('leave.errorUsersFetch'));
          }
        });
      },
      error: () => {
        this.toast.error(this.translate.instant('leave.errorTeamMembersFetch'));
      }
    });
  }

  calculateTotalTime(): void {
    const startTime = this.shortLeave.get('startTime')?.value;
    const endTime = this.shortLeave.get('endTime')?.value;

    if (startTime && endTime) {
      const start = new Date(startTime);
      const end = new Date(endTime);
      if (start < end) {
        const timeDiffInMs = end.getTime() - start.getTime();
        this.totalTimeInMinutes = Math.round(timeDiffInMs / (1000 * 60));
        this.shortLeave.get('durationInMinutes')?.setValue(this.totalTimeInMinutes);
      } else {
        this.shortLeave.get('durationInMinutes')?.setValue('');
      }
    } else {
      this.shortLeave.get('durationInMinutes')?.setValue('');
    }
  }

  stripTime(date: Date): string {
    date.setUTCHours(0, 0, 0, 0);
    return date.toISOString();
  }

  selectedUsersChanged(userId): void {
    this.userId = userId;
    this.checkForDuplicateLeave();
  }

  onSubmission() {
    if (this.shortLeave.invalid || this.shortLeave.errors) {
      this.shortLeave.markAllAsTouched();
      this.toast.error(this.translate.instant('leave.formInvalidError'));
      return;
    }

    const startTime = new Date(this.shortLeave.get('startTime')?.value);
    const endTime = new Date(this.shortLeave.get('endTime')?.value);

    if (startTime && endTime && startTime < endTime) {
      const timeDiffInMs = endTime.getTime() - startTime.getTime();
      this.totalTimeInMinutes = Math.round(timeDiffInMs / (1000 * 60));
      this.shortLeave.get('durationInMinutes')?.setValue(this.totalTimeInMinutes);
    } else {
      this.shortLeave.get('durationInMinutes')?.setValue('');
    }

    if (this.leaveGeneralSettings?.maxDurationForShortLeaveApplicationInMin &&
        this.totalTimeInMinutes > this.leaveGeneralSettings.maxDurationForShortLeaveApplicationInMin) {
      this.toast.error(this.translate.instant('leave.limitExceededError', {
        maxDuration: this.leaveGeneralSettings.maxDurationForShortLeaveApplicationInMin
      }));
      return;
    }

    if (this.leaveGeneralSettings?.shortLeaveApplicationLimit &&
        this.totalShortLeaveCount >= this.leaveGeneralSettings.shortLeaveApplicationLimit) {
      this.toast.error(this.translate.instant('leave.shortLeaveLimitError'));
      return;
    }

    const payload = {
      employee: this.shortLeave.value.employee,
      date: this.shortLeave.value.date,
      startTime: this.shortLeave.value.startTime,
      endTime: this.shortLeave.value.endTime,
      durationInMinutes: this.shortLeave.get('durationInMinutes')?.value,
      comments: this.shortLeave.value.comments,
      status: 'Pending',
      level1Reason: this.shortLeave.value.level1Reason,
      level2Reason: this.shortLeave.value.level2Reason
    };

    if (this.url === 'my-short-leave') {
      payload.employee = this.currentUser.id;
    } else if (this.url === 'team-short-leave') {
      payload.employee = this.userId;
    }

    this.leaveService.addShortLeave(payload).subscribe({
      next: () => {
        this.toast.success(this.translate.instant('leave.successCreateShortLeave'));
        this.shortLeaveRefreshed.emit();
        this.shortLeave.reset();
        this.closeModal();
      },
      error: () => {
        this.toast.error(this.translate.instant('leave.errorCreateShortLeave'));
      }
    });
  }

  onDateSelected(date: Date): void {
    this.checkForDuplicateLeave();
    const timezoneOffset = date.getTimezoneOffset() * 60000;
    const adjustedDate = new Date(date.getTime() - timezoneOffset);
    const formattedDate = adjustedDate.toISOString().slice(0, 10);
    const startTime = `${formattedDate}T00:00`;
    const endTime = `${formattedDate}T23:59`;
    this.shortLeave.patchValue({
      date: formattedDate,
      startTime,
      endTime
    });
  }

  closeModal() {
    this.shortLeave.reset();
    this.close.emit(true);
  }
}