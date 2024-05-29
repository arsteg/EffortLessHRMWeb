import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AttendanceService } from 'src/app/_services/attendance.service';
import { ExportService } from 'src/app/_services/export.service';
import { ViewOnDutyComponent } from '../view-on-duty/view-on-duty.component';
import { UpdateOnDutyComponent } from '../update-on-duty/update-on-duty.component';
import { AddOnDutyComponent } from '../add-on-duty/add-on-duty.component';

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

  constructor(private dialog: MatDialog,
    private exportService: ExportService,
    private modalService: NgbModal,
    private attendanceService: AttendanceService
  ) { }

  ngOnInit() {
    this.getAllOnDutyRequest();
  }

  getAllOnDutyRequest() {
    this.attendanceService.getAllOnDutyRequests().subscribe((res: any) => {
      this.onDutyRequest = res.data.filter(data => data.status === this.status);
    })
  }

  refreshLeaveGrantTable() {
    // this.leaveService.getLeaveGrant().subscribe(
    //   (res) => {
    //     this.leaveGrant = res.data.filter(leave => leave.status === this.status);
    //   },
    //   (error) => {
    //     console.error('Error refreshing leave grant table:', error);
    //   }
    // );
  }
  exportToCsv() {
    const dataToExport = this.onDutyRequest;
    this.exportService.exportToCSV('Leave Grant', 'Leave Grant', dataToExport);
  }

  onClose(event) {
    if (event) {
      this.modalService.dismissAll();
    }
  }
  openSecondModal(selectedReport: any): void {
    // const userName = this.getUser(selectedReport.employee);
    // selectedReport.employee = userName;
    // this.leaveService.leave.next(selectedReport);
    const dialogRef = this.dialog.open(ViewOnDutyComponent, {
      width: '50%',
      data: { report: selectedReport }
    });
    dialogRef.afterClosed().subscribe(result => {
    });
  }

  openStatusModal(report: any, status: string): void {
    report.status = status;
    console.log(report)
    // this.leaveService.leave.next(report);
    const dialogRef = this.dialog.open(UpdateOnDutyComponent, {
      width: '50%',
      data: { report }
    });
    dialogRef.afterClosed().subscribe(result => {
      this.refreshLeaveGrantTable();
      console.log('The modal was closed');
    });
  }

  openAddModal(): void {

    const dialogRef = this.dialog.open(AddOnDutyComponent, {
      width: '650px',
      height: 'auto'
    });
    dialogRef.afterClosed().subscribe(result => {
      this.refreshLeaveGrantTable();
      console.log('The modal was closed');
    });
  }

}
