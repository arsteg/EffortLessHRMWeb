import { Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LeaveService } from 'src/app/_services/leave.service';
import { CommonService } from 'src/app/common/common.service';
import * as moment from 'moment';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { AuthenticationService } from 'src/app/_services/authentication.service';
import { TimeLogService } from 'src/app/_services/timeLogService';


@Component({
  selector: 'app-add-application',
  templateUrl: './add-application.component.html',
  styleUrl: './add-application.component.css',
  encapsulation: ViewEncapsulation.None,
})
export class AddApplicationComponent {
  leaveApplication: FormGroup;
  allAssignee: any;
  bsValue = new Date();
  @Output() close: any = new EventEmitter();
  leaveCategories: any;
  fieldGroup: FormGroup;
  selectedDates: Date[] = [];
  @Output() leaveApplicationRefreshed: EventEmitter<void> = new EventEmitter<void>();
  portalView = localStorage.getItem('adminView');
  currentUser = JSON.parse(localStorage.getItem('currentUser'));
  members: any[] = [];
  member: any;
  @Input() tab: number;
  defaultCatSkip="0";
  defaultCatNext="100000";

  constructor(private fb: FormBuilder,
    private commonService: CommonService,
    private leaveService: LeaveService,
    private timeLogService: TimeLogService
  ) {
    this.leaveApplication = this.fb.group({
      employee: ['', Validators.required],
      leaveCategory: ['', Validators.required],
      level1Reason: [''],
      level2Reason: [''],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      comment: [''],
      status: [''],
      isHalfDayOption: [false],
      haldDays: this.fb.array([])
    });
  }

  ngOnInit() {
    this.commonService.populateUsers().subscribe(result => {
      this.allAssignee = result && result.data && result.data.data;
    });
    this.getleaveCatgeories();
    this.populateMembers();
  }

  addHalfDayEntry() {
    this.haldDays.push(this.fb.group({
      date: [''],
      dayHalf: ['']
    }));
  }

  get haldDays() {
    return this.leaveApplication.get('haldDays') as FormArray;
  }

  getleaveCatgeories() {
    const requestBody = { "skip": this.defaultCatSkip, "next": this.defaultCatNext };
    this.leaveService.getAllLeaveCategories(requestBody).subscribe((res: any) => {
      this.leaveCategories = res.data;
    })
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
    if (this.leaveApplication.value) {
      if (this.portalView == 'user') {
        if (this.tab === 1) {
          this.leaveApplication.value.employee = this.currentUser?.id;
        } else if (this.tab === 5) {
          this.leaveApplication.value.employee = this.member?.id;
        }
      }
     
      this.leaveApplication.value.status = 'Pending';

      console.log(this.leaveApplication.value);

      this.leaveService.addLeaveApplication(this.leaveApplication.value).subscribe((res: any) => {
        this.closeModal();
        this.leaveApplicationRefreshed.emit();
      });

    }
  }

  closeModal() {
    this.leaveApplication.reset();
    this.close.emit(true);
  }
  // multiple date selection code

  addEvent(type: string, event: MatDatepickerInputEvent<Date>) {
    const selectedDate = event.value;
    if (selectedDate && !this.selectedDates.find(date => date.getTime() === selectedDate.getTime())) {
      this.selectedDates.push(selectedDate);
    }
  }

}