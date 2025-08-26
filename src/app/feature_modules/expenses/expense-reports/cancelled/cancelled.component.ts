import { Component, EventEmitter, Output, ViewChild, inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ExpensesService } from 'src/app/_services/expenses.service';
import { ExportService } from 'src/app/_services/export.service';
import { CommonService } from 'src/app/_services/common.Service';
import { TranslateService } from '@ngx-translate/core';
import { ActionVisibility, TableColumn } from 'src/app/models/table-column';
@Component({
  selector: 'app-cancelled',
  templateUrl: './cancelled.component.html',
  styleUrl: './cancelled.component.css'
})
export class CancelledComponent {
  private readonly translate = inject(TranslateService);
  closeResult: string = '';
  step: number = 1;
  searchText: string = '';
  changeMode: 'Add' | 'Update' = 'Add';
  @Output() expenseTemplateReportRefreshed: EventEmitter<void> = new EventEmitter<void>();
  expenseReport: any;
  isEdit: boolean = false;
  users: any[] = [];
  selectedReport: any;
  expenseReportExpenses: any;
  displayedColumns: string[] = ['title', 'user', 'totalAmount', 'reimbursable', 'billable', 'reason', 'status', 'action'];
  dataSource = new MatTableDataSource<any>();
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  updateExpenseReport: FormGroup;
  totalRecords: number;
  recordsPerPage: number = 10;
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
        { label: 'View', icon: 'visibility', visibility: ActionVisibility.LABEL }
      ]
    }
  ];

  constructor(private dialog: MatDialog,
    private expenseService: ExpensesService,
    private commonService: CommonService,
    private exportService: ExportService,
    private fb: FormBuilder) {
    this.updateExpenseReport = this.fb.group({
      employee: [''],
      title: [''],
      status: [''],
      primaryApprovalReason: [''],
      secondaryApprovalReason: ['']
    });
  }

  ngOnInit() {
    this.commonService.populateUsers().subscribe((res: any) => {
      this.users = res.data.data;
    });
    this.getExpenseReport();
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
      status: 'Cancelled'
    };
    this.expenseService.getExpenseReport(pagination).subscribe((res: any) => {
      this.expenseReport = res.data.map((data) => {
        return {
          ...data,
          user: this.getUser(data?.employee)
        };
      });
      this.dataSource.data = this.expenseReport;
      this.totalRecords = res.total;
    });
  }

  getUser(employeeId: string) {
    const matchingUser = this.users.find(user => user._id === employeeId);
    return matchingUser ? `${matchingUser.firstName} ${matchingUser.lastName}` : this.translate.instant('expenses.user_not_found');
  }

  
  open(content: any, selectedReport?: any) {
    if(selectedReport){
      this.selectedReport = selectedReport;
      this.expenseService.expenseReportExpense.next(selectedReport);
    } else {
      this.expenseService.expenseReportExpense.next(null);
    }
    this.dialogRef = this.dialog.open(content, {
      width: '50%',
      disableClose: true
    });
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
      this.changeMode = event;
    }
  }

  refreshExpenseReportTable() {
    this.getExpenseReport();
  }

  exportToCsv() {
    const dataToExport = this.expenseReport.map((categories) => ({
      title: categories.title,
      employee: this.getUser(categories.employee),
      amount: categories?.expenseReportExpense[0]?.amount,
      isReimbursable: categories?.expenseReportExpense[0]?.isReimbursable ? categories?.expenseReportExpense[0]?.amount : 0,
      isBillable: categories?.expenseReportExpense[0]?.isBillable ? categories?.expenseReportExpense[0]?.amount : 0,
      status: categories.status
    }));
    this.exportService.exportToCSV('Expense-Cancelled-Report', 'Expense-Cancelled-Report', dataToExport);
  }

  calculateTotalAmount(expenseReport: any): number {
    let totalAmount = 0;
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
        } else if (expense.isBillable === isBillable) {
          totalAmount += expense.amount;
        }
      }
    }
    return totalAmount;
  }

  handleAction(event: any, viewModal: any) {
    if (event.action.label === 'View') {
      this.open(viewModal, event.row);
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
