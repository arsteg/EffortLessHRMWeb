import { Component, Input } from '@angular/core';
import { ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { LeaveService } from 'src/app/_services/leave.service';
import { UpdateStatusComponent } from '../update-status/update-status.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { CommonService } from 'src/app/_services/common.Service';
import { ViewLeaveComponent } from '../view-leave/view-leave.component';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { ActionVisibility, TableColumn } from 'src/app/models/table-column';

@Component({
  selector: 'app-show-status',
  templateUrl: './show-status.component.html',
  styleUrl: './show-status.component.css'
})
export class ShowStatusComponent {
  closeResult: string = '';
  searchText: string = '';
  @Input() actionOptions: { approve: boolean, reject: boolean, delete: boolean, view: boolean };
  leaveGrant: any;
  allAssignee: any;
  @Input() status: string;
  @Input() tab: number;
  portalView = localStorage.getItem('adminView');
  currentUser = JSON.parse(localStorage.getItem('currentUser'));
  totalRecords: number = 0;
  recordsPerPage: number = 10;
  currentPage: number = 1;
  allData: any[] = [];
  dialogRef: MatDialogRef<any> | null = null;

  columns: TableColumn[] = [
    {
      key: 'employeeName', name: this.translate.instant('leave.leaveGrant.employeeColName'),
      valueFn: (row: any) => `${row?.employee?.firstName} ${row?.employee?.lastName}`
    },
    {
      key: 'appliedOn', name: this.translate.instant('leave.leaveGrant.appliedOnColName'),
      valueFn: (row: any) => new Date(row.appliedOn).toLocaleDateString()
    },
    {
      key: 'date', name: this.translate.instant('leave.leaveGrant.appliedForColName'),
      valueFn: (row: any) => new Date(row.date).toLocaleDateString()
    },
    {
      key: 'usedOn', name: this.translate.instant('leave.leaveGrant.usedOnColName'),
      valueFn: (row: any) => new Date(row.usedOn).toLocaleDateString()
    },
    { key: 'comment', name: this.translate.instant('leave.leaveGrant.commentColName') },
    { key: 'status', name: this.translate.instant('leave.leaveGrant.statusColName') },
    {
      key: 'action',
      name: this.translate.instant('leave.leaveGrant.actionColName'),
      isAction: true,
      options: [
        {
          label: 'Approve',
          icon: 'check_circle',
          visibility: ActionVisibility.LABEL,
          hideCondition: (row: any) => !this.actionOptions.approve || (this.portalView === 'user' && (this.portalView === 'user' && this.tab != 7))
        },
        {
          label: 'Reject',
          icon: 'person_remove',
          visibility: ActionVisibility.LABEL,
          hideCondition: (row: any) => !this.actionOptions.reject || (this.portalView === 'user' && (this.portalView === 'user' && this.tab != 7))
        },
        {
          label: 'Delete',
          icon: 'delete',
          visibility: ActionVisibility.LABEL,
          hideCondition: (row: any) => !this.actionOptions.delete
        },
        {
          label: 'View',
          icon: 'visibility',
          visibility: ActionVisibility.LABEL,
          hideCondition: (row: any) => !this.actionOptions.view
        }
      ]
    }
  ];

  constructor(
    private leaveService: LeaveService,
    private dialog: MatDialog,
    private commonService: CommonService,
    private toast: ToastrService,
    private translate: TranslateService
  ) {
    this.translate.setDefaultLang('en');
  }

  ngOnInit() {
    this.commonService.populateUsers().subscribe(result => {
      this.allAssignee = result && result.data && result.data.data;
    });
    this.getLeaveGrant();
  }

  getLeaveGrant() {
    const requestBody = {
      "skip": ((this.currentPage - 1) * this.recordsPerPage).toString(),
      "next": this.recordsPerPage.toString(),
      "status": this.status
    };
    const storedTabValue = localStorage.getItem('selectedTab');
    if (this.portalView === 'admin') {
      this.leaveService.getLeaveGrant(requestBody).subscribe((res: any) => {
        if (res.status == 'success') {
          this.totalRecords = res.total;
          this.leaveGrant = res.data;
          this.allData = res.data;
        }
      });
    }
    if (this.portalView === 'user' && parseInt(storedTabValue) === 3) {
      this.leaveService.getLeaveGrantByUser(this.currentUser?.id, requestBody).subscribe((res: any) => {
        this.leaveGrant = res.data.filter(leave => leave.status === this.status);
        if (res.status == 'success') {
          this.totalRecords = res.total;
          this.leaveGrant = res.data;
          this.allData = res.data;
        }
      });
    }
    else if (this.portalView === 'user' && parseInt(storedTabValue) === 7) {
      this.leaveService.getLeaveGrantByTeam(requestBody).subscribe((res: any) => {
        this.leaveGrant = res.data.filter(leave => leave.status === this.status);
        if (res.status == 'success') {
          this.totalRecords = res.total;
          this.leaveGrant = res.data;
          this.allData = res.data;
        }
      });

    }
  }

  onClose(event) {
    if (event) {
      this.dialogRef.close(true);
    }
  }

  openStatusModal(report: any, status: string): void {
    report.status = status;
    this.leaveService.leave.next(report);
    const dialogRef = this.dialog.open(UpdateStatusComponent, {
      width: '50%',
      data: { report }
    });
    dialogRef.afterClosed().subscribe(result => {
      this.refreshLeaveGrantTable();
    });
  }

  refreshLeaveGrantTable() {
    const requestBody = {
      "skip": ((this.currentPage - 1) * this.recordsPerPage).toString(),
      "next": this.recordsPerPage.toString(),
      "status": this.status
    };
    const storedTabValue = localStorage.getItem('selectedTab');

    if (this.portalView === 'admin') {
      this.leaveService.getLeaveGrant(requestBody).subscribe(
        (res) => {
          if (res.status == 'success') {
            this.totalRecords = res.total;
            this.leaveGrant = res.data;
          }
        },
        (error) => {
          console.error('Error refreshing leave grant table:', error);
        }
      );
    }
    if (this.portalView === 'user') {
      if (parseInt(storedTabValue) === 3) {
        this.leaveService.getLeaveGrantByUser(this.currentUser?.id, requestBody).subscribe((res: any) => {
          this.leaveGrant = res.data.filter(leave => leave.status === this.status);
        });
      } else if (parseInt(storedTabValue) === 7) {
        this.leaveService.getLeaveGrantByTeam(requestBody).subscribe((res: any) => {
          if (res.status == 'success') {
            this.totalRecords = res.total;
            this.leaveGrant = res.data;
          }
        });
      }
    }
  }

  open(content: any) {
    this.dialogRef = this.dialog.open(content, {
      width: '600px',
      disableClose: true
    });
    this.dialogRef.afterClosed().subscribe(result => {
    });
  }

  openSecondModal(selectedReport: any): void {
    const userName = this.getUser(selectedReport.employee);
    selectedReport.employee = userName;
    this.leaveService.leave.next(selectedReport);
    const dialogRef = this.dialog.open(ViewLeaveComponent, {
      width: '50%',
      data: { report: selectedReport }
    });
    dialogRef.afterClosed().subscribe(result => { });
  }

  getUser(employeeId: string) {
    const matchingUser = this.allAssignee?.find(user => user._id === employeeId);
    return matchingUser
      ? `${matchingUser.firstName} ${matchingUser.lastName}`
      : this.translate.instant('leave.userNotFound');
  }

  deleteLeaveGrant(_id: string) {
    this.leaveService.deleteLeaveGrant(_id).subscribe(
      (res: any) => {
        const index = this.leaveGrant.findIndex(temp => temp._id === _id);
        if (index !== -1) {
          this.leaveGrant.splice(index, 1);
        }
        this.toast.success(
          this.translate.instant('leave.deleteSuccess'),
          this.translate.instant('leave.deleteGrantTitle')
        );
      },
      (err) => {
        this.toast.error(
          this.translate.instant('leave.deleteError'),
          this.translate.instant('leave.errorTitle')
        );
      }
    );
  }

  deleteDialog(id: string): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'delete') {
        this.deleteLeaveGrant(id);
      }
    });
  }

  handleAction(event: any) {
    if (event.action.label === 'Approve') {
      this.openStatusModal(event.row, 'Approved');
    } else if (event.action.label === 'Reject') {
      this.openStatusModal(event.row, 'Rejected');
    } else if (event.action.label === 'Delete') {
      this.deleteDialog(event.row._id);
    } else if (event.action.label === 'View') {
      this.openSecondModal(event.row);
    }
  }

  onPageChange(event: any) {
    this.recordsPerPage = event.pageSize;
    this.currentPage = event.pageIndex + 1;
    this.getLeaveGrant();
  }

  onSortChange(event: any) {
    const sorted = this.allData.slice().sort((a: any, b: any) => {
      var valueA = '';
      var valueB = '';

      if (event.active === 'employee' || event.active === 'employeeName') {
        valueA = `${a.employee.firstName || ''} ${a.employee.lastName || ''}`.toLowerCase();
        valueB = `${b.employee.firstName || ''} ${b.employee.lastName || ''}`.toLowerCase();
      } else {
        valueA = this.getNestedValue(a, event.active);
        valueB = this.getNestedValue(b, event.active);
      }

      // Handle nulls and undefined
      valueA = valueA ?? '';
      valueB = valueB ?? '';

      if (valueA < valueB) return event.direction === 'asc' ? -1 : 1;
      if (valueA > valueB) return event.direction === 'asc' ? 1 : -1;
      return 0;
    });

    this.leaveGrant = sorted;
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((o, key) => (o ? o[key] : undefined), obj);
  }

  onSearchChange(search: string) {
    const lowerSearch = search.toLowerCase();

    const data = this.allData?.filter(row => {
      const valuesToSearch = [
        `${row?.employee?.firstName} ${row?.employee?.lastName}`,
        row?.appliedOn,
        row?.usedOn,
        row?.date,
        row?.comment,
        row?.status
      ];

      return valuesToSearch.some(value =>
        value?.toString().toLowerCase().includes(lowerSearch)
      );
    });

    this.leaveGrant = data;
  }
}