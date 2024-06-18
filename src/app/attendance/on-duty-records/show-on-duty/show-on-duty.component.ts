import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AttendanceService } from 'src/app/_services/attendance.service';
import { ExportService } from 'src/app/_services/export.service';
import { ViewOnDutyComponent } from '../view-on-duty/view-on-duty.component';
import { UpdateOnDutyComponent } from '../update-on-duty/update-on-duty.component';
import { AddOnDutyComponent } from '../add-on-duty/add-on-duty.component';
import { CommonService } from 'src/app/common/common.service';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-show-on-duty',
  templateUrl: './show-on-duty.component.html',
  styleUrl: './show-on-duty.component.css'
})
export class ShowOnDutyComponent {
  @Input() actionOptions: { approve: boolean, reject: boolean, cancel: boolean, view: boolean };
  searchText: string = '';
  onDutyRequest: any;
  @Input() status: string;
  portalView = localStorage.getItem('adminView');
  currentUser = JSON.parse(localStorage.getItem('currentUser'));
  allAssignee: any;
  onDutyReason: any;
  p: number = 1;
  statusList: status[] = [
    { name: 'Pending', isChecked: true },
    { name: 'Approved', isChecked: true },
    { name: 'Cancelled', isChecked: true },
    { name: 'Rejected', isChecked: true }
  ];
  totalRecords: number
  recordsPerPage: number = 10;
  currentPage: number = 1;

  constructor(private dialog: MatDialog,
    private exportService: ExportService,
    private modalService: NgbModal,
    private attendanceService: AttendanceService,
    private commonService: CommonService,
    private toast: ToastrService
  ) { }

  ngOnInit() {
    this.loadRecords();
    this.getOnDutyReason();
    this.commonService.populateUsers().subscribe(result => {
      this.allAssignee = result && result.data && result.data.data;
    });
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.loadRecords();
  }

  onRecordsPerPageChange(recordsPerPage: number) {
    this.recordsPerPage = recordsPerPage;
    this.loadRecords();
  }


  loadRecords() {
    const pagination = {
      skip: ((this.currentPage - 1) * this.recordsPerPage).toString(),
      next: this.recordsPerPage.toString(),
      status: this.status
    };
    if (this.portalView == 'admin') {
      this.attendanceService.getAllOnDutyRequests(pagination).subscribe((res: any) => {
        this.onDutyRequest = res.data;
      })
    }
    else {
      this.attendanceService.getAllOnDutyRequestsByUser(this.currentUser.id, pagination?.skip, pagination.next).subscribe((res: any) => {
        this.onDutyRequest = res.data;
      })
    }
  }

  requestRefreshed() {
    this.loadRecords();
  }

  exportToCsv() {
    const dataToExport = this.onDutyRequest;
    this.exportService.exportToCSV('OnDutyRequest', 'OnDutyRequest', dataToExport);
  }

  onClose(event) {
    if (event) {
      this.modalService.dismissAll();
    }
  }
  openSecondModal(selectedReport: any): void {
    const reason = this.getReason(selectedReport.onDutyReason);
    selectedReport.onDutyReason = reason;
    this.attendanceService.status.next(selectedReport);
    const dialogRef = this.dialog.open(ViewOnDutyComponent, {
      width: '50%',
      data: { report: selectedReport }
    });
    dialogRef.afterClosed().subscribe(result => {
    });
  }

  openStatusModal(report: any, status: string): void {
    report.status = status;
    this.attendanceService.status.next(report);
    const dialogRef = this.dialog.open(UpdateOnDutyComponent, {
      width: '50%',
      data: { report }
    });
    dialogRef.afterClosed().subscribe(result => {
      this.requestRefreshed();
      console.log('The modal was closed');
    });
  }

  openAddModal(): void {

    const dialogRef = this.dialog.open(AddOnDutyComponent, {
      width: '100%',
      height: 'auto'
    });
    dialogRef.afterClosed().subscribe(result => {
      this.requestRefreshed();
      console.log('The modal was closed');
    });
  }

  getUser(employeeId: string) {
    const matchingUser = this.allAssignee?.find(user => user._id === employeeId);
    return matchingUser ? `${matchingUser.firstName} ${matchingUser.lastName}` : 'N/A';
  }

  getReason(onDutyReason: string) {
    const reason = this.onDutyReason?.find(res => res._id === onDutyReason);
    return reason ? reason.label : '';
  }

  getOnDutyReason() {
    // this.attendanceService.getDutyReason().subscribe((res: any) => {
    //   this.onDutyReason = res.data;
    // })
  }



  deleteRequest(id: string) {
    this.attendanceService.deleteOnDutyRequest(id).subscribe((res: any) => {
      this.loadRecords();
      this.toast.success('Successfully Deleted!!!', 'OnDuty Request');
    },
      (err) => {
        this.toast.error('This OnDuty Request Can not be deleted', 'Error')
      })
  }

  deleteDialog(id: string): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'delete') {
        this.deleteRequest(id);
      }
      err => {
        this.toast.error('Can not be Deleted', 'Error!')
      }
    });
  }
  isStatusChecked(status: string): boolean {
    const statusItem = this.statusList.find(item => item.name === status);
    return statusItem ? statusItem.isChecked : false;
  }
}
interface status {
  name: string,
  isChecked: boolean
}