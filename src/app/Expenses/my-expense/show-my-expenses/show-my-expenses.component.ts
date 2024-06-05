import { Component, Output, EventEmitter, Input } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { AuthenticationService } from 'src/app/_services/authentication.service';
import { ExpensesService } from 'src/app/_services/expenses.service';
import { StatusUpdateComponent } from '../../advance-reports/status-update/status-update.component';
import { MatDialog } from '@angular/material/dialog';
import { ViewReportsComponent } from '../../advance-reports/view-reports/view-reports.component';
import { CommonService } from 'src/app/common/common.service';
import { ExportService } from 'src/app/_services/export.service';
import { ViewMyExpenseComponent } from '../view-my-expense/view-my-expense.component';

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
  @Input() actionOptions: { view: boolean };
  @Input() status: string;
  expenseReport: any;
  allCategory: any[];
  totalAmount: number = 0;
  allAssignee: any[];
  currentUser = JSON.parse(localStorage.getItem('currentUser'));

  constructor(private modalService: NgbModal,
    private expenseService: ExpensesService,
    private auth: AuthenticationService,
    private dialog: MatDialog,
    private commonService: CommonService,
  private exportService: ExportService) { }

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
      this.expenseService.getExpenseReportByUser(this.currentUser.id).subscribe((res: any) => {
        this.expenseReport = res.data;
        this.totalAmount = this.expenseReport.reduce((total, report) => total + report.amount, 0);
        this.expenseTemplateReportRefreshed.emit();
      })
  }

  getExpenseByUser() {
      this.expenseService.getExpenseReportByUser(this.currentUser.id).subscribe((res: any) => {
        this.expenseReport = res.data;
        this.totalAmount = this.expenseReport.reduce((total, report) => total + report.amount, 0);
      })
  }
  
   getCategory(categoryId: string) {
    const matchingCategory = this.allCategory?.find(category => category._id === categoryId);
    return matchingCategory ? `${matchingCategory.label}` : 'Category Not Found';
  }

  getUser(employeeId: string) {
    const matchingUser = this.allAssignee?.find(user => user._id === employeeId);
    return matchingUser ? `${matchingUser.firstName} ${matchingUser.lastName}` : '';
  }

  openSecondModal(selectedReport: any): void {
    const categoryLabel = this.getCategory(selectedReport.category);
    selectedReport.category = categoryLabel;
    this.expenseService.advanceReport.next(selectedReport);
    const dialogRef = this.dialog.open(ViewMyExpenseComponent, {
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
  exportToCsv() {
    const dataToExport = this.expenseReport.map((report) => {
        let totalAmount = report.amount || 0;
        if (report.expenseReportExpense && report.expenseReportExpense.length > 0) {
            totalAmount += report.expenseReportExpense.reduce((acc, rep) => acc + (rep.amount || 0), 0);
        }
        return {
            title: report.title,
            amount: report?.amount,
            totalAmount: totalAmount,
            isReimbursable: report?.expenseReportExpense[0]?.isReimbursable ? report?.expenseReportExpense[0]?.amount : 0,
            isBillable: report?.expenseReportExpense[0]?.isBillable ? report?.expenseReportExpense[0]?.amount : 0,
            status: report?.status
        };
    });
    this.exportService.exportToCSV('My-Expense-Report', 'My-Expense-Report', dataToExport);
}

}

