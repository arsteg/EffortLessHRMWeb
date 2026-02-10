import { Component, EventEmitter, Output, ViewChild, inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatMenuTrigger } from '@angular/material/menu';
import { ExpensesService } from 'src/app/_services/expenses.service';
import { CommonService } from 'src/app/_services/common.Service';
import { ExportService } from 'src/app/_services/export.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { ActionVisibility, TableColumn } from 'src/app/models/table-column';
import { th } from 'date-fns/locale';
@Component({
  selector: 'app-approved',
  templateUrl: './approved.component.html',
  styleUrl: './approved.component.css'
})
export class ApprovedComponent {
  private translate: TranslateService = inject(TranslateService);
  closeResult: string = '';
  step: number = 1;
  searchText: string = '';
  changeMode: 'Add' | 'Update' = 'Add';
  @Output() expenseTemplateReportRefreshed: EventEmitter<void> = new EventEmitter<void>();
  expenseReport: any;
  users: any[] = [];
  isEdit: boolean = false;
  updateExpenseReport: FormGroup;
  selectedReport: any;
  categories: any;
  displayedData: MatTableDataSource<any> = new MatTableDataSource([]);
  totalRecords: number;
  recordsPerPage: number = 10;
  currentPage: number = 1;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatMenuTrigger) menuTrigger: MatMenuTrigger;
  dialogRef: MatDialogRef<any>;
  allData: any[] = [];

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
      key: 'reimbursable', name: this.translate.instant('expenses.reimbursable'),
      valueFn: (row: any) => this.calculateTotalisReimbursable(row, true, false)
    },
    {
      key: 'billable', name: this.translate.instant('expenses.billable'),
      valueFn: (row: any) => this.calculateTotalisReimbursable(row, false, true)
    },
    {
      key: 'primaryApprovalReason',
      name: this.translate.instant('reason')
    },
    { key: 'status', name: this.translate.instant('status') },
    {
      key: 'action',
      name: this.translate.instant('expenses.action'),
      isAction: true,
      options: [
        { label: 'View', icon: 'visibility', visibility: ActionVisibility.LABEL },
        { label: 'Cancel', icon: 'close', visibility: ActionVisibility.LABEL }
      ]
    }
  ];

  constructor(
    private dialog: MatDialog,
    private expenseService: ExpensesService,
    private commonService: CommonService,
    private fb: FormBuilder,
    private exportService: ExportService,
    private toast: ToastrService) {
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

  open(content: any, selectedReport?: any) {
    if (selectedReport) {
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
      this.dialog.closeAll();
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

  onPageChange(event) {
    this.currentPage = event.pageIndex + 1;
    this.recordsPerPage = event.pageSize;
    this.getExpenseReport();
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.displayedData.filter = filterValue.trim().toLowerCase();
  }

  getExpenseReport() {
    const pagination = {
      skip: ((this.currentPage - 1) * this.recordsPerPage).toString(),
      next: this.recordsPerPage.toString(),
      status: 'Approved'
    };
    this.expenseService.getExpenseReport(pagination).subscribe((res: any) => {
      this.expenseReport = res.data.map((data) => {
        return {
          ...data,
          user: this.getUser(data?.employee)
        };
      });
      this.totalRecords = res.total;
      this.displayedData = new MatTableDataSource(this.expenseReport);
      this.displayedData.paginator = this.paginator;
      this.allData = this.expenseReport;
    });
  }

  getUser(employeeId: string) {
    const matchingUser = this.users.find(user => user._id === employeeId);
    return matchingUser ? `${matchingUser.firstName} ${matchingUser.lastName}` : this.translate.instant('expenses.user_not_found');
  }

  updateCancelledReport() {
    let id = this.selectedReport._id;
    let payload = {
      employee: this.selectedReport.employee,
      title: this.selectedReport.title,
      status: 'Cancelled',
      primaryApprovalReason: this.updateExpenseReport.value.primaryApprovalReason,
      secondaryApprovalReason: ''
    };
    this.expenseService.updateExpenseReport(id, payload).subscribe((res: any) => {
      this.expenseReport = this.expenseReport.filter(report => report._id !== id);
      this.displayedData.data = this.expenseReport;
      this.toast.success(this.translate.instant('expenses.cancelRequest'));
      this.dialogRef.close();
    },
      err => {
        this.toast.error(this.translate.instant('expenses.cancelRequestError'))
      });
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
    this.exportService.exportToCSV('Expense-Approved-Report', 'Expense-Approved-Report', dataToExport);
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
        } else if (expense.isBillable === isBillable) {
          totalAmount += expense.amount;
        }
      }
    }
    return totalAmount;
  }

  handleAction(event: any, viewModal: any, cancelModal: any) {
    if (event.action.label === 'View') {
      this.open(viewModal, event.row);
    }
    if (event.action.label === 'Cancel') {
      this.open(cancelModal, event.row);
    }
  }

  onSortChange(event: any) {
    const sorted = this.displayedData.data.slice().sort((a, b) => {
      const aValue = a[event.active]?.toString();
      const bValue = b[event.active]?.toString();
      return event.direction === 'asc' ? (aValue > bValue ? 1 : -1) : (aValue < bValue ? 1 : -1);
    });
    this.displayedData.data = sorted;
  }

  onSearchChange(event: any) {
    this.displayedData.data = this.allData?.filter(row => {
      const searchText = event.toLowerCase();
      return this.columns.some(col => {
        if (col.isAction) return false;
        const value = col.valueFn ? col.valueFn(row) : row[col.key];
        return value?.toString().toLowerCase().includes(searchText);
      });
    });
  }
}
