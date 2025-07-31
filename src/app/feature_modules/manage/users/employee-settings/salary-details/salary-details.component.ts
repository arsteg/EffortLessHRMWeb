import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { UserService } from 'src/app/_services/users.service';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';
import { forkJoin } from 'rxjs';
import { AuthenticationService } from 'src/app/_services/authentication.service';
import { TranslateService } from '@ngx-translate/core';
import { ActionVisibility, TableColumn } from 'src/app/models/table-column';

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
  showAddButton: boolean = true; // New property to control button visibility

  columns: TableColumn[] = [
    { 
      key: 'enteringAmount', 
      name: this.translate.instant('employee.frequency') 
    },
    { 
      key: 'payrollEffectiveFrom', 
      name: this.translate.instant('employee.ctcEffectiveFrom'),
      valueFn: (row: any) => new Date(row.payrollEffectiveFrom).toLocaleDateString()
    },
    { 
      key: 'grossSalary', 
      name: this.translate.instant('employee.grossSalaryYearly'),
      valueFn: (row: any) => this.calculateTotalAmount(row.enteringAmount, row.Amount)
    },
    {
      key: 'action',
      name: 'Action',
      isAction: true,
      options: [
        { 
          label: 'View', 
          icon: 'eye', 
          visibility: ActionVisibility.LABEL
        },
        { 
          label: 'Delete', 
          icon: 'delete', 
          visibility: ActionVisibility.LABEL,
          hideCondition: (row: any) => !this.showAddButton
        }
      ]
    }
  ];

  constructor(
    private modalService: NgbModal,
    private userService: UserService,
    private toast: ToastrService,
    private dialog: MatDialog,
    private router: Router,
    private translate: TranslateService,
    public authService: AuthenticationService,
    private route: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    this.logUrlSegmentsForUser();
    // Check if the URL contains 'profile'
    this.showAddButton = !this.router.url.includes('profile');
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
        const errorMessage = err?.error?.message || err?.message || err 
        || this.translate.instant('manage.users.employee-settings.failed_salary_details_delete')
        ;
       
        this.toast.error(errorMessage, 'Error!');
      }
    });
  }

  deleteSalary(id: string) {
    this.userService.deleteSalaryDetails(id).subscribe((res: any) => {
      this.getSalaryDetails();
      this.toast.success(this.translate.instant('manage.users.employee-settings.salary_details_deleted'));
      },
      (err) => {
        const errorMessage = err?.error?.message || err?.message || err 
        || this.translate.instant('manage.users.employee-settings.failed_salary_details_delete')
        ;       
        this.toast.error(errorMessage, 'Error!');
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
    const empCode = this.route.parent.snapshot.paramMap.get('empCode') || this.authService.currentUserValue?.empCode;
    if (empCode) {
      this.userService.getUserByEmpCode(empCode).subscribe((res: any) => {
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

  handleAction(event: any) {
    if (event.action.label === 'View') {
      this.isEdit = true ;
      this.selectedRecord = event.row;
      this.showAddSalaryDetails = true;
    } 
    if (event.action.label === 'Delete') {
      this.deleteSalaryDetail(event.row._id);
    }
  }
}