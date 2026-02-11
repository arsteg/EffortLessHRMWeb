import { Component, EventEmitter, Output, ViewChild, inject } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ExpensesService } from 'src/app/_services/expenses.service';
import { ExportService } from 'src/app/_services/export.service';
import { CommonService } from 'src/app/_services/common.Service';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { TranslateService } from '@ngx-translate/core';
import { ActionVisibility, TableColumn } from 'src/app/models/table-column';
@Component({
  selector: 'app-rejected',
  templateUrl: './rejected.component.html',
  styleUrl: './rejected.component.css'
})
export class RejectedComponent {
  private readonly translate = inject(TranslateService);
  closeResult: string = '';
  step: number = 1;
  searchText: string = '';
  changeMode: 'Add' | 'Update' = 'Add';
  @Output() expenseTemplateReportRefreshed: EventEmitter<void> = new EventEmitter<void>();
  expenseReport: any;
  isEdit: boolean = false;
  users: any[];
  p: number = 1;
  expenseReportExpenses: any;
  selectedReport: any;
  public sortOrder: string = '';
  totalRecords: number
  recordsPerPage: number = 10;
  displayedColumns: string[] = ['title', 'user', 'totalAmount', 'reimbursable', 'billable', 'reason', 'status', 'action'];
  dataSource = new MatTableDataSource<any>();
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  currentPage: number = 1;
  dialogRef: MatDialogRef<any>;

  columns: TableColumn[] = [
    {
      key: 'title',
      name: this.translate.instant('expenses.report_title')
    },
    {
      key: 'user',
      name: this.translate.instant('expenses.employee')
    },
    {
      key: 'totalAmount',
      name: this.translate.instant('expenses.total_amount'),
      valueFn: (row: any) => this.calculateTotalAmount(row)
    },
    {
      key: 'advance',
      name: this.translate.instant('expenses.advance_recieved'),
      valueFn: (row: any) => this.calculateAdvanceAmount(row)
    },
    {
      key: 'netPayable',
      name: this.translate.instant('expenses.net_payable'),
      valueFn: (row: any) => this.calculateNetPayable(row)
    },
    {
      key: 'reimbursable',
      name: this.translate.instant('expenses.reimbursable'),
      valueFn: (row: any) => this.calculateTotalisReimbursable(row, true, false)
    },
    {
      key: 'billable',
      name: this.translate.instant('expenses.billable'),
      valueFn: (row: any) => this.calculateTotalisReimbursable(row, false, true)
    },
    {
      key: 'primaryApprovalReason',
      name: this.translate.instant('reason')
    },
    {
      key: 'status',
      name: this.translate.instant('status')
    },
    {
      key: 'action',
      name: this.translate.instant('expenses.action'),
      isAction: true,
      options: [
        { label: 'View', icon: 'visibility', visibility: ActionVisibility.LABEL },
        { label: 'Re-initiate', icon: 'refresh', visibility: ActionVisibility.LABEL }
      ]
    }
  ];

  constructor(
    private dialog: MatDialog,
    private expenseService: ExpensesService,
    private commonService: CommonService,
    private exportService: ExportService) { }

  ngOnInit() {
    this.commonService.populateUsers().subscribe((res: any) => {
      this.users = res.data.data;
      this.getExpenseReport();
    });
  }

  onPageChange(event) {
    this.currentPage = event.pageIndex + 1;
    this.recordsPerPage = event.pageSize;
    this.getExpenseReport();
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }


  getExpenseReport() {
    const pagination = {
      skip: ((this.currentPage - 1) * this.recordsPerPage).toString(),
      next: this.recordsPerPage.toString(),
      status: 'Rejected'
    };
    this.expenseService.getExpenseReport(pagination).subscribe((res: any) => {
      this.expenseReport = res.data.map((data) => {
        return {
          ...data,
          user: this.getUser(data?.employee)
        }
      });
      this.dataSource.data = this.expenseReport;
      this.totalRecords = res.total;
    });
  }

