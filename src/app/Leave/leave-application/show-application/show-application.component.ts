import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { LeaveService } from 'src/app/_services/leave.service';
import { UpdateApplicationComponent } from '../update-application/update-application.component';
import { MatDialog } from '@angular/material/dialog';
import { ExportService } from 'src/app/_services/export.service';
import { ViewApplicationComponent } from '../view-application/view-application.component';
import { CommonService } from 'src/app/_services/common.Service';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';
import { ToastrService } from 'ngx-toastr';
import { FormControl } from '@angular/forms';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-show-application',
  templateUrl: './show-application.component.html',
  styleUrl: './show-application.component.css'
})
export class ShowApplicationComponent {
  leaveApplication: any;
  @Input() status: string;
  closeResult: string = '';
  searchText: string = '';
  @Input() actionOptions: { approve: boolean, reject: boolean, delete: boolean, view: boolean };
  allAssignee: any;
  leaveCategories: any;
  dateControl = new FormControl();
  @Input() tab: number;
  portalView = localStorage.getItem('adminView');
  totalLeaveDays;
  currentUser = JSON.parse(localStorage.getItem('currentUser'));
  public sortOrder: string = '';
  defaultCatSkip = "0";
  defaultCatNext = "100000";
  totalRecords: number = 0
  recordsPerPage: number = 10;
  currentPage: number = 1;

  constructor(private modalService: NgbModal,
    private leaveService: LeaveService,
    private dialog: MatDialog,
    private exportService: ExportService,
    private commonService: CommonService,
    private toast: ToastrService,
    private cdr: ChangeDetectorRef,
    private datePipe: DatePipe
  ) { }

  ngOnInit() {
    this.commonService.populateUsers().subscribe(result => {
      this.allAssignee = result && result.data && result.data.data;
    });
    this.getLeaveApplication();
    this.getleaveCatgeories();
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.getLeaveApplication();
  }

  onRecordsPerPageChange(recordsPerPage: number) {
    this.recordsPerPage = recordsPerPage;
    this.getLeaveApplication();
  }

  onClose(event) {
    if (event) {
      this.modalService.dismissAll();
    }
  }

  openStatusModal(report: any, status: string): void {
    report.status = status;
    console.log(report)
    this.leaveService.leave.next(report);
    const dialogRef = this.dialog.open(UpdateApplicationComponent, {
      width: '50%',
      data: { report }
    });
    dialogRef.afterClosed().subscribe(result => {
      this.refreshLeaveApplicationTable(result);
    });
  }

  refreshLeaveApplicationTable(data: any) {
    data.totalLeaveDays = this.calculateTotalLeaveDays(data);
    this.leaveApplication.push(data);
  }

  exportToCsv() {
    const dataToExport = this.leaveApplication
    this.exportService.exportToCSV('Leave Application', 'Leave Application', dataToExport);
  }

  open(content: any) {
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', backdrop: 'static' }).result.then((result) => {
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
    // const userName = this.getUser(selectedReport?.employee);
    // selectedReport.employee = userName;
    console.log(selectedReport)
    this.leaveService.leave.next(selectedReport);
    const dialogRef = this.dialog.open(ViewApplicationComponent, {
      width: '50%',
      data: { report: selectedReport }
    });
    dialogRef.afterClosed().subscribe(result => {
    this.getLeaveApplication();
    });
  }

  getleaveCatgeories() {
    const requestBody = { "skip": this.defaultCatSkip, "next": this.defaultCatNext };
    this.leaveService.getAllLeaveCategories(requestBody).subscribe((res: any) => {
      this.leaveCategories = res.data;
    })
  }

  getUser(employeeId: string) {
    const matchingUser = this.allAssignee?.find(user => user._id === employeeId);
    return matchingUser ? `${matchingUser.firstName} ${matchingUser.lastName}` : '';
  }

  getCategory(categoryId: string) {
    const matchingCategory = this.leaveCategories?.find(category => category?._id === categoryId);
    return matchingCategory ? matchingCategory?.label : '';
  }

  trackByLeaveId(index: number, leave: any): string {
    return leave._id;
  }
  
  calculateTotalLeaveDays(leave) {
    const startDate = new Date(leave.startDate);
    const endDate = new Date(leave.endDate);
    const timeDifference = endDate.getTime() - startDate.getTime();
    let totalDays = Math.abs(Math.round(timeDifference / (1000 * 3600 * 24))) + 1;
    if (leave.isHalfDayOption) {
      if (startDate.toDateString() === endDate.toDateString()) {
        totalDays = 0.5;
      } else {
        totalDays -= 0.5;
      }
    }
    return totalDays;
  }  

  getLeaveApplication() {
    // if (this.portalView === 'admin') {
    const requestBody = {
      "status": this.status,
      "skip": ((this.currentPage - 1) * this.recordsPerPage).toString(),
      "next": this.recordsPerPage.toString()
    };
    if (this.portalView === 'admin') {
      this.leaveService.getLeaveApplication(requestBody).subscribe((res: any) => {
        this.leaveApplication = res.data;
        this.totalRecords = res.total;
        this.leaveApplication = res.data.map((leave: any) => {
          leave.totalLeaveDays = this.calculateTotalLeaveDays(leave);
          return {
            ...leave,
            employeeName: this.getUser(leave.employee),
            startDate: this.datePipe.transform(leave.startDate, 'MMM d, yyyy'),
            endDate: this.datePipe.transform(leave.endDate, 'MMM d, yyyy')
          };
        });
      });
    }

    else if (this.portalView === 'user') {
      const employeeId = this.currentUser.id;
      this.leaveService.getLeaveApplicationbyUser(requestBody, employeeId).subscribe((res: any) => {
        this.leaveApplication = res.data.filter(leave => leave.status === this.status);
        this.leaveApplication.forEach(leave => {
          leave.totalLeaveDays = this.calculateTotalLeaveDays(leave);
        });
      });
    }

    else if (this.tab === 5) {
      this.leaveService.getLeaveApplicationByTeam().subscribe((res: any) => {
        this.leaveApplication = res.data.filter(leave => leave.status === this.status);
        this.totalLeaveDays = 0;
        this.leaveApplication.forEach(leave => {
          leave.totalLeaveDays = this.calculateTotalLeaveDays(leave);
        });
      });
    }
  }

  deleteLeaveApplication(_id: string) {
    this.leaveService.deleteLeaveApplication(_id).subscribe((res: any) => {
      const index = this.leaveApplication.findIndex(temp => temp._id === _id);
      if (index !== -1) {
        this.leaveApplication.splice(index, 1);
      }
      this.toast.success('Successfully Deleted!!!', 'Leave Application')
    }, (err) => {
      this.toast.error('Leave Application can not be deleted'
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

  checkForApproval(leavecategory: any) {
    return true;
  }
}