import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ExpensesService } from 'src/app/_services/expenses.service';
import { CommonService } from 'src/app/_services/common.Service';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ViewReportsComponent } from '../view-reports/view-reports.component';
import { StatusUpdateComponent } from '../status-update/status-update.component';
import { FormControl } from '@angular/forms';
import { ExportService } from 'src/app/_services/export.service';

@Component({
  selector: 'app-show-report',
  templateUrl: './show-report.component.html',
  styleUrl: './show-report.component.css'
})
export class ShowReportComponent {
  searchText: string = '';
  allAssignee: any[];
  allCategory: any[];
  selectedUser: string;
  advanceReport: any;
  closeResult: string = '';
  @Output() advanceReportRefreshed: EventEmitter<void> = new EventEmitter<void>();
  @Input() status: string;
  @Input() actionOptions: { approve: boolean, reject: boolean, cancel: boolean, view: boolean };
  employee = new FormControl('');
  reportSummary: any;
  totalAmount: number = 0;
  p: number = 1;
  public sortOrder: string = '';
  totalRecords: number
  recordsPerPage: number = 10;
  currentPage: number = 1;

  constructor(private commonService: CommonService,
    private expenseService: ExpensesService,
    private dialog: MatDialog,
    private modalService: NgbModal,
    private exportService: ExportService) { }

  ngOnInit(): void {
    this.commonService.populateUsers().subscribe(result => {
      this.allAssignee = result && result.data && result.data.data;
      console.log(this.allAssignee)
    });
    this.getAdvanceReports();
    let payload = {
      next: '', skip: ''
    }
    this.expenseService.getAdvanceCatgories(payload).subscribe((res: any) => {
      this.allCategory = res.data;
    });
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.getAdvanceReports();
  }

  onRecordsPerPageChange(recordsPerPage: number) {
    this.recordsPerPage = recordsPerPage;
    this.getAdvanceReports();
  }

  getAdvanceReports() {
    let pagination = {
      skip: ((this.currentPage - 1) * this.recordsPerPage).toString(),
      next: this.recordsPerPage.toString(),
      status: this.status
    };
    this.expenseService.getAdvanceReport(pagination).subscribe((res: any) => {
      const rawReports = res.data
      this.totalAmount = rawReports.reduce((total, report) => total + report.amount, 0);
      this.advanceReport = res.data;
      this.totalRecords = res.total;
    });

  }

  getUser(employeeId: string) {
    const matchingUser = this.allAssignee?.find(user => user?._id === employeeId);
    return matchingUser ? `${matchingUser.firstName} ${matchingUser.lastName}` : '';
  }

  getCategory(categoryId: string) {
    const matchingCategory = this.allCategory?.find(category => category?._id === categoryId);
    return matchingCategory ? `${matchingCategory?.label}` : 'Category does not exist';
  }

  open(content: any) {
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
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

  refreshExpenseReportTable() {
    this.getAdvanceReports();
  }

  onClose(event) {
    if (event) {
      this.modalService.dismissAll();
    }
  }

  openStatusModal(report: any, status: string): void {
    report.status = status;
    this.expenseService.advanceReport.next(report);
    const dialogRef = this.dialog.open(StatusUpdateComponent, {
      width: '50%',
      data: { report }
    });
    dialogRef.afterClosed().subscribe(result => {
      this.refreshExpenseReportTable();
    });
  }

  openSecondModal(selectedReport: any): void {
    selectedReport.employeeName = this.getUser(selectedReport.employee);
    selectedReport.categoryLabel = this.getCategory(selectedReport.category);
    this.expenseService.advanceReport.next(selectedReport);
    const dialogRef = this.dialog.open(ViewReportsComponent, {
      width: '50%',
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
      this.reportSummary = res.details;
      this.totalAmount = this.reportSummary.reduce((acc, curr) => acc + curr.amount, 0);
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
}
