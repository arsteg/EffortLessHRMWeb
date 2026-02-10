import { Component, Output, EventEmitter, Input, inject, ViewChild } from '@angular/core';
import { ExpensesService } from 'src/app/_services/expenses.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { CommonService } from 'src/app/_services/common.Service';
import { ExportService } from 'src/app/_services/export.service';
import { ViewReportComponent } from '../../expense-reports/view-report/view-report.component';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';
import { MatSort, Sort } from '@angular/material/sort';

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
  validations: any;
  displayedColumns: string[] = ['title', 'totalAmount', 'amount', 'netPayable', 'reimbursable', 'billable', 'status', 'actions'];
  dataSource: any = new MatTableDataSource([]);
  dialogRef: MatDialogRef<any>;
  @ViewChild(MatSort) sort: MatSort;

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
    this.expenseService.getEmployeeApplicableSettings(this.currentUser.id).subscribe((res: any) => {
      this.validations = res.data;
    });
  }

  open(content: any, selectedReport?: any) {
    this.expenseService.tabIndex.next(this.selectedTab);
    if (selectedReport) {
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
    if (expenseReport.expenseReportExpense && expenseReport.expenseReportExpense.length > 0) {
      for (const expense of expenseReport.expenseReportExpense) {
        totalAmount += expense.amount;
      }
    } else {
      totalAmount = expenseReport.amount || 0;
    }
    return totalAmount;
  }

  calculateAdvanceAmount(expenseReport: any): number {
    if (this.validations && !this.validations.advanceAmount) {
      return 0;
    }
    if (expenseReport.expenseReportExpense && expenseReport.expenseReportExpense.length > 0) {
      const sumItems = expenseReport.expenseReportExpense.reduce((sum, item) => sum + (item.amount || 0), 0);
      if (Math.abs(expenseReport.amount - sumItems) > 0.01) {
        return expenseReport.amount || 0;
      }
    }
    return 0;
  }

  calculateNetPayable(expenseReport: any): number {
    return this.calculateTotalAmount(expenseReport) - this.calculateAdvanceAmount(expenseReport);
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
      return {
        title: report.title,
        totalAmount: this.calculateTotalAmount(report),
        advanceAmount: this.calculateAdvanceAmount(report),
        netPayable: this.calculateNetPayable(report),
        isReimbursable: this.calculateTotalisReimbursable(report, true, false),
        isBillable: this.calculateTotalisReimbursable(report, false, true),
        status: report?.status
      };
    });
    this.exportService.exportToCSV('My-Expense-Report', 'My-Expense-Report', dataToExport);
  }

  sortData(sort: Sort) {
    const data = this.expenseReport.slice();
    if (!sort.active || sort.direction === '') {
      this.dataSource.data = data;
      return;
    }

    this.dataSource.data = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'title':
          return this.compare(a.title, b.title, isAsc);
        case 'totalAmount':
          return this.compare(this.calculateTotalAmount(a), this.calculateTotalAmount(b), isAsc);
        case 'amount':
          return this.compare(this.calculateAdvanceAmount(a), this.calculateAdvanceAmount(b), isAsc);
        case 'netPayable':
          return this.compare(this.calculateNetPayable(a), this.calculateNetPayable(b), isAsc);
        case 'reimbursable':
          return this.compare(this.calculateTotalisReimbursable(a, true, false),
            this.calculateTotalisReimbursable(b, true, false), isAsc);
        case 'billable':
          return this.compare(this.calculateTotalisReimbursable(a, false, true),
            this.calculateTotalisReimbursable(b, false, true), isAsc);
        case 'status':
          return this.compare(a.status, b.status, isAsc);
        default:
          return 0;
      }
    });
  }

  compare(a: number | string, b: number | string, isAsc: boolean) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }
}