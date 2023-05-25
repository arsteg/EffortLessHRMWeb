import { Component, OnInit } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { Validators, FormGroup, FormBuilder, AbstractControl, FormControl } from '@angular/forms';
import { AuthenticationService } from 'src/app/_services/authentication.service';
import { UserService } from 'src/app/_services/users.service';
import { first } from 'rxjs';
import { TimeLogService } from 'src/app/_services/timeLogService';
import { manualTimeRequest } from 'src/app/models/manualTime/manualTimeRequest';
import { NotificationService } from 'src/app/_services/notification.service';
import { ManualTimeRequestService } from 'src/app/_services/manualTimeRequest.Service';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-request-manual-time',
  templateUrl: './requestApproval.component.html',
  styleUrls: ['./requestApproval.component.css']
})
export class RequestApprovalComponent implements OnInit {
  manualTimeRequests: manualTimeRequest[] = [];
  manualTimeRequestFiltered: manualTimeRequest[] = [];
  searchText: string = "";
  p: number = 1;
  selectedRequest: any;
  id: string = '';
  members: any;
  member: any;
  selectedUser: any = [];
  manualTimeRequests1: any;
  roleName = localStorage.getItem('roleName');
  currentUser = JSON.parse(localStorage.getItem('currentUser'));
  public sortOrder: string = ''; // 'asc' or 'desc'

  constructor(private modalService: NgbModal, private formBuilder: FormBuilder,
    private authenticationService: AuthenticationService,
    private timeLogService: TimeLogService,
    private notifyService: NotificationService,
    private manualTimeRequestService: ManualTimeRequestService) {
  }

  ngOnInit(): void {
    this.id = this.authenticationService.currentUserValue.id;
    this.fetchManualTimeRequests();
    this.populateMembers();
  }
  filterData() {
    this.fetchManualTimeRequests();
  }

  fetchManualTimeRequests() {
    this.manualTimeRequestService.getManualTimeRequestsForApprovalByUser(this.id).pipe(first())
      .subscribe((res: any) => {
        this.manualTimeRequests.length = 0;
        res.data.forEach(r => {
          this.manualTimeRequests.push(r);
        });
        this.manualTimeRequestFiltered = this.manualTimeRequests;
      },
        err => {
        });
  }
  approveRequest() {
    let request = this.selectedRequest;
    request.id = this.selectedRequest._id;
    request.status = 'approved';
    this.updateRequest(request);
  }
  rejectRequest() {
    let request = this.selectedRequest;
    request.id = this.selectedRequest._id;
    request.status = 'rejected';
    this.updateRequest(request);
  }
  updateRequest(request) {
    this.manualTimeRequestService.updateManualTimeRequest(request).subscribe((res: any) => {
      setTimeout(() => {
        this.notifyService.showSuccess("Request updated successfully", "success");
        this.fetchManualTimeRequests();
      }, 30);
    },
      err => {
        this.notifyService.showError(err.message, "Error")
      });
  }
  onMemberSelectionChange(member: any) {
    this.member = JSON.parse(member.value);
    this.manualTimeRequestFiltered = this.manualTimeRequests.filter(req=>{ return req.user.email==this.member.email})
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
}
