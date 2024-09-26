import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { ExportService } from 'src/app/_services/export.service';
import { LeaveService } from 'src/app/_services/leave.service';
import { CommonService } from 'src/app/_services/common.Service';
import { UpdateShortLeaveComponent } from '../update-short-leave/update-short-leave.component';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';
import { ViewShortLeaveComponent } from '../view-short-leave/view-short-leave.component';

@Component({
  selector: 'app-show-short-leave',
  templateUrl: './show-short-leave.component.html',
  styleUrl: './show-short-leave.component.css'
})
export class ShowShortLeaveComponent {
  @Input() actionOptions: { approve: boolean, reject: boolean, delete: boolean, view: boolean };
  @Input() status: string;
  shortLeave: any;
  closeResult: string = '';
  searchText: string = '';
  allAssignee: any;
  public sortOrder: string = '';
  @Input() tab: number;
  portalView = localStorage.getItem('adminView');
  totalRecords: number = 0 // example total records
  recordsPerPage: number = 10;
  currentPage: number = 1;


  constructor(private modalService: NgbModal,
    public leaveService: LeaveService,
    private dialog: MatDialog,
    private exportService: ExportService,
    private commonService: CommonService,
    private toast: ToastrService) { }

  ngOnInit() {
    this.commonService.populateUsers().subscribe(result => {
      this.allAssignee = result && result.data && result.data.data;
    });
    this.getShortLeaves();
  }

  getShortLeaves() {
    const requestBody = {
      "skip": ((this.currentPage - 1) * this.recordsPerPage).toString(),
      "next": this.recordsPerPage.toString(),
      "status": this.status };
    this.leaveService.getShortLeave(requestBody).subscribe((res: any) => {
      if(res.status==='success') {
        this.shortLeave = res.data;
        this.totalRecords = res.total;
      }
    })
  }

  onClose(event) {
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

  openStatusModal(report: any, status: string): void {
    report.status = status;
    this.leaveService.leave.next(report);
    const dialogRef = this.dialog.open(UpdateShortLeaveComponent, {
      width: '50%',
      data: { report }
    });
    dialogRef.afterClosed().subscribe(result => {
    });
  }

  refreshShortLeaveTable() {
    const requestBody = { "status": this.status, "skip": ((this.currentPage - 1) * this.recordsPerPage).toString(), "next": this.recordsPerPage.toString() };
    this.leaveService.getShortLeave(requestBody).subscribe(
      (res) => {
        this.shortLeave = res.data;
        this.totalRecords = res.total;
      },
      (error) => {
        console.error('Error refreshing short leave table:', error);
      }
    );
  }

  exportToCsv() {
     const dataToExport = this.shortLeave.map((shortLeave) => ({
      employee: this.getUser(shortLeave.employee),
      startTime: shortLeave.startTime,
      endTime: shortLeave.endTime,
      durationInMinutes: shortLeave.durationInMinutes,
      status: shortLeave.status,
      comments: shortLeave.comments,
    }));

    this.exportService.exportToCSV('Short-Leave', 'Short-Leave', dataToExport);
  }

  open(content: any) {
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title',  backdrop: 'static' }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }
  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
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
    dialogRef.afterClosed().subscribe(result => {
    });
  }

  deleteLeaveApplication(_id: string) {
    this.leaveService.deleteShortLeave(_id).subscribe((res: any) => {
      const index = this.shortLeave.findIndex(temp => temp._id === _id);
      if (index !== -1) {
        this.shortLeave.splice(index, 1);
      }
      this.toast.success('Successfully Deleted!!!', 'Short Leave')
    },
      (err) => {
        this.toast.error('Short Leave can not be deleted'
          , 'Error')
      })
  }

  deleteDialog(id: string): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'delete') {
        this.deleteLeaveApplication(id);
      }
    });
  }

  getUser(employeeId: string) {
    const matchingUser = this.allAssignee?.find(user => user._id === employeeId);
    return matchingUser ? `${matchingUser.firstName} ${matchingUser.lastName}` : '';
  }

}
