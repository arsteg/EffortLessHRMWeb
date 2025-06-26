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
import { CommonService } from 'src/app/_services/common.Service';
import { ActionVisibility, TableColumn } from 'src/app/models/table-column';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-request-manual-time',
  templateUrl: './requestApproval.component.html',
  styleUrls: ['./requestApproval.component.css'],
  providers: [DatePipe]
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
  public sortOrder: string = '';
  sortColumn: string = '';
  selectedMember: any = null;
  recordsPerPage: number = 10;
  totalRecords: number = 0;
  currentPage: number = 1;

  columns: TableColumn[] = [
    {
      key: 'date',
      name: 'Date',
      valueFn: (row: any) => row.date ? this.datePipe.transform(row.date, 'mediumDate') : row.date
    },
    {
      key: 'user',
      name: 'Requested By',
      valueFn: (row: any) => row.user?.firstName ? `${row.user.firstName} ${row.user.lastName}` : 'N/A'
    },
    {
      key: 'project',
      name: 'Project',
      valueFn: (row: any) => row.project?.projectName?.toUpperCase()
    },
    {
      key: 'fromDate',
      name: 'From Date',
      valueFn: (row: any) => row.fromDate ? this.datePipe.transform(row.fromDate, 'mediumDate') : row.fromDate
    },
    {
      key: 'toDate',
      name: 'To Date',
      valueFn: (row: any) => row.toDate ? this.datePipe.transform(row.toDate, 'mediumDate') : row.toDate
    },
    {
      key: 'reason',
      name: 'Reason'
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
        { label: 'Approve', visibility: ActionVisibility.LABEL, icon: '', hideCondition: (row: any) => row.status !== 'pending'  },
        { label: 'Reject', visibility: ActionVisibility.LABEL, icon: '', hideCondition: (row: any) => row.status !== 'pending' }
      ]
    }
  ];

  constructor(private modalService: NgbModal, private formBuilder: FormBuilder,
    private authenticationService: AuthenticationService,
    private timeLogService: TimeLogService,
    private notifyService: NotificationService,
    private manualTimeRequestService: ManualTimeRequestService,
    public datePipe: DatePipe,
    public commonservice: CommonService) {
  }

  ngOnInit(): void {
    this.id = this.authenticationService.currentUserValue.id;
    this.fetchManualTimeRequests();
    this.populateMembers();
  }
  filterData() {
    this.fetchManualTimeRequests();
  }
  onMemberSelectionChange(member: any) {
    if (member.value === '') {
      this.selectedMember = null;
      this.manualTimeRequestFiltered = this.manualTimeRequests;
    } else {
      this.selectedMember = member?.value;
      this.filterManualTimeRequests();
    }
  }

  fetchManualTimeRequests() {
    this.manualTimeRequestService.getManualTimeRequestsForApprovalByUser(this.id).pipe(first())
      .subscribe((res: any) => {
        this.manualTimeRequests.length = 0;
        this.totalRecords = res.totalRecords;
        res.data.forEach(r => {
          this.manualTimeRequests.push(r);
        });
        this.filterManualTimeRequests();
      },
        err => {
          console.error('Error fetching manual time requests:', err);
        });
  }

  filterManualTimeRequests() {
    if (this.selectedMember) {
      //this.manualTimeRequestFiltered = this.manualTimeRequests.filter(req => req.user.email === this.selectedMember.email);
      this.manualTimeRequestFiltered = this.manualTimeRequests.filter(
        req => req.user && req.user._id === this.selectedMember
      );
    } else {
      this.manualTimeRequestFiltered = this.manualTimeRequests;
    }
    this.totalRecords = this.manualTimeRequestFiltered.length;
  }


  approveRequest() {
    let request = this.selectedRequest;
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
    console.log(request)
    let payload = {
      requestId: request._id,
      user: request.user._id,
      project: request.project._id,
      manager: request.manager,
      fromDate: request.fromDate,
      toDate: request.toDate,
      task: request.task,
      date: request.date,
      status: request.status
    }
    this.manualTimeRequestService.updateManualTimeRequest(payload).subscribe((res: any) => {
      setTimeout(() => {
        this.notifyService.showSuccess("Request updated successfully", "success");
        this.fetchManualTimeRequests();
      }, 30);
    },
      err => {
        this.notifyService.showError(err.message, "Error")
      });
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

  sortData(column: string) {
    if (this.sortColumn === column) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortOrder = 'asc';
    }

    this.manualTimeRequestFiltered.sort((a, b) => {
      let aValue = this.getColumnValue(a, column);
      let bValue = this.getColumnValue(b, column);

      if (aValue < bValue) {
        return this.sortOrder === 'asc' ? -1 : 1;
      } else if (aValue > bValue) {
        return this.sortOrder === 'asc' ? 1 : -1;
      } else {
        return 0;
      }
    });
  }

  getColumnValue(record: any, column: string) {
    switch (column) {
      case 'user':
        return `${record?.user?.firstName} ${record?.user?.lastName}`.toLowerCase();
      case 'project':
        return record?.project?.projectName.toLowerCase();
      case 'fromDate':
      case 'toDate':
      case 'date':
        return new Date(record[column]);
      default:
        return record[column];
    }
  }

  getSortIcon(column: string) {
    return this.sortColumn === column
      ? this.sortOrder === 'asc'
        ? 'bi bi-arrow-up sort-asc'
        : 'bi bi-arrow-down sort-desc'
      : '';
  }

  onActionClick(event: any) {
    this.selectedRequest = event.row;
    switch (event.action.label) {
      case 'Approve':
        this.selectedRequest=event.row;
        this.approveRequest();
        break;
      case 'Reject':
        this.selectedRequest=event.row;
        this.rejectRequest();
        break;
    }
  }

  onPageChange(page: any) {
    this.currentPage = page.pageIndex + 1;
    this.recordsPerPage = page.pageSize;
    this.fetchManualTimeRequests();
  }

  onSearchChange(searchText: string) {
    this.manualTimeRequestFiltered = this.manualTimeRequests.filter(row => {
      return this.columns.some(col => {
        const value = col.valueFn ? col.valueFn(row) : row[col.key];
        return value?.toString().toLowerCase().includes(searchText.toLowerCase());
      });
    });
  }

}
