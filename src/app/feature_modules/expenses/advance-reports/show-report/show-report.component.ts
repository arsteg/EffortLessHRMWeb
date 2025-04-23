import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ExpensesService } from 'src/app/_services/expenses.service';
import { CommonService } from 'src/app/_services/common.Service';
import { ViewReportsComponent } from '../view-reports/view-reports.component';
import { StatusUpdateComponent } from '../status-update/status-update.component';
import { FormControl } from '@angular/forms';
import { ExportService } from 'src/app/_services/export.service';
import { ToastrService } from 'ngx-toastr';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';
import { MatTableDataSource } from '@angular/material/table';
import { forkJoin } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-show-report',
  templateUrl: './show-report.component.html',
  styleUrl: './show-report.component.css'
})
export class ShowReportComponent {
  private translate: TranslateService = inject(TranslateService);
  searchText: string = '';
  allAssignee: any[];
  allCategory: any[];
  selectedUser: string;
  advanceReport: any;
  closeResult: string = '';
  @Output() advanceReportRefreshed: EventEmitter<void> = new EventEmitter<void>();
  @Input() status: string;
  @Input() actionOptions: { approve: boolean, reject: boolean, cancel: boolean, view: boolean, edit: boolean, delete: boolean };
  employee = new FormControl('');
  p: number = 1;
  public sortOrder: string = '';
  totalRecords: number
  recordsPerPage: number = 10;
  currentPage: number = 1;
  changeMode: 'Add' | 'Update' = 'Add';
  selectedRecord: any;
  displayedColumns = ['employee', 'category', 'amount', 'status', 'comment', 'action'];
  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>([]);

  constructor(private commonService: CommonService,
    private expenseService: ExpensesService,
    private dialog: MatDialog,
    private exportService: ExportService,
    private toast: ToastrService) { }

  ngOnInit(): void {
    forkJoin({
      users: this.commonService.populateUsers(),
      categories: this.expenseService.getAdvanceCatgories({ next: '', skip: '' }),
      reports: this.expenseService.getAdvanceReport({
        skip: ((this.currentPage - 1) * this.recordsPerPage).toString(),
        next: this.recordsPerPage.toString(),
        status: this.status
      })
    }).subscribe(({ users, categories, reports }) => {
      this.allAssignee = users && users.data && users.data.data;
      this.allCategory = categories.data;
      this.advanceReport = reports.data;
      this.dataSource.data = this.advanceReport;
      this.totalRecords = reports?.total;
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  onPageChange(event: any) {
    this.currentPage = event.pageIndex + 1;
    this.recordsPerPage = event.pageSize;
    this.getAdvanceReports();
  }

  getAdvanceReports() {
    let pagination = {
      skip: ((this.currentPage - 1) * this.recordsPerPage).toString(),
      next: this.recordsPerPage.toString(),
      status: this.status
    };
    this.expenseService.getAdvanceReport(pagination).subscribe((res: any) => {
      this.advanceReport = res.data;
      this.dataSource.data = this.advanceReport;
      this.totalRecords = res.total;
    });
  }

  getUser(employeeId: string) {
    const matchingUser = this.allAssignee?.find(user => user?._id === employeeId);
    return matchingUser ? `${matchingUser.firstName} ${matchingUser.lastName}` : '';
  }

  getCategory(categoryId: string) {
    const matchingCategory = this.allCategory?.find(category => category?._id === categoryId);
    return matchingCategory ? `${matchingCategory?.label}` : this.translate.instant('expenses.category_not_found');
  }

  open(content: any) {
    const dialogRef = this.dialog.open(content, {
      width: '500px',
    });
    dialogRef.afterClosed().subscribe(result => {
      if(result === 'success'){
        this.refreshExpenseReportTable();
      }
    });
  }

  refreshExpenseReportTable() {
    this.getAdvanceReports();
  }

  onClose(event) {
    if (event) {
      this.dialog.closeAll();
    }
  }

  openStatusModal(report: any, status: string): void {
    this.expenseService.advanceReport.next(report);
    const dialogRef = this.dialog.open(StatusUpdateComponent, {
      width: '500px',
      data: { 
        report,
        'status': status
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if(result === 'success'){
        this.refreshExpenseReportTable();
      }
    });
  }

  openSecondModal(selectedReport: any): void {
    selectedReport.employeeName = this.getUser(selectedReport.employee);
    selectedReport.categoryLabel = this.getCategory(selectedReport.category);
    this.expenseService.advanceReport.next(selectedReport);
    const dialogRef = this.dialog.open(ViewReportsComponent, {
      width: '500px',
      data: { report: selectedReport }
    });
    dialogRef.afterClosed().subscribe(result => {
    });
  }

  selectedEmployee() {
    this.getAdvanceByUser();
  }

  getAdvanceByUser() {
    this.expenseService.getAdvanceByUser(this.employee.value).subscribe((res: any) => {
      this.dataSource.data = res.details.filter((report=> report.status === this.status)) || [];
    });
  }

  exportToCsv() {
    const dataToExport = this.advanceReport.map((advance) => ({
      employee: advance.employeeName,
      category: advance.categoryLabel,
      amount: advance?.amount,
      status: advance.status,
      comment: advance.comment,
    }));
    this.exportService.exportToCSV('Advance-Report', 'Advance-Report', dataToExport);
  }

  deleteExpenseReport(id: string): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'delete') {
        this.deleteReport(id);
      }
      err => {
        this.toast.error(this.translate.instant('expenses.delete_error'))
      }
    });
  }
  deleteReport(id: string) {
    this.expenseService.deleteAdvanceReport(id).subscribe((res: any) => {
      this.advanceReport = this.advanceReport.filter(report => report._id !== id);
      this.toast.success(this.translate.instant('expenses.delete_success'));
    },
      (err) => {
        this.toast.error(this.translate.instant('expenses.delete_error'));
      })
  }

}
