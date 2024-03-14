import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { LeaveService } from 'src/app/_services/leave.service';
import { UpdateStatusComponent } from '../update-status/update-status.component';
import { MatDialog } from '@angular/material/dialog';
import { CommonService } from 'src/app/common/common.service';
import { ViewLeaveComponent } from '../view-leave/view-leave.component';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';
import { ToastrService } from 'ngx-toastr';

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

  constructor(private modalService: NgbModal,
    private leaveService: LeaveService,
    private dialog: MatDialog,
    private commonService: CommonService,
    private toast: ToastrService) { }

  ngOnInit() {
    this.commonService.populateUsers().subscribe(result => {
      this.allAssignee = result && result.data && result.data.data;
    });
    this.getLeaveGrant();
  }

  getLeaveGrant() {
    this.leaveService.getLeaveGrant().subscribe((res: any) => {
      this.leaveGrant =  res.data.filter(leave => leave.status === this.status);
    });
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
    const dialogRef = this.dialog.open(UpdateStatusComponent, {
      width: '50%',
      data: { report }
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log('The modal was closed');
    });
  }

  refreshLeaveGrantTable() {
    this.leaveService.getLeaveGrant().subscribe(
      (res) => {
        this.leaveGrant = res.data.filter(leave => leave.status === this.status);
        console.log(this.leaveGrant)
      },
      (error) => {
        console.error('Error refreshing expense template table:', error);
      }
    );
  }

  exportToCsv() {
    // const dataToExport = this.advanceReport.map((advance) => ({
    //   employee: this.getUser(advance.employee),
    //   amount: advance?.amount,
    //   status: advance.status,
    //   category: this.getCategory(advance.category),
    //   comment: advance.comment,
    //   primaryApprovalReason:  advance.primaryApprovalReason,
    //   secondaryApprovalReason: advance.secondaryApprovalReason    
    // }));
    // this.exportService.exportToCSV('Advance-Report', 'Advance-Report', dataToExport);
  }

  open(content: any) {
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {
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
    const dialogRef = this.dialog.open(ViewLeaveComponent, {
      width: '50%',
      data: { report: selectedReport }
    });
    dialogRef.afterClosed().subscribe(result => {
    });
  }

  getUser(employeeId: string) {
    const matchingUser = this.allAssignee?.find(user => user._id === employeeId);
    return matchingUser ? `${matchingUser.firstName} ${matchingUser.lastName}` : 'User Not Found';
  }

  deleteLeaveGrant(_id: string) {
    this.leaveService.deleteLeaveGrant(_id).subscribe((res: any) => {
      const index = this.leaveGrant.findIndex(temp => temp._id === _id);
      if (index !== -1) {
        this.leaveGrant.splice(index, 1);
      }
      this.toast.success('Successfully Deleted!!!', 'Leave Grant')
    },
      (err) => {
        this.toast.error('Leave Grant can not be deleted'
          , 'Error')
      })
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
