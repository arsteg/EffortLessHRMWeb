import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { ExpensesService } from 'src/app/_services/expenses.service';
import { CommonService } from 'src/app/_services/common.Service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ViewReportComponent } from '../../expense-reports/view-report/view-report.component';
import { MatTableDataSource } from '@angular/material/table';
import { ApproveDialogComponent } from '../../expense-reports/pending/approve-dialog.component';
import { RejectDialogComponent } from '../../expense-reports/pending/reject-dialog.component';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-show-team-expenses',
  templateUrl: './show-team-expenses.component.html',
  styleUrl: './show-team-expenses.component.css'
})
export class ShowTeamExpensesComponent {
  private readonly translate = inject(TranslateService);
  closeResult: string = '';
  p: number = 1;
  step: number = 1;
  searchText: string = '';
  isEdit: boolean = false;
  changeMode: 'Add' | 'Update' = 'Add';
  @Output() expenseTemplateReportRefreshed: EventEmitter<void> = new EventEmitter<void>();
  @Input() actionOptions: { approve: boolean, reject: boolean, cancel: boolean, view: boolean, edit: boolean };
  @Input() status: string;
  expenseReport: any;
  allAssignee: any[];
  allCategory: any[];
  public sortOrder: string = '';
  totalAmount: number = 0;
  totalRecords: number
  recordsPerPage: number = 10;
  currentPage: number = 1;
  selectedReport: any;
  updateExpenseReport: FormGroup;
  @Input() selectedTab: number;
  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>([]);
  displayedColumns: string[] = ['title', 'employeeName', 'totalAmount', 'amount', 'reimbursable', 'billable', 'comment', 'status', 'actions'];
  dialogRef: MatDialogRef<any>;

  constructor(private expenseService: ExpensesService,
    private commonService: CommonService,
    private dialog: MatDialog,
    private fb: FormBuilder,
    private toast: ToastrService) {
    this.updateExpenseReport = this.fb.group({
      employee: [''],
      title: [''],
      status: [''],
      primaryApprovalReason: [''],
      secondaryApprovalReason: ['']
    })
  }

  ngOnInit() {
    this.getExpenseReport();
    this.commonService.populateUsers().subscribe(result => {
      this.allAssignee = result && result.data && result.data.data;
    });
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
      disableClose: true,
    });
    this.dialogRef.afterClosed().subscribe((result) => {
      this.expenseService.expenseReportExpense.next([]);
      this.expenseService.selectedReport.next(null);
    });
  }
  onChangeStep(event) {
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
    this.getExpenseReport();
  }
  onPageChange(event: any) {
    this.currentPage = event.pageIndex + 1;
    this.recordsPerPage = event.pageSize;
    this.getExpenseReport();
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  getExpenseReport() {
    let pagination = {
      skip: ((this.currentPage - 1) * this.recordsPerPage).toString(),
      next: this.recordsPerPage.toString(),
      status: this.status
    };

    this.expenseService.getExpenseReportByTeam(pagination).subscribe((res: any) => {
      this.expenseReport = res.data.map((report) => {
        return {
          ...report,
          employeeName: this.getUser(report?.employee)
        };
      });
      this.dataSource.data = this.expenseReport;
      this.totalAmount = this.expenseReport.reduce((total, report) => total + report.amount, 0);
      this.totalRecords = res.total;
    });
  }

  updateReportStatus(result: any) {
    const id = this.selectedReport._id;
    const payload = {
      employee: this.selectedReport.employee,
      title: this.selectedReport.title,
      status: result.approved ? 'Approved' : 'Rejected',
      primaryApprovalReason: result.reason,
      secondaryApprovalReason: ''
    };
    this.expenseService.updateExpenseReport(id, payload).subscribe(() => {
      this.dataSource.data = this.dataSource.data.filter(report => report._id !== id);
      this.toast.success(this.translate.instant('expenses.updatedStatus'))
    },
      err => {
        this.toast.error(err)
      });
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

  getCategory(categoryId: string) {
    const matchingCategory = this.allCategory?.find(category => category._id === categoryId);
    return matchingCategory ? `${matchingCategory.label}` : this.translate.instant('expenses.category_not_found');
  }

  getUser(employeeId: string) {
    const matchingUser = this.allAssignee?.find(user => user._id === employeeId);
    return matchingUser ? `${matchingUser.firstName} ${matchingUser.lastName}` : this.translate.instant('expenses.user_not_found');;
  }
  openSecondModal(selectedReport: any): void {
    console.log(selectedReport)
    const userName = this.getUser(selectedReport.employee);
    const categoryLabel = this.getCategory(selectedReport.category);
    selectedReport.employee = userName;
    selectedReport.category = categoryLabel;
    console.log(selectedReport);
    const dialogRef = this.dialog.open(ViewReportComponent, {
      width: '50%',
      data: { report: selectedReport }
    });
    dialogRef.afterClosed().subscribe(result => {
    });
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

}
