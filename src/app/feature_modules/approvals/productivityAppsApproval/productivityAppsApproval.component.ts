import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { UntypedFormBuilder } from '@angular/forms';
import { first } from 'rxjs/operators';
import { NotificationService } from 'src/app/_services/notification.service';
import { teamMember } from 'src/app/models/teamMember';
import { TimeLogService } from 'src/app/_services/timeLogService';
import { productivityAppsApproval } from 'src/app/models/productivityApps/productivityAppsApproval';
import { AppWebsiteService } from 'src/app/_services/appWebsite.service';
import { ActionVisibility, TableColumn } from 'src/app/models/table-column';

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
  totalRecords: number = 0;
  currentPage: number = 1;
  recordsPerPage: number = 10;

  //
  columns: TableColumn[] = [
    {
      key: 'key',
      name: 'Key',
      valueFn: (row: productivityAppsApproval) => row.key
    },
    {
      key: 'name',
      name: 'Name',
      valueFn: (row: productivityAppsApproval) => row.name
    },
    {
      key: 'status',
      name: 'Status',
      isHtml: true,
      icons: [
        { value: 'approved', name: 'check', class: 'text-success' },
        { value: 'rejected', name: 'close', class: 'text-danger' },
        { value: 'pending', name: 'schedule', class: 'text-primary' }
      ]
    },
    {
      key: 'action',
      name: 'Action',
      isAction: true,
      options: [
        { label: 'Approve', visibility: ActionVisibility.LABEL, icon: '', hideCondition: (row: productivityAppsApproval) => row.status !== 'pending' },
        { label: 'Reject', visibility: ActionVisibility.LABEL, icon: '', hideCondition: (row: productivityAppsApproval) => row.status !== 'pending' }
      ]
    }
  ];

  constructor(private formBuilder: UntypedFormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private appWebsiteService:AppWebsiteService,
    private timeLogService:TimeLogService,
    private notifyService: NotificationService) {
  }
  ngOnInit(): void {
    this.populateMembers();
    this.populateRequests();
  }

  onSubmit() {
      // debugger;
      this.submitted = true;
      this.loading = true;

  }
  onMemberSelectionChange(member: any) {
    // this.member = JSON.parse(member.value);
    // this.populateRequests();
    this.member = member.value || null;
    this.populateRequests();
  }

  populateMembers() {
    this.members = [];
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.members.push({ id: currentUser.id, name: "Me", email: currentUser.email });
    this.member = currentUser.id;
    this.timeLogService.getTeamMembers(this.member).subscribe({
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

  fetchProductivityAppRequests() {
    this.populateRequests();
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
    this.appWebsiteService.updateProductivityApps(request.id,request).pipe(first())
    .subscribe((res: any) => {

    },
      err => {
      });
  }

  populateRequests(){
    this.appWebsiteService.getProductivityApps(this.member).pipe(first())
    .subscribe((res: any) => {
      if (res && res.data && res.data.length > 0) {
        this.productivityApps = res.data;
        this.totalRecords = res.totalRecords || res.data.length;
      } else {
        this.productivityApps = [];
        this.totalRecords = 0;
      }
    },
    err => {
      console.error('Error fetching productivity apps:', err);
      this.productivityApps = [];
      this.totalRecords = 0;
    });
  }

  onActionClick(event: any){
    this.selectedRequest = event.row;
    switch (event.action.label) {
      case 'Approve':
        this.approveRequest();
        break;
      case 'Reject':
        this.rejectRequest();
        break;
    }
  }

  // filterProductivityApps(): void {
  //   debugger;
  //   this.productivityAppsFiltered = this.member
  //     ? this.productivityApps.filter(req => req.user === this.member)
  //     : this.productivityApps;
  //   this.totalRecords = this.productivityAppsFiltered.length;
  //   debugger;
  // }

  onPageChange(page: any): void {
    this.currentPage = page.pageIndex + 1;
    this.recordsPerPage = page.pageSize;
    this.productivityApps = this.productivityApps.slice(
      (this.currentPage - 1) * this.recordsPerPage,
      this.currentPage * this.recordsPerPage
    );
  }

  onSearchChange(searchText: string): void {
    //this.searchSubject.next(searchText);
    this.productivityApps = this.productivityApps.filter(row => {
      return this.columns.some(col => {
        const value = col.valueFn ? col.valueFn(row) : row[col.key];
        return value?.toString().toLowerCase().includes(searchText.toLowerCase());
      });
    });
    this.totalRecords = this.productivityApps.length;
  }
}

