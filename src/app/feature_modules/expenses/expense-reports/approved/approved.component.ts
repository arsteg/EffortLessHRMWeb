import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatMenuTrigger } from '@angular/material/menu';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';
import { ExpensesService } from 'src/app/_services/expenses.service';
import { CommonService } from 'src/app/_services/common.Service';
import { map } from 'rxjs/operators';
import { ExportService } from 'src/app/_services/export.service';

@Component({
  selector: 'app-approved',
  templateUrl: './approved.component.html',
  styleUrl: './approved.component.css'
})
export class ApprovedComponent {
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

  constructor(private modalService: NgbModal,
    private expenseService: ExpensesService,
    private commonService: CommonService,
    private fb: FormBuilder,
    private exportService: ExportService) {
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
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', backdrop: 'static' }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  onClose(event) {
    if (event) {
      this.modalService.dismissAll();
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
    });
  }

  getUser(employeeId: string) {
    const matchingUser = this.users.find(user => user._id === employeeId);
    return matchingUser ? `${matchingUser.firstName} ${matchingUser.lastName}` : 'User Not Found';
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
    });
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
    this.exportService.exportToCSV('Expense-Approved-Report', 'Expense-Approved-Report', dataToExport);
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
}
