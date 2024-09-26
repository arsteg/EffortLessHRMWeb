import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { UserService } from 'src/app/_services/users.service';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-salary-details',
  templateUrl: './salary-details.component.html',
  styleUrl: './salary-details.component.css'
})
export class SalaryDetailsComponent {
  searchText: string = '';
  isEdit: boolean = false;
  selectedRecord: any;
  salaryDetails: any;
  closeResult: string;
  showViewSalaryDetails: boolean = false;
  showAddSalaryDetails: boolean = false;
  selectedUser = this.userService.getData();

  constructor(
    private modalService: NgbModal,
    private userService: UserService,
    private toast: ToastrService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.userService.getSalaryByUserId(this.selectedUser.id).subscribe((res: any) => {
      this.salaryDetails = res.data;
      this.showViewSalaryDetails = true;
    })
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

  open(content: any) {
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title',  backdrop: 'static' }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  deleteSalaryDetail(id: string): void {
    console.log(id);
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',

    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'delete') {
        this.deleteSalary(id);
      }
      err => {
        this.toast.error('Can not be Deleted', 'Error!')
      }
    });
  }

  deleteSalary(id: string) {
    this.userService.deleteSalaryDetails(id).subscribe((res: any) => {
      this.getSalaryDetails();
      this.toast.success('Successfully Deleted!!!', 'Salary Details')
    },
      (err) => {
        this.toast.error('This Salary Details is already being used!'
          , 'Salary Details, Can not be deleted!')
      })
  }

  toggleToViewSalaryDetails() {
    this.showViewSalaryDetails = !this.showViewSalaryDetails;
  }

  goBackToSalaryDetails() {
    this.showViewSalaryDetails = false;
    this.showAddSalaryDetails = false;
    this.getSalaryDetails();
  }

  getSalaryDetails() {
    this.userService.getSalaryByUserId(this.selectedUser.id).subscribe((res: any) => {
      this.salaryDetails = res.data;
      this.showViewSalaryDetails = true;
    })
  }
}