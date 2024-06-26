import { Component, OnInit } from '@angular/core';
import { Validators, FormGroup, FormBuilder, AbstractControl, FormControl } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { first } from 'rxjs';
import { AuthenticationService } from 'src/app/_services/authentication.service';
import { ManualTimeRequestService } from 'src/app/_services/manualTimeRequest.Service';
import { NotificationService } from 'src/app/_services/notification.service';
import { TimeLogService } from 'src/app/_services/timeLogService';
import { UtilsService } from 'src/app/_services/utils.service';


@Component({
  selector: 'app-add-manual-time',
  templateUrl: './add-manual-time.component.html',
  styleUrls: ['./add-manual-time.component.css']
})
export class AddManualTimeComponent implements OnInit {
  managers: { id: string, name: string }[] = [];
  projects: { id: string, projectName: string }[] = [];
  tasks: any = [];
  selectedProject: string;
  selectedTask: string;
  selectedManager: string;
  addRequestForm: FormGroup;
  startDate: any;
  endDate: any;
  selectedRequest: any;
  id: string = '';
  userEmail = '';
  constructor(private modalService: NgbModal, private formBuilder: FormBuilder,
    private authenticationService: AuthenticationService,
    private timeLogService: TimeLogService,
    private notifyService: NotificationService,
    private manualTimeRequestService: ManualTimeRequestService,
    private utilsService: UtilsService) {

    this.addRequestForm = this.formBuilder.group({
      manager: ['', Validators.required],
      project: ['', Validators.required],
      task: ['', Validators.required],
      startDate: ['', [Validators.required, this.validateStartDate]],
      endDate: ['', [Validators.required, this.validateEndDate]],
    },
      (formGroup: FormGroup) => {
        const fromDate = formGroup.controls['startDate'].value;
        const toDate = formGroup.controls['endDate'].value;
        return fromDate <= toDate ? null : { 'Invalid Dates': true };
      }
    );
  }
  projectName;
  ngOnInit(): void {
    var currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.id = currentUser?.id;
    this.userEmail = currentUser.email;
    console.log(this.id)
    this.authenticationService.getUserProjects(this.id).pipe(first())
      .subscribe((res: any) => {
        this.projects = res.data;
        // this.projectName = this.projects
        // console.log(this.projectName)
        this.projects = this.projects.filter(project => project !== null);
    
        // If you want to assign project names to the this.projectName array
        this.projectName = this.projects.map(project => project);
        console.log(this.projectName.projectName);
      });

    this.authenticationService.getUserManagers(this.id).pipe(first())
      .subscribe((res: any) => {
        res.data.forEach(m => {
          this.managers.push({ id: m.id, name: m.name });
        });
      },
        err => {
        });
    this.startDate = new Date().toString().slice(0, 15);
    this.endDate = new Date();
    this.endDate.setHours(23, 59, 59, 999);
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

  onProjectChange(event) {
    const projectId = event.value;
    this.getUserTaskListByProject(projectId);
    this.getManualTimeApprovedRequests();
  }
  // getUserTaskListByProject(projectId){


  //   this.tasks.length=0;
  //   this.id=this.authenticationService.currentUserValue.id;
  //   this.authenticationService.getUserTaskListByProject(this.id,projectId).pipe(first())
  //   .subscribe((res:any) => {
  //     res.data.forEach(t => {
  //       this.tasks.push({id:t.id,name:t.name});
  //     });
  //       },
  //       err => {
  //       });
  // }
  getUserTaskListByProject(projectId) {
    this.authenticationService.getUserTaskListByProject(this.id, projectId, '', '').subscribe(response => {
      this.tasks = response && response['taskList'];
    });
  }
  onSubmit() {
    this.timeLogService.addManualTime(this.id, this.selectedTask, this.selectedProject, this.utilsService.convertToUTC(this.startDate), this.utilsService.convertToUTC(this.endDate), this.utilsService.convertToUTC(new Date())).pipe(first())
      .subscribe((res: any) => {
        this.notifyService.showSuccess("Manual time added successfully", "success");
      },
        err => {
          this.notifyService.showError("Something went wrong!", "Failure");
        });
  }
  getManualTimeApprovedRequests() {
    this.manualTimeRequestService.getManualTimeApprovedRequests(this.id, this.selectedProject, this.selectedManager).pipe(first())
      .subscribe((res: any) => {
        let approvedRequest = res.data.length == 0 ? null : res.data[0];
        if (approvedRequest != null) {
          this.startDate = new Date(approvedRequest.fromDate);
          this.endDate = new Date(approvedRequest.toDate);

          console.log(this.endDate);
        }
      },
        err => {
        });
  }
}
