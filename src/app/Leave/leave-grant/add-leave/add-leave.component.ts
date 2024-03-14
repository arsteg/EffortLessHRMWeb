import { Component, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { LeaveService } from 'src/app/_services/leave.service';
import { CommonService } from 'src/app/common/common.service';

@Component({
  selector: 'app-add-leave',
  templateUrl: './add-leave.component.html',
  styleUrl: './add-leave.component.css'
})
export class AddLeaveComponent {
  @Output() changeStep: any = new EventEmitter();
  @Output() close: any = new EventEmitter();
  members: any = [];
  leaveGrant: FormGroup;
  bsValue = new Date();
  @Output() leaveGrantRefreshed: EventEmitter<void> = new EventEmitter<void>();

  constructor(private commonService: CommonService,
    private fb: FormBuilder,
    private leaveService: LeaveService) {
    this.leaveGrant = this.fb.group({
      users: [[]],
      status: [''],
      level1Reason: [''],
      level2Reason: [''],
      date: [''],
      comment: ['']
    })
  }

  ngOnInit() {
    this.commonService.populateUsers().subscribe((res: any) => {
      this.members = res.data.data;
    });
  }

  closeModal() {
    this.changeStep.emit(1);
    this.leaveGrant.reset();
    this.close.emit(true);
  }

  onSubmission() {
    let payload = {
      date: this.leaveGrant.value.date,
      status: 'Pending',
      comment: this.leaveGrant.value.comment,
      users: this.leaveGrant.value.users.map(user => ({ user: user }))
    }
    this.leaveService.addLeaveGrant(payload).subscribe((res: any) => {
      this.leaveGrantRefreshed.emit();
    })
  }
}
