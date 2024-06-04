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


  constructor(private dialog: MatDialog,
    private exportService: ExportService,
    private modalService: NgbModal,
    private attendanceService: AttendanceService,
    private commonService: CommonService,
    private toast: ToastrService
  ) { }

  ngOnInit() {
    if (this.portalView == 'admin') { this.getAllOnDutyRequest(); }
    else {
      this.getOnDutyRequestByuser();
    }
    this.getOnDutyReason();
    this.commonService.populateUsers().subscribe(result => {
      this.allAssignee = result && result.data && result.data.data;
    });
  }

  getAllOnDutyRequest() {
    this.attendanceService.getAllOnDutyRequests().subscribe((res: any) => {
      this.onDutyRequest = res.data.filter(data => data.status === this.status);
    })
  }

  requestRefreshed() {
    if (this.portalView == 'admin') {
      this.attendanceService.getAllOnDutyRequests().subscribe(
        (res) => {
          this.onDutyRequest = res.data.filter(data => data.status === this.status);
          console.log(this.onDutyRequest)
        },
        (error) => {
          console.error('Error refreshing  table:', error);
        }
      );
    }
    else {
      this.getOnDutyRequestByuser();
    }
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
    this.attendanceService.getDutyReason().subscribe((res: any) => {
      this.onDutyReason = res.data;
    })
  }

  getOnDutyRequestByuser() {
    this.attendanceService.getAllOnDutyRequestsByUser(this.currentUser.id).subscribe((res: any) => {
      this.onDutyRequest = res.data;
    })
  }

  deleteRequest(id: string) {
    this.attendanceService.deleteOnDutyRequest(id).subscribe((res: any) => {
      if (this.portalView == 'admin') { this.getAllOnDutyRequest(); }
      else { this.getOnDutyRequestByuser(); }
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
}
