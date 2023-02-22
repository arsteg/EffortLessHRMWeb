import { Component, OnInit } from '@angular/core';
import { Validators, FormGroup, FormBuilder,AbstractControl,FormControl } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { first } from 'rxjs';
import { AuthenticationService } from 'src/app/_services/authentication.service';
import { ManualTimeRequestService } from 'src/app/_services/manualTimeRequest.Service';
import { NotificationService } from 'src/app/_services/notification.service';
import { TimeLogService } from 'src/app/_services/timeLogService';

@Component({
  selector: 'app-add-manual-time',
  templateUrl: './add-manual-time.component.html',
  styleUrls: ['./add-manual-time.component.css']
})
export class AddManualTimeComponent implements OnInit {
  managers: {id:string, name:string }[]=[];
  projects:{id:string,projectName:string}[]=[];
  tasks:{id:string,name:string}[]=[];
  selectedProject:string;
  selectedTask:string;
  selectedManager:string;
  addRequestForm: FormGroup;
  startDate: any;
  endDate: any;
  selectedRequest:any;
  id:string='';
  constructor(private modalService: NgbModal, private formBuilder: FormBuilder,
    private authenticationService:AuthenticationService,
    private timeLogService:TimeLogService,
    private notifyService: NotificationService,
    private manualTimeRequestService:ManualTimeRequestService) {

      this.addRequestForm = this.formBuilder.group({
        manager: ['', Validators.required],
        project: ['', Validators.required],
        task: ['', Validators.required],
        startDate: ['', [Validators.required,this.validateStartDate]],
        endDate: ['', [Validators.required,this.validateEndDate]],
      },
      (formGroup: FormGroup) => {
        const fromDate = formGroup.controls['startDate'].value;
        const toDate = formGroup.controls['endDate'].value;
        return fromDate <= toDate ? null : {'Invalid Dates': true};
      }
      );
    }

  ngOnInit(): void {
    var currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.id= currentUser?.id;
    this.authenticationService.getUserProjects(this.id).pipe(first())
    .subscribe((res:any) => {
      res.data.forEach(p => {
        this.projects.push({id:p.id,projectName:p.projectName});
      });
        },
        err => {
        });

        this.authenticationService.getUserManagers(this.id).pipe(first())
        .subscribe((res:any) => {
          res.data.forEach(m => {
            this.managers.push({id:m.id,name:m.name});
          });
            },
            err => {
            });
        this.startDate = new Date().toString().slice(0, 15);
        this.endDate = new Date();
        this.endDate.setHours(23,59,59,999);
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
  getUserTaskListByProject(projectId){
    this.tasks.length=0;
    this.id=this.authenticationService.currentUserValue.id;
    this.authenticationService.getUserTaskListByProject(this.id,projectId).pipe(first())
    .subscribe((res:any) => {
      res.data.forEach(t => {
        this.tasks.push({id:t.id,name:t.name});
      });
        },
        err => {
        });
  }
  onSubmit(){
    this.notifyService.showSuccess("Manual time added successfully", "success");
  }
  getManualTimeApprovedRequests(){
    this.manualTimeRequestService.getManualTimeApprovedRequests(this.id,this.selectedProject,this.selectedManager).pipe(first())
    .subscribe((res:any) => {
            let approvedRequest =  res.data.length==0?null:res.data[0];
            this.startDate=approvedRequest.fromDate;
            this.endDate=approvedRequest.toDate;
    },
        err => {
        });
  }
}
