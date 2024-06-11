import { Component, Input } from '@angular/core';
import { UpdateRecordComponent } from '../update-record/update-record.component';
import { MatDialog } from '@angular/material/dialog';
import { ExportService } from 'src/app/_services/export.service';
import { ViewRecordComponent } from '../view-record/view-record.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AttendanceService } from 'src/app/_services/attendance.service';
import { AddRecordComponent } from '../add-record/add-record.component';
import { CommonService } from 'src/app/common/common.service';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';
import { ToastrService } from 'ngx-toastr';
import * as moment from 'moment';
@Component({
  selector: 'app-show-record',
  templateUrl: './show-record.component.html',
  styleUrl: './show-record.component.css'
})

export class ShowRecordComponent {
  @Input() actionOptions: { approve: boolean, reject: boolean, cancel: boolean, view: boolean };
  searchText: string = '';
  regularizationRecords: any;
  @Input() status: string;
  portalView = localStorage.getItem('adminView');
  currentUser = JSON.parse(localStorage.getItem('currentUser'));
  allAssignee: any;
  p: number = 1;
  reason: any;
  statusList: status[] = [
    { name: 'Pending',  isChecked: true },
    { name: 'Approved',  isChecked: true },
    { name: 'Cancelled', isChecked: true },
    { name: 'Rejected', isChecked: true }
  ];
  constructor(private dialog: MatDialog,
    private exportService: ExportService,
    private modalService: NgbModal,
    private attendanceService: AttendanceService,
    private commonService: CommonService,
    private toast: ToastrService
  ) { }

  ngOnInit() {
    this.commonService.populateUsers().subscribe(result => {
      this.allAssignee = result && result.data && result.data.data;
    });
    this.getAllRegularization();
    this.getAllRegularizationReason();
  }
  getUser(employeeId: string) {
    const matchingUser = this.allAssignee?.find(user => user._id === employeeId);
    return matchingUser ? `${matchingUser.firstName} ${matchingUser.lastName}` : 'N/A';
  }

  getReason(reasonId: string) {
    const matchingReason = this.reason?.find(res => res._id === reasonId);
    return matchingReason ? matchingReason?.label : 'N/A';
  }

  getAllRegularizationReason() {
    // this.attendanceService.getRegularizationReason().subscribe((res: any) => {
    //   this.reason = res.data;
    // })
  }

  getAllRegularization() {
    if(this.portalView == 'admin'){this.attendanceService.getAllRegularization().subscribe((res: any) => {
      this.regularizationRecords = res.data.filter(data => data.status === this.status);
    });}
    else {
      this.attendanceService.getRegularizationByUser(this.currentUser?.id).subscribe((res: any) => {
        this.regularizationRecords = res.data;
      })
    }
  }
  openAddModal(): void {

    const dialogRef = this.dialog.open(AddRecordComponent, {
      width: '650px',
      height: 'auto'
    });
    dialogRef.afterClosed().subscribe(result => {
      this.regularizationRequestRefreshed();
      console.log('The modal was closed');
    });
  }
  openStatusModal(report: any, status: string): void {
    report.status = status;
    this.attendanceService.status.next(report);
    const dialogRef = this.dialog.open(UpdateRecordComponent, {
      width: '50%',
      data: { report }
    });
    dialogRef.afterClosed().subscribe(result => {
      this.regularizationRequestRefreshed();
      console.log('The modal was closed');
    });
  }
  regularizationRequestRefreshed() {
    this.getAllRegularization();
  }

  openSecondModal(selectedReport: any): void {
    this.getUser(selectedReport.user);
    selectedReport.user = this.getUser(selectedReport.user);
    selectedReport.reason = this.getReason(selectedReport.reason);
    console.log(selectedReport)
    this.attendanceService.status.next(selectedReport);
    const dialogRef = this.dialog.open(ViewRecordComponent, {
      width: '50%',
      data: { report: selectedReport }
    });
    dialogRef.afterClosed().subscribe(result => {
    });
  }

  exportToCsv() {
    const dataToExport = this.regularizationRecords;
    this.exportService.exportToCSV('Leave Grant', 'Leave Grant', dataToExport);
  }

  onClose(event) {
    if (event) {
      this.modalService.dismissAll();
    }
  }
  deleteRequest(id: string) {
    this.attendanceService.deleteRegularization(id).subscribe((res: any) => {
      this.getAllRegularization();
      this.toast.success('Successfully Deleted!!!', 'Regularization Request');
    },
      (err) => {
        this.toast.error('This Regularization Request Can not be deleted', 'Error')
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