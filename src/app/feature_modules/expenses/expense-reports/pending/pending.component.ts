import { Component, EventEmitter, Output, Input } from '@angular/core';
import { FormGroup, FormBuilder, FormArray, Validators, FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { ExpensesService } from 'src/app/_services/expenses.service';
import { CommonService } from 'src/app/_services/common.Service';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';
import { AuthenticationService } from 'src/app/_services/authentication.service';
import { ExportService } from 'src/app/_services/export.service';
import { setTime } from 'ngx-bootstrap/chronos/utils/date-setters';

@Component({
  selector: 'app-pending',
  templateUrl: './pending.component.html',
  styleUrl: './pending.component.css'
})
export class PendingComponent {
  [x: string]: any;
  searchText: string = '';
  expenseCategories: any;
  @Input() isEdit: boolean = false;
  closeResult: string = '';
  step: number = 1;
  expenseReport: any;
  @Output() expenseTemplateReportRefreshed: EventEmitter<void> = new EventEmitter<void>();
  users: any[];
  p: number = 1;
  allExpenseReport: any;
  displayedData: any[] = [];
  changeMode: 'Add' | 'Update' = 'Add';
  selectedReport;
  updateExpenseReport: FormGroup;
  status: string;
  expenseReportExpenses: any;
  public sortOrder: string = '';
  totalRecords: number
  recordsPerPage: number = 10;
  currentPage: number = 1;


  constructor(private modalService: NgbModal,
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
    })
  }

  ngOnInit() {
    this.commonService.populateUsers().subscribe((res: any) => {
      this.users = res.data.data;
    });
      this.getExpenseReport();
  }
  refreshExpenseReportTable() {
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

  onCancel() {
    this.isEdit = false;
  }

  clearform() {
    this.isEdit = false;
    if (!this.isEdit) {
      this.changeMode = 'Add';
    }
  }

  open(content: any) {
    console.log(content);
    this.expenseService.expenseReportExpense.next(this.selectedReport);
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
      this.changeMode = event
    }
  }
  onPageChange(page: number) {
    this.currentPage = page;
    this.getExpenseReport();
  }

  onRecordsPerPageChange(recordsPerPage: number) {
    this.recordsPerPage = recordsPerPage;
    this.getExpenseReport();
  }


  getExpenseReport() {
    const pagination = {
      skip: ((this.currentPage - 1) * this.recordsPerPage).toString(),
      next: this.recordsPerPage.toString(),
      status: 'Level 1 Approval Pending'
    };
    this.expenseService.getExpenseReport(pagination).subscribe((res: any) => {
      this.expenseReport = res.data.map((data) => {
        return {
          ...data,
          user: this.getUser(data?.employee)
        }
      })
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
      err => {
        this.toast.error('Can not be Deleted', 'Error!')
      }
    });
  }
  deleteReport(id: string) {
    this.expenseService.deleteExpenseReport(id).subscribe((res: any) => {
      this.displayedData = this.displayedData.filter(report => report._id !== id);
      this.toast.success('Successfully Deleted!!!', 'Expense Report');
    },
      (err) => {
        this.toast.error('This Expense Report is already being used!'
          , 'Error!')
      })
  }

  getUser(employeeId: string) {
    const matchingUser = this.users.find(user => user._id === employeeId);
    return matchingUser ? `${matchingUser.firstName} ${matchingUser.lastName}` : 'User Not Found';
  }

  editReport(report: any) {
    this.isEdit = true;
    this.selectedReport = report;
    this.expenseService.selectedReport.next(this.selectedReport)
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

  updateApprovedReport() {
    let id = this.selectedReport._id;
    let payload = {
      employee: this.selectedReport.employee,
      title: this.selectedReport.title,
      status: 'Approved',
      primaryApprovalReason: this.updateExpenseReport.value.primaryApprovalReason,
      secondaryApprovalReason: ''
    }
    this.expenseService.updateExpenseReport(id, payload).subscribe((res: any) => {
      this.expenseReport = this.expenseReport.filter(report => report._id !== id);
    })
  }

  updateRejectedReport() {
    let id = this.selectedReport._id;
    let payload = {
      employee: this.selectedReport.employee,
      title: this.selectedReport.title,
      status: 'Rejected',
      primaryApprovalReason: this.updateExpenseReport.value.primaryApprovalReason,
      secondaryApprovalReason: ''
    }
    this.expenseService.updateExpenseReport(id, payload).subscribe((res: any) => {
      this.expenseReport = this.expenseReport.filter(report => report._id !== id);
    })
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
        }
        else if (expense.isBillable === isBillable) {
          totalAmount += expense.amount;
        }
      }
    }
    return totalAmount;
  }
}
