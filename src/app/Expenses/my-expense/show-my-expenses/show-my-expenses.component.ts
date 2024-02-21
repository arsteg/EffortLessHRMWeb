import { Component, Output, EventEmitter, Input } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { AuthenticationService } from 'src/app/_services/authentication.service';
import { ExpensesService } from 'src/app/_services/expenses.service';
import { StatusUpdateComponent } from '../../advance-reports/status-update/status-update.component';
import { MatDialog } from '@angular/material/dialog';
import { ViewReportsComponent } from '../../advance-reports/view-reports/view-reports.component';
import { StatusUpdateExpenseComponent } from '../status-update-expense/status-update-expense.component';
import { CommonService } from 'src/app/common/common.service';

@Component({
  selector: 'app-show-my-expenses',
  templateUrl: './show-my-expenses.component.html',
  styleUrl: './show-my-expenses.component.css'
})
export class ShowMyExpensesComponent {
  closeResult: string = '';
  p: number = 1;
  step: number = 1;
  searchText: string = '';
  isEdit: boolean = false;
  changeMode: 'Add' | 'Update' = 'Add';
  @Output() expenseTemplateReportRefreshed: EventEmitter<void> = new EventEmitter<void>();
  @Input() actionOptions: { approve: boolean, reject: boolean, cancel: boolean, view: boolean };
  @Input() status: string;
  expenseReport: any;
  allCategory: any[];
  totalAmount: number = 0;
  allAssignee: any[];

  constructor(private modalService: NgbModal,
    private expenseService: ExpensesService,
    private auth: AuthenticationService,
    private dialog: MatDialog,
    private commonService: CommonService) { }

  ngOnInit() {
    this.getExpenseByUser();
    this.commonService.populateUsers().subscribe(result => {
      this.allAssignee = result && result.data && result.data.data;
    });
    this.expenseService.getExpenseCatgories().subscribe((res: any) => {
      this.allCategory = res.data;
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
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {
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
    console.log('refreshed')
    const user = this.auth.currentUser.subscribe((res: any) => {
      this.expenseService.getExpenseReportByUser(res.id).subscribe((res: any) => {
        this.expenseReport = res.data.filter(expense => expense.status === this.status);
        this.totalAmount = this.expenseReport.reduce((total, report) => total + report.amount, 0);
        this.expenseTemplateReportRefreshed.emit();
      })
    });

   
  }

  getExpenseByUser() {
    const user = this.auth.currentUser.subscribe((res: any) => {
      this.expenseService.getExpenseReportByUser(res.id).subscribe((res: any) => {
        this.expenseReport = res.data.filter(expense => expense.status === this.status);
        this.totalAmount = this.expenseReport.reduce((total, report) => total + report.amount, 0);
      })
    });
  }

  openStatusModal(report: any, status: string): void {
    report.status = status;
    this.expenseService.advanceReport.next(report);
   
      console.log('The modal was closed');
    this.modalService.open(report
      , { ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
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
    this.expenseService.advanceReport.next(selectedReport);
    const dialogRef = this.dialog.open(ViewReportsComponent, {
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

