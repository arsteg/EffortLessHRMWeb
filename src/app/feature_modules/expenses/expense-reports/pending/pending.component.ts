import { Component, EventEmitter, Output, Input, ViewChild, inject } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatMenuTrigger } from '@angular/material/menu';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { ExpensesService } from 'src/app/_services/expenses.service';
import { CommonService } from 'src/app/_services/common.Service';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';
import { ExportService } from 'src/app/_services/export.service';
import { ApproveDialogComponent } from './approve-dialog.component';
import { RejectDialogComponent } from './reject-dialog.component';

@Component({
  selector: 'app-pending',
  templateUrl: './pending.component.html',
  styleUrl: './pending.component.css'
})
export class PendingComponent {
  private readonly translate = inject(TranslateService);
  searchText: string = '';
  expenseCategories: any;
  @Input() isEdit: boolean = false;
  closeResult: string = '';
  step: number = 1;
  expenseReport: any;
  @Output() expenseTemplateReportRefreshed: EventEmitter<void> = new EventEmitter<void>();
  users: any[] = [];
  displayedColumns: string[] = ['title', 'employee', 'totalAmount', 'reimbursable', 'billable', 'status', 'action'];
  dataSource = new MatTableDataSource<any>();
  changeMode: 'Add' | 'Update' = 'Add';
  selectedReport: any;
  updateExpenseReport: FormGroup;
  status: string;
  totalRecords: number;
  recordsPerPage: number = 10;
  currentPage: number = 1;
  dialogRef: MatDialogRef<any>;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatMenuTrigger) menuTrigger: MatMenuTrigger;

  constructor(
    private expenseService: ExpensesService,
    private commonService: CommonService,
    private dialog: MatDialog,
    private toast: ToastrService,
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
      this.getExpenseReport();
    });
  }

  refreshExpenseReportTable() {
    this.getExpenseReport();
  }

  clearform() {
    this.isEdit = false;
    this.changeMode = 'Add';
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
      this.dialogRef.close();
      this.getExpenseReport();
    }
  }

  onChangeStep(event) {
    this.step = event;
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
      status: 'Level 1 Approval Pending'
    };
    this.expenseService.getExpenseReport(pagination).subscribe((res: any) => {
      this.expenseReport = res.data.map((data) => ({
        ...data,
        user: this.getUser(data?.employee)
      }));
      this.dataSource.data = this.expenseReport;
      this.totalRecords = res.total;
    });
  }

  deleteExpenseReport(id: string): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'delete') {
        this.deleteReport(id);
      }
    });
  }

  deleteReport(id: string) {
    this.expenseService.deleteExpenseReport(id).subscribe(() => {
      this.dataSource.data = this.dataSource.data.filter(report => report._id !== id);
      this.toast.success(this.translate.instant('expenses.delete_success'));
    }, () => {
      this.toast.error(this.translate.instant('expenses.delete_error'));
    });
  }

  getUser(employeeId: string) {
    const matchingUser = this.users.find(user => user._id === employeeId);
    return matchingUser ? `${matchingUser.firstName} ${matchingUser.lastName}` : this.translate.instant('expenses.user_not_found');
  }

  editReport(report: any) {
    this.isEdit = true;
    this.selectedReport = report;
    this.expenseService.selectedReport.next(this.selectedReport);
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
    this.exportService.exportToCSV('Expense-pending-Report', 'Expense-Pending-Report', dataToExport);
  }

  updateReportStatus(result: any) {
    const id = this.selectedReport._id;
    const payload = {
      employee: this.selectedReport.employee,
      title: this.selectedReport.title,
      status: result.approved ? 'Approved' : 'Rejected',
    };
    if(this.selectedReport.status === 'Level 1 Approval Pending'){
      payload['primaryApprovalReason'] = result.reason;
    }
    if(this.selectedReport.status === 'Level 2 Approval Pending'){
      payload['secondaryApprovalReason']= result.reason;
    }
    this.expenseService.updateExpenseReport(id, payload).subscribe(() => {
      this.dataSource.data = this.dataSource.data.filter(report => report._id !== id);
    }, (error)=>{
      this.toast.error(error, this.translate.instant('expenses.expense_report'));
    });
  }

  calculateTotalAmount(expenseReport: any): number {
    return expenseReport.expenseReportExpense?.reduce((total, expense) => total + expense.amount, 0) + parseFloat(expenseReport.amount) || 0;
  }

  calculateTotalisReimbursable(expenseReport: any, isReimbursable: boolean, isBillable: boolean): number {
    return expenseReport.expenseReportExpense?.reduce((total, expense) => {
      if (expense.isReimbursable === isReimbursable || expense.isBillable === isBillable) {
        return total + expense.amount;
      }
      return total;
    }, 0) || 0;
  }

  openApproveDialog(expenseReport: any) {
    this.selectedReport = expenseReport;
    const dialogRef = this.dialog.open(ApproveDialogComponent, {
      width: '500px',
      data: { report: this.selectedReport }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result.approved) {
        this.updateReportStatus(result);
      }
    });
  }

  openRejectDialog(expenseReport: any) {
    this.selectedReport = expenseReport;
    const dialogRef = this.dialog.open(RejectDialogComponent, {
      width: '500px',
      data: { report: this.selectedReport }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result.rejected) {
        this.updateReportStatus(result);
      }
    });
  }
}
