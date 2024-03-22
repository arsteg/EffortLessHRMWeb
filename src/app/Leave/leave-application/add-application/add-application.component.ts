import { Component, EventEmitter, Output, ViewEncapsulation } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LeaveService } from 'src/app/_services/leave.service';
import { CommonService } from 'src/app/common/common.service';
import * as moment from 'moment';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';


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


  constructor(private fb: FormBuilder,
    private commonService: CommonService,
    private leaveService: LeaveService) {
    this.leaveApplication = this.fb.group({
      employee: [''],
      leaveCategory: [''],
      level1Reason: [''],
      level2Reason: [''],
      startDate: [],
      endDate: [],
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
    this.leaveService.getAllLeaveCategories().subscribe((res: any) => {
      this.leaveCategories = res.data;
    })
  }

  onSubmission() {
    console.log(this.leaveApplication.value)
    if (this.leaveApplication.value) {
      
      this.leaveApplication.value.status = 'Pending'
      this.leaveService.addLeaveApplication(this.leaveApplication.value).subscribe((res: any)=>{
        this.leaveApplication.reset();
       this.leaveApplicationRefreshed.emit();
      })
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