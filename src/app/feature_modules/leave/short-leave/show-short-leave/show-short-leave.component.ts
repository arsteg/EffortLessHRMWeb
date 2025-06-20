import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { ExportService } from 'src/app/_services/export.service';
import { LeaveService } from 'src/app/_services/leave.service';
import { CommonService } from 'src/app/_services/common.Service';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';
import { ViewShortLeaveComponent } from '../view-short-leave/view-short-leave.component';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-show-short-leave',
  templateUrl: './show-short-leave.component.html',
  styleUrls: ['./show-short-leave.component.css']
})
export class ShowShortLeaveComponent {
  @Input() actionOptions: { approve: boolean; reject: boolean; delete: boolean; view: boolean } = {
    approve: true,
    reject: true,
    delete: true,
    view: true
  };
  @Input() status: string = '';
  shortLeave: any[] = [];
  closeResult: string = '';
  searchText: string = '';
  allAssignee: any[] = [];
  public sortOrder: 'asc' | 'desc' = 'asc';
  @Input() tab: number = 1;
  portalView: string | null = localStorage.getItem('adminView');
  totalRecords: number = 0;
  recordsPerPage: number = 10;
  currentPage: number = 1;
  selectedShortLeave: any;
  selectedStatus: string = '';
  extractedUrl: string = '';
  currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

  constructor(
    private modalService: NgbModal,
    public leaveService: LeaveService,
    private dialog: MatDialog,
    private exportService: ExportService,
    private commonService: CommonService,
    private toast: ToastrService,
    private translate: TranslateService,
    private datePipe: DatePipe,
    private router: Router
  ) {
    this.translate.setDefaultLang('en');
  }

  ngOnInit() {
    this.commonService.populateUsers().subscribe({
      next: (result: any) => {
        this.allAssignee = result?.data?.data || [];
        this.getShortLeaves();
      },
      error: () => {
        this.toast.error(this.translate.instant('leave.errorFetchingUsers'));
      }
    });

    const fullUrl = this.router.url;
    const basePath = '/home/leave/';
    if (fullUrl.includes(basePath)) {
      this.extractedUrl = fullUrl.split(basePath)[1];
    }
  }

  getShortLeaves() {
    const requestBody = {
      skip: ((this.currentPage - 1) * this.recordsPerPage).toString(),
      next: this.recordsPerPage.toString(),
      status: this.status
    };
    if (this.extractedUrl !== 'my-short-leave') {
      this.leaveService.getShortLeave(requestBody).subscribe({
        next: (leaves: any) => {
          this.totalRecords = leaves.total;
          this.shortLeave = leaves.data.map((leave: any) => ({
            ...leave,
            employeeName: this.getUser(leave.employee),
            date: this.datePipe.transform(leave.date, 'MMM d, yyyy'),
            startTime: this.datePipe.transform(leave.startTime, 'h:mm a'),
            endTime: this.datePipe.transform(leave.endTime, 'h:mm a'),
            start: leave.startTime,
            end: leave.endTime,
            Date: leave.date
          }));
        },
        error: () => {
          this.toast.error(this.translate.instant('leave.errorFetchingShortLeaves'));
        }
      });
    } else {
      this.leaveService.getShortLeaveByUserId(this.currentUser?.id, requestBody).subscribe({
        next: (leaves: any) => {
          this.totalRecords = leaves.total;
          this.shortLeave = leaves.data.map((leave: any) => ({
            ...leave,
            employeeName: this.getUser(leave.employee),
            date: this.datePipe.transform(leave.date, 'MMM d, yyyy'),
            startTime: this.datePipe.transform(leave.startTime, 'h:mm a'),
            endTime: this.datePipe.transform(leave.endTime, 'h:mm a'),
            start: leave.startTime,
            end: leave.endTime,
            Date: leave.date
          }));
        },
        error: () => {
          this.toast.error(this.translate.instant('leave.errorFetchingUserShortLeaves'));
        }
      });
    }
  }

  onClose(event: any) {
    if (event) {
      this.modalService.dismissAll();
    }
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.getShortLeaves();
  }

  onRecordsPerPageChange(recordsPerPage: number) {
    this.recordsPerPage = recordsPerPage;
    this.getShortLeaves();
  }

  refreshShortLeaveTable() {
    const requestBody = {
      status: this.status,
      skip: ((this.currentPage - 1) * this.recordsPerPage).toString(),
      next: this.recordsPerPage.toString()
    };
    this.leaveService.getShortLeave(requestBody).subscribe({
      next: (res: any) => {
        this.totalRecords = res.total;
        this.shortLeave = res.data.map((leave: any) => ({
          ...leave,
          employeeName: this.getUser(leave.employee),
          date: this.datePipe.transform(leave.date, 'MMM d, yyyy'),
          startTime: this.datePipe.transform(leave.startTime, 'h:mm a'),
          endTime: this.datePipe.transform(leave.endTime, 'h:mm a'),
          start: leave.startTime,
          end: leave.endTime
        }));
      },
      error: () => {
        this.toast.error(this.translate.instant('leave.errorRefreshingTable'));
      }
    });
  }

  exportToCsv() {
    const dataToExport = this.shortLeave.map((shortLeave) => ({
      employee: this.getUser(shortLeave.employee),
      startTime: shortLeave.startTime,
      endTime: shortLeave.endTime,
      durationInMinutes: shortLeave.durationInMinutes,
      status: this.translate.instant(`leave.status.${shortLeave.status.toLowerCase()}`),
      comments: shortLeave.comments
    }));
    this.exportService.exportToCSV(
      this.translate.instant('leave.csvFileName'),
      this.translate.instant('leave.csvSheetName'),
      dataToExport
    );
    this.toast.success(this.translate.instant('leave.successCsvExport'));
  }

  open(content: any) {
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', backdrop: 'static' }).result.then(
      (result) => {
        this.closeResult = this.translate.instant('leave.modalClosedWith', { result });
      },
      (reason) => {
        this.closeResult = this.translate.instant('leave.modalDismissed', { reason: this.getDismissReason(reason) });
      }
    );
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return this.translate.instant('leave.dismissReasonEsc');
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return this.translate.instant('leave.dismissReasonBackdrop');
    } else {
      return this.translate.instant('leave.dismissReasonOther', { reason });
    }
  }

  openSecondModal(selectedReport: any): void {
    const userName = this.getUser(selectedReport.employee);
    selectedReport.employee = userName;
    this.leaveService.leave.next(selectedReport);
    const dialogRef = this.dialog.open(ViewShortLeaveComponent, {
      width: '50%',
      data: { report: selectedReport }
    });
    dialogRef.afterClosed().subscribe(() => {
    });
  }

  deleteLeaveApplication(_id: string) {
    this.leaveService.deleteShortLeave(_id).subscribe({
      next: () => {
        const index = this.shortLeave.findIndex(temp => temp._id === _id);
        if (index !== -1) {
          this.shortLeave.splice(index, 1);
        }
        this.toast.success(this.translate.instant('leave.successDeleteShortLeave'));
      },
      error: () => {
        this.toast.error(this.translate.instant('leave.errorDeleteShortLeave'));
      }
    });
  }

  deleteDialog(id: string): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: { message: this.translate.instant('leave.confirmDelete') }
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'delete') {
        this.deleteLeaveApplication(id);
      }
    });
  }

  getUser(employeeId: string): string {
    const matchingUser = this.allAssignee?.find(user => user._id === employeeId);
    return matchingUser ? `${matchingUser.firstName} ${matchingUser.lastName}` : '';
  }
}