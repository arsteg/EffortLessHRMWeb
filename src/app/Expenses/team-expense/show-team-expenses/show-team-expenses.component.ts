import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ExpensesService } from 'src/app/_services/expenses.service';
import { ViewReportsComponent } from '../../advance-reports/view-reports/view-reports.component';
import { CommonService } from 'src/app/_services/common.Service';
import { MatDialog } from '@angular/material/dialog';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ViewReportComponent } from '../../expense-reports/view-report/view-report.component';

@Component({
  selector: 'app-show-team-expenses',
  templateUrl: './show-team-expenses.component.html',
  styleUrl: './show-team-expenses.component.css'
})
export class ShowTeamExpensesComponent {
  closeResult: string = '';
  p: number = 1;
  step: number = 1;
  searchText: string = '';
  isEdit: boolean = false;
  changeMode: 'Add' | 'Update' = 'Add';
  @Output() expenseTemplateReportRefreshed: EventEmitter<void> = new EventEmitter<void>();
  @Input() actionOptions: { approve: boolean, reject: boolean, cancel: boolean, view: boolean, edit: boolean };
  @Input() status: string;
  expenseReport: any;
  allAssignee: any[];
  allCategory: any[];
  public sortOrder: string = '';
  totalAmount: number = 0;
  totalRecords: number
  recordsPerPage: number = 10;
  currentPage: number = 1;
  selectedReport: any;
  updateExpenseReport: FormGroup;
  @Input() selectedTab: number;

  constructor(private modalService: NgbModal,
    private expenseService: ExpensesService,
    private commonService: CommonService,
    private dialog: MatDialog,
    private fb: FormBuilder) {
    this.updateExpenseReport = this.fb.group({
      employee: [''],
      title: [''],
      status: [''],
      primaryApprovalReason: [''],
      secondaryApprovalReason: ['']
    })
  }

  ngOnInit() {
    this.getExpenseReport();
    this.commonService.populateUsers().subscribe(result => {
      this.allAssignee = result && result.data && result.data.data;
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
  open(content: any) {
    this.expenseService.expenseReportExpense.next(this.selectedReport);
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', backdrop: 'static' }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }
  onChangeStep(event) {
    this.step = event;
  }
  onChangeMode(event) {
    if (this.isEdit = true) {
      this.changeMode = event
    }
  }
  onClose(event) {
    if (event) {
      this.modalService.dismissAll();
    }
  }
  refreshExpenseReportTable() {
    // this.expenseService.getExpenseReport().subscribe(
    //   (res) => {
    //     this.expenseReport = res.data;
    //     this.expenseTemplateReportRefreshed.emit();
    //   },
    //   (error) => {
    //     console.error('Error refreshing expense template table:', error);
    //   }
    // );
  }
  onPageChange(page: number) {
    this.currentPage = page;
    this.getExpenseReport();
  }

  onRecordsPerPageChange(recordsPerPage: number) {
    this.recordsPerPage = recordsPerPage;
    this.getExpenseReport();
  }

  getExpenseReport() {
    let pagination = {
      skip: ((this.currentPage - 1) * this.recordsPerPage).toString(),
      next: this.recordsPerPage.toString(),
      status: this.status
    };

    this.expenseService.getExpenseReportByTeam(pagination).subscribe((res: any) => {
      this.expenseReport = res.data.map((report) => {
        return {
          ...report,
          employeeName: this.getUser(report?.employee)
        };
      });
      this.totalAmount = this.expenseReport.reduce((total, report) => total + report.amount, 0);
      this.totalRecords = res.total;
    });
  }

  updateApprovedReport() {
    let id = this.selectedReport._id;
    console.log(id)
    let payload = {
      employee: this.selectedReport.employee,
      title: this.selectedReport.title,
      status: 'Approved',
      primaryApprovalReason: this.updateExpenseReport.value.primaryApprovalReason,
      secondaryApprovalReason: ''
    }
    console.log(id, payload);
    this.expenseService.updateExpenseReport(id, payload).subscribe((res: any) => {
      this.expenseReport = this.expenseReport.filter(report => report._id !== id);
    })
  }

  updateRejectedReport() {
    let id = this.selectedReport._id;
    let payload = {
      employee: this.selectedReport.employee,
      title: this.selectedReport.title,
      status: 'Rejected',
      primaryApprovalReason: this.updateExpenseReport.value.primaryApprovalReason,
      secondaryApprovalReason: ''
    }
    this.expenseService.updateExpenseReport(id, payload).subscribe((res: any) => {
      this.expenseReport = this.expenseReport.filter(report => report._id !== id);
    })
  }

  getCategory(categoryId: string) {
    const matchingCategory = this.allCategory?.find(category => category._id === categoryId);
    return matchingCategory ? `${matchingCategory.label}` : 'Category Not Found';
  }

  getUser(employeeId: string) {
    const matchingUser = this.allAssignee?.find(user => user._id === employeeId);
    return matchingUser ? `${matchingUser.firstName} ${matchingUser.lastName}` : 'User Not Found';
  }
  openSecondModal(selectedReport: any): void {
    console.log(selectedReport)
    const userName = this.getUser(selectedReport.employee);
    const categoryLabel = this.getCategory(selectedReport.category);
    selectedReport.employee = userName;
    selectedReport.category = categoryLabel;
    console.log(selectedReport);
    const dialogRef = this.dialog.open(ViewReportComponent, {
      width: '50%',
      data: { report: selectedReport }
    });
    dialogRef.afterClosed().subscribe(result => {
    });
  }

  calculateTotalAmount(expenseReport: any): number {
    let totalAmount = 0;
    totalAmount += expenseReport.amount || 0;
    if (expenseReport.expenseReportExpense && expenseReport.expenseReportExpense.length > 0) {
      for (const expense of expenseReport.expenseReportExpense) {
        totalAmount += expense.amount;
      }
    }
    return totalAmount;
  }
  calculateTotalisReimbursable(expenseReport: any, isReimbursable: boolean, isBillable: boolean): number {
    let totalAmount = 0;
    if (expenseReport.expenseReportExpense && expenseReport.expenseReportExpense.length > 0) {
      for (const expense of expenseReport.expenseReportExpense) {
        if (expense.isReimbursable === isReimbursable) {
          totalAmount += expense.amount;
        }
        else if (expense.isBillable === isBillable) {
          totalAmount += expense.amount;
        }
      }
    }
    return totalAmount;
  }

}