  getUser(employeeId: string) {
    const matchingUser = this.users.find(user => user._id === employeeId);
    return matchingUser ? `${matchingUser.firstName} ${matchingUser.lastName}` : this.translate.instant('expenses.user_not_found');
  }

  editReport(report: any) {
    this.isEdit = true;
    this.selectedReport = report;
    console.log(this.selectedReport)
    this.expenseService.selectedReport.next(this.selectedReport)
  }

  open(content: any, selectedReport?: any) {
    if (selectedReport) {
      this.selectedReport = selectedReport;
      this.expenseService.expenseReportExpense.next(selectedReport);
    } else {
      this.expenseService.expenseReportExpense.next(null);
    }
    this.dialogRef = this.dialog.open(content, { width: '50%' });
    this.dialogRef.afterClosed().subscribe((result) => {
      this.expenseService.expenseReportExpense.next(null);
      this.expenseService.selectedReport.next(null);
    });
  }
  onClose(event) {
    if (event) {
      this.dialogRef.close();
      this.getExpenseReport();
    }
  }

  onChangeStep(event) {
    this.step = event;
  }

  onChangeMode(event) {
    if (this.isEdit = true) {
      this.changeMode = event
    }
  }

  refreshExpenseReportTable() {
    this.getExpenseReport();
  }
  exportToCsv() {
    const dataToExport = this.expenseReport.map((categories) => ({
      title: categories.title,
      employee: this.getUser(categories.employee),
      totalAmount: this.calculateTotalAmount(categories),
      advanceAmount: this.calculateAdvanceAmount(categories),
      netPayable: this.calculateNetPayable(categories),
      isReimbursable: this.calculateTotalisReimbursable(categories, true, false),
      isBillable: this.calculateTotalisReimbursable(categories, false, true),
      status: categories.status
    }));
    this.exportService.exportToCSV('Expense-Rejected-Report', 'Expense-Rejected-Report', dataToExport);
  }
  calculateTotalAmount(expenseReport: any): number {
    let totalAmount = 0;
    if (expenseReport.expenseReportExpense && expenseReport.expenseReportExpense.length > 0) {
      for (const expense of expenseReport.expenseReportExpense) {
        totalAmount += expense.amount;
      }
    } else {
      totalAmount = parseFloat(expenseReport.amount) || 0;
    }
    return totalAmount;
  }

  calculateAdvanceAmount(expenseReport: any): number {
    if (expenseReport.advanceAmountAllowed === false) {
      return 0;
    }
    if (expenseReport.expenseReportExpense && expenseReport.expenseReportExpense.length > 0) {
      const sumItems = expenseReport.expenseReportExpense.reduce((sum, item) => sum + (item.amount || 0), 0);
      if (Math.abs(parseFloat(expenseReport.amount) - sumItems) > 0.01) {
        return parseFloat(expenseReport.amount) || 0;
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

  handleAction(event: any, viewModal: any, addModal: any) {
    if (event.action.label === 'View') {
      this.open(viewModal, event.row);
    }
    if (event.action.label === 'Re-initiate') {
      this.editReport(event.row);
      this.open(addModal);
      this.changeMode = 'Update';
    }
  }

  onSortChange(event: any) {
    const sorted = this.dataSource.data.slice().sort((a, b) => {
      const aValue = a[event.active]?.toString();
      const bValue = b[event.active]?.toString();
      return event.direction === 'asc' ? (aValue > bValue ? 1 : -1) : (aValue < bValue ? 1 : -1);
    });
    this.dataSource.data = sorted;
  }

  onSearchChange(event: any) {
    this.dataSource.data = this.expenseReport?.filter(row => {
      const searchText = event.toLowerCase();
      return this.columns.some(col => {
        if (col.isAction) return false;
        const value = col.valueFn ? col.valueFn(row) : row[col.key];
        return value?.toString().toLowerCase().includes(searchText);
      });
    });
  }
}
