import { Component, Output, EventEmitter, Input, inject } from '@angular/core';
import { ExpensesService } from 'src/app/_services/expenses.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { CommonService } from 'src/app/_services/common.Service';
import { ExportService } from 'src/app/_services/export.service';
import { ViewReportComponent } from '../../expense-reports/view-report/view-report.component';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-show-my-expenses',
  templateUrl: './show-my-expenses.component.html',
  styleUrl: './show-my-expenses.component.css'
})
export class ShowMyExpensesComponent {
  private readonly translate = inject(TranslateService);
  closeResult: string = '';
  p: number = 1;
  step: number = 1;
  searchText: string = '';
  isEdit: boolean = false;
  changeMode: 'Add' | 'Update' = 'Add';
  @Input() actionOptions: { view: boolean };
  @Input() status: string;
  expenseReport: any;
  allCategory: any[];
  totalAmount: number = 0;
  allAssignee: any[];
  currentUser = JSON.parse(localStorage.getItem('currentUser'));
  totalRecords: number;
  recordsPerPage: number = 10;
  currentPage: number = 1;
  @Input() selectedTab: number;
  selectedReport;
  displayedColumns: string[] = ['title', 'totalAmount', 'amount', 'reimbursable', 'billable', 'status', 'actions'];
  dataSource: any = new MatTableDataSource([]);
  dialogRef: MatDialogRef<any>;

  constructor(
    private expenseService: ExpensesService,
    private dialog: MatDialog,
    private commonService: CommonService,
    private exportService: ExportService) { }

  ngOnInit() {
    this.getExpenseByUser();
    this.commonService.populateUsers().subscribe(result => {
      this.allAssignee = result && result.data && result.data.data;
    });
    let payload = {
      next: '',
      skip: ''
    }
    this.expenseService.getExpenseCatgories(payload).subscribe((res: any) => {
      this.allCategory = res.data;
    });
  }

  open(content: any, selectedReport?: any) {
    this.expenseService.tabIndex.next(this.selectedTab);
    if(selectedReport){
      this.selectedReport = selectedReport;
      this.expenseService.expenseReportExpense.next(selectedReport);
    } else {
      this.expenseService.expenseReportExpense.next(null);
    }
    this.dialogRef = this.dialog.open(content, {
      width: '50%',
      disableClose: true
    })
    this.dialogRef.afterClosed().subscribe((result) => {
      this.expenseService.expenseReportExpense.next(null);
      this.expenseService.selectedReport.next(null);
    });
  }

  onChangeStep(event) {
    this.selectedTab
    this.step = event;
  }

  onChangeMode(event) {
    if (this.isEdit = true) {
      this.changeMode = event
    }
  }

  onClose(event) {
    if (event) {
      this.dialogRef.close();
    }
  }

  refreshExpenseReportTable() {
    this.getExpenseByUser();
  }
  onPageChange(event: any) {
    this.currentPage = event.pageIndex + 1;
    this.recordsPerPage = event.pageSize;
    this.getExpenseByUser();
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  getExpenseByUser() {
    let pagination = {
      skip: ((this.currentPage - 1) * this.recordsPerPage).toString(),
      next: this.recordsPerPage.toString()
    };
    this.expenseService.getExpenseReportByUser(this.currentUser.id, pagination).subscribe((res: any) => {
      this.expenseReport = res.data;
      this.dataSource.data = this.expenseReport;
      this.totalAmount = this.expenseReport.reduce((total, report) => total + report.amount, 0);
      this.totalRecords = res.total;
    })
  }

  getCategory(categoryId: string) {
    const matchingCategory = this.allCategory?.find(category => category._id === categoryId);
    return matchingCategory ? `${matchingCategory.label}` : this.translate.instant('expenses.category_not_found');
  }

  getUser(employeeId: string) {
    const matchingUser = this.allAssignee?.find(user => user._id === employeeId);
    return matchingUser ? `${matchingUser.firstName} ${matchingUser.lastName}` : '';
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