import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ExpensesService } from 'src/app/_services/expenses.service';
import { ExportService } from 'src/app/_services/export.service';
import { CommonService } from 'src/app/_services/common.Service';

@Component({
  selector: 'app-cancelled',
  templateUrl: './cancelled.component.html',
  styleUrl: './cancelled.component.css'
})
export class CancelledComponent {
  closeResult: string = '';
  step: number = 1;
  searchText: string = '';
  changeMode: 'Add' | 'Update' = 'Add';
  @Output() expenseTemplateReportRefreshed: EventEmitter<void> = new EventEmitter<void>();
  expenseReport: any;
  isEdit: boolean = false;
  users: any[];
  selectedReport: any;
  expenseReportExpenses: any;
  p: number = 1;
  displayedData: any[]=[];
  public sortOrder: string = '';
  status: string;
  updateExpenseReport: FormGroup;
  totalRecords: number
  recordsPerPage: number = 10;
  currentPage: number = 1;

  constructor(private modalService: NgbModal,
    private expenseService: ExpensesService,
    private commonService: CommonService,
    private exportService: ExportService,
  private fb: FormBuilder  ) {
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
      this.commonService.populateUsers().subscribe((res: any) => {
        this.users = res.data.data;
      });
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
        status: 'Cancelled'
      };
      this.expenseService.getExpenseReport(pagination).subscribe((res: any) => {
        this.expenseReport = res.data;
        this.totalRecords = res.total;
      });
    }

    getUser(employeeId: string) {
      const matchingUser = this.users.find(user => user._id === employeeId);
      return matchingUser ? `${matchingUser.firstName} ${matchingUser.lastName}` : 'User Not Found';
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
      this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title',  backdrop: 'static' }).result.then((result) => {
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
          }
          else if (expense.isBillable === isBillable) {
            totalAmount += expense.amount;
          }
        }
      }
      return totalAmount;
    }


}
