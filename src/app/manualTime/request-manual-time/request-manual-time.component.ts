import { Component, OnInit } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { Validators, FormGroup, FormBuilder, AbstractControl, FormControl } from '@angular/forms';
import { AuthenticationService } from 'src/app/_services/authentication.service';
import { UserService } from 'src/app/_services/users.service';
import { Observable, first, tap } from 'rxjs';
import { TimeLogService } from 'src/app/_services/timeLogService';
import { manualTimeRequest } from 'src/app/models/manualTime/manualTimeRequest';
import { NotificationService } from 'src/app/_services/notification.service';
import { ManualTimeRequestService } from 'src/app/_services/manualTimeRequest.Service';
import { UtilsService } from 'src/app/_services/utils.service';
import { CommonService } from 'src/app/common/common.service';
import { TasksService } from 'src/app/_services/tasks.service';
import * as moment from 'moment';
import { ToastrService } from 'ngx-toastr';
import { mergeMap } from 'rxjs/operators';

@Component({
  selector: 'app-request-manual-time',
  templateUrl: './request-manual-time.component.html',
  styleUrls: ['./request-manual-time.component.css']
})
export class RequestManualTimeComponent implements OnInit {
  startDate: any;
  endDate: any;
  reason: string = '';
  managers: { id: string, name: string }[] = [];
  projects: { id: string, projectName: string }[] = [];
  tasks: { id: string, taskName: string }[] = [];
  today: string = new Date().toISOString().split('T')[0];
  id: string;
  projectId: string;
  closeResult: string = '';
  addRequestForm: FormGroup;
  searchText: string = "";
  p: number = 1;
  manualTimeRequests: any;
  changeMode = 'Add';
  selectedRequest: any;
  selectedProject: string = 'undefined';
  selectedManager: string = 'undefined';
  selectedTask: string = 'undefined';
  public sortOrder: string = ''; // 'asc' or 'desc'
  firstLetter: string;
  color: string;
  dateMismatchError: boolean = false;
  filteredManualTimeRequests: any[] = [];

  constructor(private modalService: NgbModal, private formBuilder: FormBuilder,
    private authenticationService: AuthenticationService,
    private timeLogService: TimeLogService,
    private toastService: ToastrService,
    private manualTimeRequestService: ManualTimeRequestService,
    private utilsService: UtilsService,
    public commonservice: CommonService,
    public taskService: TasksService) {

    this.addRequestForm = this.formBuilder.group({
      manager: ['', Validators.required],
      project: ['', Validators.required],
      task: ['', Validators.required],
      startDate: ['', [Validators.required, this.validateStartDate]],
      endDate: ['', [Validators.required, this.validateEndDate]],
      reason: ['', Validators.required]
    },
      (formGroup: FormGroup) => {
        const fromDate = formGroup.controls['startDate'].value;
        const toDate = formGroup.controls['endDate'].value;
        return fromDate <= toDate ? null : { 'Invalid Dates': true };
      }
    );
    this.startDate = new Date().toString().slice(0, 15);
    this.endDate = new Date();
    this.endDate.setHours(23, 59, 59, 999);
  }

  ngOnInit(): void {
    this.firstLetter = this.commonservice.firstletter;
    var currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.id = currentUser?.id;
    this.authenticationService.currentUserValue.id
    this.authenticationService.getUserManagers(this.id).pipe(first())
      .subscribe((res: any) => {
        res.data.forEach(element => {
          this.managers.push(element);
        });
      },
        err => {
        });

    this.authenticationService.getUserProjects(this.id).pipe(first())
      .subscribe((res: any) => {
        res.data.forEach(p => {
          if (p) {
            this.projects.push({ id: p?.id, projectName: p?.projectName });
          }
        });
      },
        err => {
        });


    this.fetchManualTimeRequests();
  }
  onChange(newId: number) {
    console.log(`Selected item with id: ${newId}`);
  }

  // onProjectChange(event): Observable<any> {
  //   const projectId = event.value;
  //  return this.getUserTaskListByProject(projectId);
  // }
  // getUserTaskListByProject(projectId: string): Observable<any> {
  //   return this.authenticationService.getUserTaskListByProject(this.id, projectId, '', '').
  //   pipe(
  //     tap(res => {
  //       this.tasks = res && res['taskList'];
  //       console.log(this.tasks);
  //     })
  //   );
  // }
  
  onProjectChange(event): void {
    const projectId = event.value;
    this.getUserTaskListByProject(projectId).subscribe();
  }
  
  getUserTaskListByProject(projectId: string): Observable<any> {
    return this.authenticationService.getUserTaskListByProject(this.id, projectId, '', '')
      .pipe(
        tap(res => {
          this.tasks = res && res['taskList'];
          console.log(this.tasks);
        })
      );
  }
  
  open(content: any) {
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }


  validateStartDate(control: FormControl) {
    const startDate = control.value;
    const endDate = control.parent?.get('endDate').value;

    if (endDate && startDate && startDate > endDate) {
      return { 'endDateBeforeStartDate': true };
    }
    return null;
  }

