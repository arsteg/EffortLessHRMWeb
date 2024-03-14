import { Component, EventEmitter, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { LeaveService } from 'src/app/_services/leave.service';
import { CommonService } from 'src/app/common/common.service';

@Component({
  selector: 'app-add-application',
  templateUrl: './add-application.component.html',
  styleUrl: './add-application.component.css'
})
export class AddApplicationComponent {
  leaveApplication: FormGroup;
  allAssignee: any;
  bsValue = new Date();
  @Output() close: any = new EventEmitter();
  leaveCategories: any;

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
      isHalfDayOption: [true],
      haldDays:  this.fb.array([])
    });
  }

  ngOnInit() {
    this.commonService.populateUsers().subscribe(result => {
      this.allAssignee = result && result.data && result.data.data;
    });
    this.getleaveCatgeories();
  }

  get haldDaysArray() {
    return this.leaveApplication.get('haldDays') as FormArray;
  }

  getleaveCatgeories() {
    this.leaveService.getAllLeaveCategories().subscribe((res: any) => {
      this.leaveCategories = res.data;
    })
  }

  onSubmission() {
    console.log(this.leaveApplication.value)
  }

  closeModal() {
    this.leaveApplication.reset();
    this.close.emit(true);
  }

}
