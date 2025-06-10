import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { LeaveService } from 'src/app/_services/leave.service';
import { UpdateStatusComponent } from '../update-status/update-status.component';
import { MatDialog } from '@angular/material/dialog';
import { CommonService } from 'src/app/_services/common.Service';
import { ViewLeaveComponent } from '../view-leave/view-leave.component';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';
import { ToastrService } from 'ngx-toastr';
import { ExportService } from 'src/app/_services/export.service';
import { TranslateService } from '@ngx-translate/core';

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
  public sortOrder: string = '';
  totalRecords: number = 0;
  recordsPerPage: number = 10;
  currentPage: number = 1;

  constructor(
    private modalService: NgbModal,
    private leaveService: LeaveService,
    private dialog: MatDialog,
    private commonService: CommonService,
    private toast: ToastrService,
    private exportService: ExportService,
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

  onPageChange(page: number) {
    this.currentPage = page;
    this.getLeaveGrant();
  }

  onRecordsPerPageChange(recordsPerPage: number) {
    this.recordsPerPage = recordsPerPage;
    this.getLeaveGrant();
  }

  getLeaveGrant() {
    const requestBody = {
      "skip": ((this.currentPage - 1) * this.recordsPerPage).toString(),
      "next": this.recordsPerPage.toString(),
      "status": this.status
    };
    if (this.portalView === 'admin') {
      console.log(this.portalView);
      this.leaveService.getLeaveGrant(requestBody).subscribe((res: any) => {
        if (res.status == 'success') {
          this.totalRecords = res.total;
          this.leaveGrant = res.data;
        }
      });
    }
    if (this.portalView === 'user') {
      if (this.tab === 4) {
        this.leaveService.getLeaveGrantByUser(this.currentUser?.id).subscribe((res: any) => {
          this.leaveGrant = res.data.filter(leave => leave.status === this.status);
        });
      } else if (this.tab === 7) {
        this.leaveService.getLeaveGrantByTeam(requestBody).subscribe((res: any) => {
          if (res.status == 'success') {
            this.totalRecords = res.total;
            this.leaveGrant = res.data;
          }
        });
      }
    }
  }

  onClose(event) {
    if (event) {
      this.modalService.dismissAll();
    }
  }

  openStatusModal(report: any, status: string): void {
    report.status = status;
    console.log(report);
    this.leaveService.leave.next(report);
    const dialogRef = this.dialog.open(UpdateStatusComponent, {
      width: '50%',
      data: { report }
    });
    dialogRef.afterClosed().subscribe(result => {
      this.refreshLeaveGrantTable();
      console.log('The modal was closed');
    });
  }

  refreshLeaveGrantTable() {
    const requestBody = {
      "skip": ((this.currentPage - 1) * this.recordsPerPage).toString(),
      "next": this.recordsPerPage.toString(),
      "status": this.status
    };
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
      console.log(this.portalView, this.tab);
      if (this.tab === 4) {
        this.leaveService.getLeaveGrantByUser(this.currentUser?.id).subscribe((res: any) => {
          this.leaveGrant = res.data.filter(leave => leave.status === this.status);
        });
      } else if (this.tab === 7) {
        this.leaveService.getLeaveGrantByTeam(requestBody).subscribe((res: any) => {
          if (res.status == 'success') {
            this.totalRecords = res.total;
            this.leaveGrant = res.data;
          }
        });
      }
    }
  }

  exportToCsv() {
    const dataToExport = this.leaveGrant.map((leave) => ({
      Employee: this.getUser(leave.employee),
      Applied_On: leave.appliedOn,
      Applied_For: leave.date,
      Used_On: leave.usedOn,
      Comment: leave.comment,
      Status: this.translate.instant(`leave.status.${leave.status.toLowerCase()}`)
    }));
    this.exportService.exportToCSV(
      this.translate.instant('leave.csvTitle'),
      this.translate.instant('leave.csvFileName'),
      dataToExport
    );
  }

  open(content: any) {
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', backdrop: 'static' }).result.then(
      (result) => {
        this.closeResult = `Closed with: ${result}`;
      },
      (reason) => {
        this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
      }
    );
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return this.translate.instant('leave.dismissByEsc');
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return this.translate.instant('leave.dismissByBackdrop');
    } else {
      return this.translate.instant('leave.dismissWith', { reason: reason });
    }
  }

  openSecondModal(selectedReport: any): void {
    const userName = this.getUser(selectedReport.employee);
    selectedReport.employee = userName;
    this.leaveService.leave.next(selectedReport);
    const dialogRef = this.dialog.open(ViewLeaveComponent, {
      width: '50%',
      data: { report: selectedReport }
    });
    dialogRef.afterClosed().subscribe(result => {});
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
          this.translate.instant('leave.deleteTitle')
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
}