import { Component, Output, EventEmitter, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LeaveService } from 'src/app/_services/leave.service';
import { TimeLogService } from 'src/app/_services/timeLogService';
import { CommonService } from 'src/app/_services/common.Service';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-add-leave',
  templateUrl: './add-leave.component.html',
  styleUrl: './add-leave.component.css'
})
export class AddLeaveComponent {
  @Output() changeStep: any = new EventEmitter();
  @Output() close: any = new EventEmitter();
  allAssignee: any = [];
  leaveGrant: FormGroup;
  bsValue = new Date();
  @Output() leaveGrantRefreshed: EventEmitter<void> = new EventEmitter<void>();
  @Input() tab: number;
  portalView = localStorage.getItem('adminView');
  currentUser = JSON.parse(localStorage.getItem('currentUser'));
  members: any[] = [];
  member: any;
  tabIndex = parseInt(localStorage.getItem('selectedTab'));

  constructor(
    private commonService: CommonService,
    private fb: FormBuilder,
    private leaveService: LeaveService,
    private timeLogService: TimeLogService,
    private toast: ToastrService,
    private translate: TranslateService
  ) {
    this.translate.setDefaultLang('en');
    this.leaveGrant = this.fb.group({
      users: [[], Validators.required],
      status: [''],
      level1Reason: [''],
      level2Reason: [''],
      date: ['', Validators.required],
      comment: ['']
    });
  }

  ngOnInit() {
    this.populateMembers();
  }

  closeModal() {
    this.changeStep.emit(1);
    this.leaveGrant.reset();
    this.close.emit(true);
  }

  populateMembers() {
    if (this.portalView === 'user' && this.tabIndex === 7) {
      this.members = [];
      let currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      this.members.push({ id: currentUser.id, name: this.translate.instant('leave.userMe'), email: currentUser.email });
      this.timeLogService.getTeamMembers(currentUser.id).subscribe((res: any) => {
        this.members = res.data;
      },
        error => {
          this.toast.error(this.translate.instant('leave.errorFetchingTeamMembers'));
        });
    };
    if (this.portalView === 'admin') {
      this.commonService.populateUsers().subscribe((res: any) => {
        this.allAssignee = res.data.data;
      })
    }
  }

  onMemberSelectionChange(member: any) {
    this.member = JSON.parse(member.value);
  }

  onSubmission() {
    const today = new Date();
    const leaveDate = new Date(this.leaveGrant.value.date);

    if (leaveDate > today) {
      this.toast.error(this.translate.instant('leave.futureDateError'));
      return;
    }

    let payload = {
      date: this.leaveGrant.value.date,
      status: 'Pending',
      comment: this.leaveGrant.value.comment,
      users: this.leaveGrant.value.users
    };

    if (this.portalView === 'user' && this.tabIndex === 3) {
      payload.users = [this.currentUser?.id];
    }

    if (!this.leaveGrant.valid) {
      this.leaveGrant.markAllAsTouched();
    }
    else {
      this.leaveService.addLeaveGrant(payload).subscribe((res: any) => {
        this.leaveGrantRefreshed.emit();
        this.leaveGrant.reset();
        console.log(res.message)
        this.toast.success(res.message || this.translate.instant('leave.leaveCreatedSuccessfully'));
        this.close.emit(true);
      },
        error => {
          this.toast.error(error || this.translate.instant('leave.leaveCreationFailed'));
        });
    }
  }
}