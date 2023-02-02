import { Component, OnInit } from '@angular/core';
import {NgbModal, ModalDismissReasons} from '@ng-bootstrap/ng-bootstrap';
import { Validators, FormGroup, FormBuilder,AbstractControl,FormControl } from '@angular/forms';
import { AuthenticationService } from 'src/app/_services/authentication.service';
import { UserService } from 'src/app/users/users.service';
import { first } from 'rxjs';
import { TimeLogService } from 'src/app/_services/timeLogService';
import { manualTimeRequest} from 'src/app/models/manualTime/manualTimeRequest';
import { NotificationService } from 'src/app/_services/notification.service';

@Component({
  selector: 'app-request-manual-time',
  templateUrl: './request-manual-time.component.html',
  styleUrls: ['./request-manual-time.component.css']
})
export class RequestManualTimeComponent implements OnInit {
  startDate: any;
  endDate: any;
  selectedManagerId:string="";
  managers: {id:string, name:string }[]=[];
  projects:{id:string,projectName:string}[]=[];
  title = 'appBootstrap';
  id:string;
  closeResult: string = '';
  addRequestForm: FormGroup;
  searchText:string="";
  teamOfUsers: [] = [];
  p: number = 1;
  constructor(private modalService: NgbModal, private formBuilder: FormBuilder,
    private authenticationService:AuthenticationService, private timeLogService:TimeLogService,private notifyService: NotificationService) {

      this.addRequestForm = this.formBuilder.group({
      manager: ['', Validators.required],
      project: ['', Validators.required],
      startDate: ['', [Validators.required,this.validateStartDate]],
      endDate: ['', [Validators.required,this.validateEndDate]],
      reason: ['', Validators.required]
    },
    (formGroup: FormGroup) => {
      const fromDate = formGroup.controls['startDate'].value;
      const toDate = formGroup.controls['endDate'].value;
      return fromDate <= toDate ? null : {'Invalid Dates': true};
    }
    );
    this.startDate = new Date().toString().slice(0, 15);
    this.endDate = new Date();
    this.endDate.setHours(23,59,59,999);
  }

  ngOnInit(): void {
    this.id=this.authenticationService.currentUserValue.id;
    this.authenticationService.getUserManagers(this.id).pipe(first())
    .subscribe((res:any) => {
      res.data.forEach(element => {
        this.managers.push(element);
      });
        },
        err => {
        });

        this.authenticationService.getUserProjects(this.id).pipe(first())
    .subscribe((res:any) => {
      res.data.forEach(p => {
        this.projects.push({id:p.id,projectName:p.projectName});
      });
        },
        err => {
        });
      }
      onChange(newId: number) {
        console.log(`Selected item with id: ${newId}`);
      }

  open(content:any) {
    this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title'}).result.then((result) => {
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
      return  `with: ${reason}`;
    }
  }
  onSubmit(){
    let request = new manualTimeRequest();
    request.date =  "2023-01-26";
    request.manager =  this.addRequestForm.value.manager;
    request.project =  this.addRequestForm.value.project;
    request.reason =  this.addRequestForm.value.reason;
    request.user =  this.authenticationService.currentUserValue.id;
    request.fromDate =  this.addRequestForm.value.startDate;
    request.toDate =  this.addRequestForm.value.startDate;
    this.timeLogService.addManualTimeRequest(request).subscribe((res:any) => {
      setTimeout(() => {
        this.notifyService.showSuccess("Manual time request is sent successfully", "success")
     }, 30);
      },
      err => {
        this.notifyService.showError(err.message, "Error")
      });
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
  getRoleName(r:string){}
  selectedUser(){}
}
