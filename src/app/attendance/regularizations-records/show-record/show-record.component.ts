import { Component, Input } from '@angular/core';
import { UpdateRecordComponent } from '../update-record/update-record.component';
import { MatDialog } from '@angular/material/dialog';
import { ExportService } from 'src/app/_services/export.service';
import { ViewRecordComponent } from '../view-record/view-record.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AttendanceService } from 'src/app/_services/attendance.service';
import { AddRecordComponent } from '../add-record/add-record.component';

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

  constructor(private dialog: MatDialog,
    private exportService: ExportService,
    private modalService: NgbModal,
    private attendanceService: AttendanceService
  ) { }

  ngOnInit() {
    this.getAllRegularization();
  }

  getAllRegularization() {
    this.attendanceService.getAllRegularization().subscribe((res: any) => {
      this.regularizationRecords = res.data.filter(data => data.status === this.status);
    });
    if (this.portalView === 'user') {
        this.attendanceService.getRegularizationByUser(this.currentUser?.id).subscribe((res: any) => {
          this.regularizationRecords = res.data.filter(data => data.status === this.status);
        })
      
    }
  }
  openAddModal(): void {
    
    const dialogRef = this.dialog.open(AddRecordComponent, {
      width: '650px',
      height: 'auto'
    });
    dialogRef.afterClosed().subscribe(result => {
      this.refreshLeaveGrantTable();
      console.log('The modal was closed');
    });
  }
  openStatusModal(report: any, status: string): void {
    report.status = status;
    console.log(report)
    // this.leaveService.leave.next(report);
    const dialogRef = this.dialog.open(UpdateRecordComponent, {
      width: '50%',
      data: { report }
    });
    dialogRef.afterClosed().subscribe(result => {
      this.refreshLeaveGrantTable();
      console.log('The modal was closed');
    });
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

  openSecondModal(selectedReport: any): void {
    // const userName = this.getUser(selectedReport.employee);
    // selectedReport.employee = userName;
    // this.leaveService.leave.next(selectedReport);
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

}
