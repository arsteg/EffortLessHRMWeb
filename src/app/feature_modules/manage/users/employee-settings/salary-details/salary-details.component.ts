import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { UserService } from 'src/app/_services/users.service';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-salary-details',
  templateUrl: './salary-details.component.html',
  styleUrls: ['./salary-details.component.css']
})
export class SalaryDetailsComponent {
  searchText: string = '';
  isEdit: boolean = false;
  selectedRecord: any;
  salaryDetails: any;
  closeResult: string;
  showViewSalaryDetails: boolean = false;
  showAddSalaryDetails: boolean = false;
  selectedUser: any;
  public sortOrder: string = '';

  constructor(
    private modalService: NgbModal,
    private userService: UserService,
    private toast: ToastrService,
    private dialog: MatDialog,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.logUrlSegmentsForUser();
  }


  calculateTotalAmount(frequency: string, amount: number): number {
    const frequencyMultiplier: { [key: string]: number } = {
      'Monthly': 12,
      'Quarterly': 4,
      'Half Yearly': 2,
      'Yearly': 1
    };
    const multiplier = frequencyMultiplier[frequency] || 0;
    return amount * multiplier;
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
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', backdrop: 'static' }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  deleteSalaryDetail(id: string): void {
    console.log(id);
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px'
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

  logUrlSegmentsForUser() {
    const urlPath = this.router.url;
    const segments = urlPath.split('/').filter(segment => segment);
    if (segments.length >= 3) {
      const employee = segments[segments.length - 3];
      this.userService.getUserByEmpCode(employee).subscribe((res: any) => {
        this.selectedUser = res.data;
        this.userService.selectedEmployee.next(this.selectedUser[0]);
        this.getSalaryDetails();
      })
    }
  }

  getSalaryDetails() {
    forkJoin([
      this.userService.getSalaryByUserId(this.selectedUser[0]?._id),
      this.userService.getUserList()
    ]).subscribe((results: any[]) => {
      this.salaryDetails = results[0].data;
      this.showViewSalaryDetails = true;
    });
  }
}