  validateEndDate(control: FormControl) {
    const startDate = control.parent?.get('startDate').value;
    const endDate = control.value;
    if (startDate && endDate && startDate > endDate) {
      return { 'endDateBeforeStartDate': true };
    }
    return null;
  }



  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }
  onSubmit() {
    let request = new manualTimeRequest();
    request.date = new Date().toString().slice(0, 15);;
    request.manager = this.addRequestForm.value.manager;
    request.project = this.addRequestForm.value.project;
    request.task = this.addRequestForm.value.task;
    request.reason = this.addRequestForm.value.reason;
    var currentUser = JSON.parse(localStorage.getItem('currentUser'));
    request.user = currentUser?.id;

    request.fromDate = this.utilsService.convertToUTC(this.addRequestForm.value.startDate);
    request.toDate = this.utilsService.convertToUTC(this.addRequestForm.value.endDate);


    const startDate = new Date(this.addRequestForm.value.startDate).toLocaleDateString('en-GB');
    const endDate = new Date(this.addRequestForm.value.endDate).toLocaleDateString('en-GB');

    // Compare only the date parts for equality
    if (startDate !== endDate) {
      this.dateMismatchError = true;
      return;
    } else {
      this.dateMismatchError = false; // Reset the error state
    }

    if (this.changeMode == 'Add') {
      this.manualTimeRequestService.addManualTimeRequest(request).subscribe((res: any) => {
        setTimeout(() => {
          this.toastService.success("Manual time request created successfully", "success");
          this.addRequestForm.reset();
          this.fetchManualTimeRequests();
        }, 30);
      },
        err => {
          this.toastService.error(err.message, "Error")
        });
    }
    else {
      request.id = this.selectedRequest._id;
      this.manualTimeRequestService.updateManualTimeRequest(request).subscribe((res: any) => {
        this.toastService.success("Manual time request updated successfully", "success");
        this.addRequestForm.reset();
        this.fetchManualTimeRequests();
      },
        err => {
          this.toastService.error(err.message, "Error")
        });
    }
  }
  getColor(char: string): string {
    switch (char) {
      case 'A':
        return 'A';
      case 'B':
        return 'B';
      case 'C':
        return 'C';
      case 'D':
        return 'D';
      case 'E':
        return 'E';
      case 'R':
        return 'R';
      default:
        return 'defaults';
    }
  }

  deleteRequest() {
    this.manualTimeRequestService.DeleteManualTimeRequest(this.selectedRequest._id).pipe(first())
      .subscribe((res: any) => {
        this.toastService.success("Manual time request has been deleted successfully!", "success");
        this.fetchManualTimeRequests();
      },
        err => {
        });
  }

  fetchManualTimeRequests() {
    this.manualTimeRequestService.getManualTimeRequestsByUser(this.id).subscribe((res: any) => {
      const data = res.data;
      this.transformRecords(data);
    });
  }


  transformRecords(rawRecords: any) {
    this.manualTimeRequests = rawRecords.map(record => ({
      ...record,
      projectName: record.project.projectName,
      manager: record.manager,
      task: record?.task
    }));
    this.filteredManualTimeRequests = [...this.manualTimeRequests];
  }


  filterRecords() {
    const searchWords = this.searchText.toLowerCase().split(' ').filter(word => word);

    this.filteredManualTimeRequests = this.manualTimeRequests.filter(record => {
      return searchWords.every(word => {
        return Object.keys(record).some(key => {
          if (typeof record[key] === 'string') {
            return record[key].toLowerCase().includes(word);
          } else if (typeof record[key] === 'object' && record[key] !== null) {
            return Object.keys(record[key]).some(subKey => {
              if (typeof record[key][subKey] === 'string') {
                return record[key][subKey].toLowerCase().includes(word);
              }
              return false;
            });
          }
          return false;
        });
      });
    });
  }

  clearselectedRequest() {
    this.addRequestForm.reset();
  }

  // setUpdateMode(record): void {
  //   this.onProjectChange({ value: record.project.id }).subscribe(() => {
  //     const formattedStartDate = moment(record.fromDate).format('YYYY-MM-DDTHH:mm');
  //     const formattedEndDate = moment(record.toDate).format('YYYY-MM-DDTHH:mm');
  //     this.addRequestForm.patchValue({
  //       manager: record.manager.id,
  //       project: record.project.id,
  //       startDate: formattedStartDate,
  //       endDate: formattedEndDate,
  //       reason: record.reason,
  //       task: record.task.id
  //     });
  //     this.selectedTask = record.task.id;
  //     console.log(this.selectedTask);
  //     console.log(this.addRequestForm.value);
  //   });
  // }
  setUpdateMode(record): void {
    this.getUserTaskListByProject(record.project.id).subscribe(() => {
      const formattedStartDate = moment(record.fromDate).format('YYYY-MM-DDTHH:mm');
      const formattedEndDate = moment(record.toDate).format('YYYY-MM-DDTHH:mm');
      this.addRequestForm.patchValue({
        manager: record.manager.id,
        project: record.project.id,
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        reason: record.reason,
        task: record.task.id
      });
      this.selectedTask = record.task.id;
      console.log(this.selectedTask);
      console.log(this.addRequestForm.value);
    });
  }

}