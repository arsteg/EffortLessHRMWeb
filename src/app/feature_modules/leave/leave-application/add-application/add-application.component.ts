import { Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LeaveService } from 'src/app/_services/leave.service';
import { CommonService } from 'src/app/_services/common.Service';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { TimeLogService } from 'src/app/_services/timeLogService';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { ToastrService } from 'ngx-toastr';
import { HolidaysService } from 'src/app/_services/holidays.service';
import * as moment from 'moment';
import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';

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
  selectedDates: Date[] = [];
  @Output() leaveApplicationRefreshed: EventEmitter<void> = new EventEmitter<void>();
  portalView = localStorage.getItem('adminView');
  currentUser = JSON.parse(localStorage.getItem('currentUser'));
  members: any[] = [];
  member: any;
  @Input() tab: number;
  tempLeaveCategory: any;
  totalLeaveApplied: number = 0;
  weekOffCount: number = 0;
  dayCounts = {};
  numberOfLeaveAppliedForSelectedCategory: number = 0;
  appliedLeave: any;
  holidayCount: number;
  leaveDocumentUpload: boolean = false;
  selectedFiles: File[] = [];
  bsConfig = {
    dateInputFormat: 'DD-MM-YYYY',
    showWeekNumbers: false
  };
  today: Date = new Date();
  showHalfDayOption: boolean = true;
  checkStatus: any;
  existingLeaves: any[] = [];

  constructor(private fb: FormBuilder,
    private commonService: CommonService,
    private leaveService: LeaveService,
    private timeLogService: TimeLogService,
    private toast: ToastrService,
    private holidayService: HolidaysService,
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
      halfDays: this.fb.array([]),
      leaveApplicationAttachments: this.fb.array([])

    }, { validators: this.dateValidator });
  }

  dateValidator(group: AbstractControl) {
    const startDate = group.get('startDate')?.value;
    const endDate = group.get('endDate')?.value;

    if (startDate && endDate && moment(startDate).isAfter(moment(endDate))) {
      group.get('endDate')?.setErrors({ dateRangeError: true });
    }
    return null;
  }

  ngOnInit() {
    forkJoin({
      users: this.commonService.populateUsers(),
      leaveCategories: this.getleaveCatgeoriesByUser()
    }).subscribe(({ users, leaveCategories }) => {
      this.allAssignee = users && users.data && users.data.data;
      this.leaveCategories = leaveCategories;
    });

    this.populateMembers();

    this.leaveApplication.get('leaveCategory').valueChanges.subscribe(leaveCategory => {
      this.tempLeaveCategory = this.leaveCategories.find(l => l.leaveCategory._id === leaveCategory);
      this.leaveDocumentUpload = this.tempLeaveCategory?.leaveCategory;
      this.handleLeaveCategoryChange();
    });

    this.leaveApplication.get('employee').valueChanges.subscribe(employee => {
      this.leaveService.getLeaveCategoriesByUserv1(employee).subscribe((res: any) => {
        this.leaveCategories = res.data;
        this.checkStatus = res.status;
      });
    });

    if (this.currentUser.id) {
      this.leaveService.getLeaveCategoriesByUserv1(this.currentUser.id).subscribe((res: any) => {
        this.leaveCategories = res.data;
        this.checkStatus = res.status;
      });
    }

    this.getattendanceTemplatesByUser();

    this.leaveApplication.get('employee')?.valueChanges.subscribe(() => this.checkForDuplicateLeave());
    this.leaveApplication.get('leaveCategory')?.valueChanges.subscribe(() => this.checkForDuplicateLeave());
    this.leaveApplication.get('startDate')?.valueChanges.subscribe(() => this.checkForDuplicateLeave());
    this.leaveApplication.get('endDate')?.valueChanges.subscribe(() => this.checkForDuplicateLeave());
  }

  ngOnChanges() {
    this.handleLeaveCategoryChange();
  }

  checkForDuplicateLeave() {
    const employeeId = this.leaveApplication.get('employee')?.value;
    const leaveCategory = this.leaveApplication.get('leaveCategory')?.value;
    const startDate = this.leaveApplication.get('startDate')?.value;
    const endDate = this.leaveApplication.get('endDate')?.value;

    if (!employeeId || !leaveCategory || !startDate || !endDate) {
      return;
    }

    let payload = { skip: '', next: '' };
    this.leaveService.getLeaveApplicationbyUser(payload, employeeId).subscribe((res: any) => {
      this.existingLeaves = res.data;
      const formattedStartDate = this.stripTime(new Date(startDate));
      const formattedEndDate = this.stripTime(new Date(endDate));

      const isOverlappingLeave = this.existingLeaves.some((leave: any) => {
        const leaveStartDate = this.stripTime(new Date(leave.startDate));
        const leaveEndDate = this.stripTime(new Date(leave.endDate));
        return leave.employee === employeeId &&
          leave.leaveCategory === leaveCategory &&
          (formattedStartDate <= leaveEndDate && formattedEndDate >= leaveStartDate);
      });

      if (isOverlappingLeave) {
        this.leaveApplication.setErrors({ duplicateLeave: true });
        this.showHalfDayOption = false;
      } else {
        this.leaveApplication.setErrors(null);
        this.showHalfDayOption = true;
      }
    });
  }

  handleLeaveCategoryChange() {
    if (!this.tempLeaveCategory || !this.tab) {
      return;
    }

    if (this.portalView == 'user') {
      if (this.tab === 1 || this.tab === 5) {
        if (!this.leaveApplication.get('employee')?.value) {
          this.leaveApplication.patchValue({ employee: this.currentUser?.id });
        }
      }
    }

    this.numberOfLeaveAppliedForSelectedCategory = 0;
    this.getAppliedLeaveCount(this.leaveApplication.value.employee, this.tempLeaveCategory.leaveCategory._id);
  }

  addHalfDayEntry() {
    this.halfDays.push(this.fb.group({ date: [''], dayHalf: [''] }));
  }

  get halfDays() {
    return this.leaveApplication.get('halfDays') as FormArray;
  }

  getleaveCatgeoriesByUser() {
    return this.leaveService.getLeaveCategoriesByUserv1(this.currentUser.id).pipe(
      map((res: any) => res.data)
    );
  }

  getattendanceTemplatesByUser() {
    this.leaveService.getattendanceTemplatesByUser(this.currentUser.id).subscribe((res: any) => {
      if (res.status == "success") {
        let attandanceData = res.data;
        attandanceData.weeklyOfDays.forEach(day => {
          if (day != "false") {
            this.dayCounts[day] = 0;
          }
        });
      }
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
          }, error: error => {
            console.log('There was an error!', error);
          }
        });
      }, error: error => {
        console.log('There was an error!', error);
      }
    });
  }

  onMemberSelectionChange(member: any) {
    this.member = JSON.parse(member.value);
  }

  stripTime(date: Date): string {
    date.setUTCHours(0, 0, 0, 0);
    return date.toISOString();
  }

  // onSubmission() {
  //   const employeeId = this.leaveApplication.get('employee')?.value;
  //   const leaveCategory = this.leaveApplication.get('leaveCategory')?.value;
  //   let startDate = this.leaveApplication.get('startDate')?.value;
  //   let endDate = this.leaveApplication.get('endDate')?.value;
  //   startDate = this.stripTime(new Date(startDate));
  //   endDate = this.stripTime(new Date(endDate));

  //   const attachments = this.selectedFiles.map(file => ({
  //     attachmentType: file.type,
  //     attachmentName: file.name,
  //     attachmentSize: file.size,
  //     extention: '.' + file.name.split('.').pop(),
  //     // file: ''
  //   }));
  //   console.log(attachments);

  //   this.leaveApplication.patchValue({
  //     startDate: startDate,
  //     endDate: endDate,
  //     status: 'Level 1 Approval Pending',
  //     level1Reason: 'string',
  //     level2Reason: 'string',
  //     leaveApplicationAttachments: attachments
  //   });
  //   console.log(this.leaveApplication.value);

  //   let payload = { skip: '', next: '' };
  //   this.leaveService.getLeaveApplicationbyUser(payload, employeeId).subscribe((res: any) => {
  //     this.existingLeaves = res.data;
  //     const isDuplicate = this.existingLeaves.some((leave: any) =>
  //       leave.employee === employeeId &&
  //       leave.leaveCategory === leaveCategory &&
  //       leave.startDate === startDate &&
  //       leave.endDate === endDate
  //     );

  //     if (isDuplicate) {
  //       this.toast.error('A leave application with the same details already exists.', 'Error');
  //       return;
  //     } else {
  //       // this.leaveService.addLeaveApplication(this.leaveApplication.value).subscribe((res: any) => {
  //       //   this.leaveApplicationRefreshed.emit(res.data);
  //       //   this.leaveApplication.reset();
  //       //   this.toast.success('Leave Application Added Successfully');
  //       // });
  //     }
  //   });
  // }
  onSubmission() {
    const employeeId = this.leaveApplication.get('employee')?.value;
    const leaveCategory = this.leaveApplication.get('leaveCategory')?.value;
    let startDate = this.leaveApplication.get('startDate')?.value;
    let endDate = this.leaveApplication.get('endDate')?.value;
    startDate = this.stripTime(new Date(startDate));
    endDate = this.stripTime(new Date(endDate));
  
    // Prepare the leave application payload
    const leaveApplicationPayload = {
      employee: employeeId,
      leaveCategory: leaveCategory,
      startDate: startDate,
      endDate: endDate,
      status: 'Level 1 Approval Pending',
      level1Reason: 'string',
      level2Reason: 'string',
      leaveApplicationAttachments: [] // Initialize as empty array
    };
  
    // Check for duplicate leave applications
    let payload = { skip: '', next: '' };
    this.leaveService.getLeaveApplicationbyUser(payload, employeeId).subscribe((res: any) => {
      this.existingLeaves = res.data;
      const isDuplicate = this.existingLeaves.some((leave: any) =>
        leave.employee === employeeId &&
        leave.leaveCategory === leaveCategory &&
        leave.startDate === startDate &&
        leave.endDate === endDate
      );
  
      if (isDuplicate) {
        this.toast.error('A leave application with the same details already exists.', 'Error');
        return;
      } else {
        console.log('If no files are selected, call the API immediately')
        // If no files are selected, call the API immediately
        if (!this.selectedFiles || this.selectedFiles.length === 0) {
          this.submitLeaveApplication(leaveApplicationPayload);
        } else {
          console.log('Process files and then call the api')
          // Process files and then call the API
          this.processFiles(this.selectedFiles).then((attachments) => {
            leaveApplicationPayload.leaveApplicationAttachments = attachments;
            this.submitLeaveApplication(leaveApplicationPayload);
          });
        }
      }
    });
  }
  
  // Function to process selected files and return attachments
  async processFiles(files: File[]): Promise<any[]> {
    const attachments: any[] = [];
  
    // Read each file and convert to base64
    for (const file of files) {
      const base64String = await this.readFileAsBase64(file);
      const fileNameParts = file.name.split('.');
      const extention = fileNameParts[fileNameParts.length - 1];
  
      attachments.push({
        attachmentName: file.name,
        attachmentType: file.type,
        attachmentSize: file.size,
        extention: extention,
        file: base64String
      });
    }
  
    return attachments;
  }
  
  // Function to read a file as base64
  readFileAsBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = reader.result.toString().split(',')[1];
        resolve(base64String);
      };
      reader.onerror = (error) => reject(error);
    });
  }
  
  // Function to submit the leave application
  submitLeaveApplication(payload: any) {
    this.leaveService.addLeaveApplication(payload).subscribe((res: any) => {
      // this.leaveApplicationRefreshed.emit(res.data);
      this.leaveApplication.reset();
      if(res.data != null)
      {this.toast.success('Leave Application Added Successfully');}
      else{
        this.toast.error(res.message);
      }
    });
  }
  
  onFileSelected(event: any) {
    const files: FileList = event.target.files;
    if (files) {
      this.selectedFiles = Array.from(files); // Convert FileList to an array
    }
  }
  // onSubmission() {
  //   const employeeId = this.leaveApplication.get('employee')?.value;
  //   const leaveCategory = this.leaveApplication.get('leaveCategory')?.value;
  //   let startDate = this.leaveApplication.get('startDate')?.value;
  //   let endDate = this.leaveApplication.get('endDate')?.value;
  //   startDate = this.stripTime(new Date(startDate));
  //   endDate = this.stripTime(new Date(endDate));
  //   console.log(this.selectedFiles)

  //   // Prepare the attachments array

  //   if (this.selectedFiles) {
  //     const attachments: attachments[] = [];

  //     for (let i = 0; i < this.selectedFiles.length; i++) {
  //       const file: File = this.selectedFiles[i];
  //       const reader = new FileReader();
  //       reader.readAsDataURL(file);
  //       reader.onload = () => {
  //         const base64String = reader.result.toString().split(',')[1];
  //         const fileSize = file.size;
  //         const fileType = file.type;
  //         const fileNameParts = file.name.split('.');
  //         const extention = fileNameParts[fileNameParts.length - 1];

  //         attachments.push({
  //           attachmentName: file.name,
  //           attachmentType: fileType,
  //           attachmentSize: fileSize,
  //           extention: extention,
  //           file: base64String
  //         });
  //         const leaveApplicationPayload = {
  //           employee: this.leaveApplication.get('employee')?.value,
  //           leaveCategory: this.leaveApplication.get('leaveCategory')?.value,
  //           startDate: startDate,
  //           endDate: endDate,
  //           status: 'Level 1 Approval Pending',
  //           level1Reason: 'string',
  //           level2Reason: 'string',
  //           leaveApplicationAttachments: []
  //         }


  //         // Check for duplicate leave applications
  //         let payload = { skip: '', next: '' };
  //         this.leaveService.getLeaveApplicationbyUser(payload, employeeId).subscribe((res: any) => {
  //           this.existingLeaves = res.data;
  //           const isDuplicate = this.existingLeaves.some((leave: any) =>
  //             leave.employee === employeeId &&
  //             leave.leaveCategory === leaveCategory &&
  //             leave.startDate === startDate &&
  //             leave.endDate === endDate
  //           );

  //           if (isDuplicate) {
  //             this.toast.error('A leave application with the same details already exists.', 'Error');
  //             return;
  //           } else {
  //             // Submit the leave application
  //             if (i === this.selectedFiles.length - 1) {

  //               leaveApplicationPayload.leaveApplicationAttachments = attachments;
  //               console.log('API call with attchments')

  //               this.leaveService.addLeaveApplication(leaveApplicationPayload).subscribe((res: any) => {
  //                 this.leaveApplicationRefreshed.emit(res.data);
  //                 this.leaveApplication.reset(); 
  //                 this.toast.success('Leave Application Added Successfully');
  //               });
  //             }
  //             else {
  //               console.log('API call without attchments')
  //               leaveApplicationPayload.leaveApplicationAttachments = [];
  //               this.leaveService.addLeaveApplication(leaveApplicationPayload).subscribe((res: any) => {
  //                 this.leaveApplicationRefreshed.emit(res.data);
  //                 this.leaveApplication.reset(); 
  //                 this.toast.success('Leave Application Added Successfully');
  //               });
  //             }
  //           }
  //         });
  //       }
  //     }
  //   }
  // }


  closeModal() {
    this.leaveApplication.reset();
    this.close.emit(true);
  }

  getAppliedLeaveCount(userId: string, category: string) {
    const requestBody = { "skip": "0", "next": "500" };
    const currentYear = new Date().getFullYear();
    this.leaveService.getAppliedLeaveCount(userId, requestBody).subscribe((res: any) => {
      if (res.status == "success") {
        this.appliedLeave = res.data;
        this.numberOfLeaveAppliedForSelectedCategory = this.appliedLeave.filter((leave: any) => leave.leaveCategory == category && new Date(leave.addedBy).getFullYear() === currentYear).length;
      }
    });
  }

  get leaveApplicationAttachments(): FormArray {
    return this.leaveApplication.get('leaveApplicationAttachments') as FormArray;
  }

  // onFileSelected(event: any) {
  //   const files: FileList = event.target.files;
  //   if (files) {
  //     for (let i = 0; i < files.length; i++) {
  //       const file: File = files.item(i);
  //       if (file) {
  //         this.selectedFiles.push(file);
  //       }
  //     }
  //   }

  // }

  removeFile(index: number) {
    if (index !== -1) {
      this.selectedFiles.splice(index, 1);
    }
  }
}
interface attachments {
  attachmentName: string,
  attachmentType: string,
  attachmentSize: number,
  extention: string,
  file: string
}