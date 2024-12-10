import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { UntypedFormBuilder } from '@angular/forms';
import { first } from 'rxjs/operators';
import { NotificationService } from 'src/app/_services/notification.service';
import { teamMember } from 'src/app/models/teamMember';
import { TimeLogService } from 'src/app/_services/timeLogService';
import { productivityAppsApproval } from 'src/app/models/productivityApps/productivityAppsApproval';
import { AppWebsiteService } from 'src/app/_services/appWebsite.service';

@Component({
  selector: 'app-login',
  templateUrl: './productivityAppsApproval.component.html',
  styleUrls: ['./productivityAppsApproval.component.css'],
})

export class productivityAppsApprovalComponent implements OnInit {
  rememberMe: boolean = false;
  loading = false;
  submitted = false;
  returnUrl: string;
  members: teamMember[];
  member: any;

  productivityApps:productivityAppsApproval[] = [];
  productivityAppsFiltered:productivityAppsApproval[] = [];
  searchText: string = "";
  p: number = 1;
  selectedRequest: any;
  userId: string = '';
  selectedUser: any = [];
  manualTimeRequests1: any;
  roleName = localStorage.getItem('roleName');
  currentUser = JSON.parse(localStorage.getItem('currentUser'));
  public sortOrder: string = ''; // 'asc' or 'desc'
  //

  constructor(private formBuilder: UntypedFormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private appWebsiteService:AppWebsiteService,
    private timeLogService:TimeLogService,
    private notifyService: NotificationService) {
  }
  ngOnInit(): void {
    this.populateMembers();
  }

  onSubmit() {
      // debugger;
      this.submitted = true;
      this.loading = true;

  }
  onMemberSelectionChange(member: any) {
    this.member = JSON.parse(member.value);
    this.populateRequests()
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


  // need to remove later on

  fetchManualTimeRequests() {

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
    this.appWebsiteService.updateProductivityApps(this.member.id,request).pipe(first())
    .subscribe((res: any) => {

    },
      err => {
      });
  }

  populateRequests(){
    this.appWebsiteService.getProductivityApps(this.member.id).pipe(first())
    .subscribe((res: any) => {
      this.productivityApps.length = 0;
      res.data.forEach(r => {
        this.productivityApps.push(r);
      });
      this.productivityAppsFiltered = this.productivityApps;
    },
      err => {
      });
}
}

