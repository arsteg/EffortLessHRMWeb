import { Component, Output, EventEmitter, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LeaveService } from 'src/app/_services/leave.service';
import { TimeLogService } from 'src/app/_services/timeLogService';
import { CommonService } from 'src/app/_services/common.Service';

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


  constructor(private commonService: CommonService,
    private fb: FormBuilder,
    private leaveService: LeaveService,
    private timeLogService: TimeLogService) {
    this.leaveGrant = this.fb.group({
      users: [[], Validators.required],
      status: [''],
      level1Reason: [''],
      level2Reason: [''],
      date: ['', Validators.required],
      comment: ['']
    })
  }

  ngOnInit() {
    this.commonService.populateUsers().subscribe((res: any) => {
      this.allAssignee = res.data.data;
    });
    this.populateMembers();
  }

  closeModal() {
    this.changeStep.emit(1);
    this.leaveGrant.reset();
    this.close.emit(true);
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
  onMemberSelectionChange(member: any) {
    this.member = JSON.parse(member.value);
  }

  onSubmission() {
    let payload = {
      date: this.leaveGrant.value.date,
      status: 'Pending',
      comment: this.leaveGrant.value.comment,
      users: this.leaveGrant.value.users.map(user => ({ user: user }))
    }
    if (this.portalView == 'user') {
      if (this.tab === 4) {
        payload.users = this.currentUser?.id;
      } else if (this.tab === 7) {
        payload.users = this.member?.id;
      }
    }
    this.leaveService.addLeaveGrant(payload).subscribe((res: any) => {
      this.leaveGrantRefreshed.emit();
    })
  }
}
