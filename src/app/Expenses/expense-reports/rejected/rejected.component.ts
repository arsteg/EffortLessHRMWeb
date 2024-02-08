import { Component, EventEmitter, Output } from '@angular/core';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ExpensesService } from 'src/app/_services/expenses.service';
import { ExportService } from 'src/app/_services/export.service';
import { CommonService } from 'src/app/common/common.service';

@Component({
  selector: 'app-rejected',
  templateUrl: './rejected.component.html',
  styleUrl: './rejected.component.css'
})
export class RejectedComponent {
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

  constructor(private modalService: NgbModal,
    private expenseService: ExpensesService,
    private commonService: CommonService,
    private exportService: ExportService) { }

  ngOnInit() {
    this.getExpenseReport();
    this.commonService.populateUsers().subscribe((res: any) => {
      this.users = res.data.data;
    });
  }

  getExpenseReport() {
    this.expenseService.getExpenseReport().subscribe((res: any) => {
      this.expenseReport = res.data.filter(expense => expense.status === 'Rejected');
      console.log(this.expenseReport)
    });
  }
  getUser(employeeId: string) {
    const matchingUser = this.users.find(user => user._id === employeeId);
    return matchingUser ? `${matchingUser.firstName} ${matchingUser.lastName}` : 'User Not Found';
  }
  getReports() {
    this.expenseService.getExpenseReportExpensesByReportId(this.selectedReport._id).subscribe((res: any) => {
      this.expenseReportExpenses = res.data;
    })
  }

  calculateTotalAmount(): number {
    let totalAmount = 0;
    // if (Array.isArray(this.expenseReportExpenses)) {
      console.log(this.expenseReportExpenses)
      for (const expense of this.expenseReportExpenses) {
        totalAmount += expense.amount;
      // }
    }
    return totalAmount;
  }
  editReport(report: any) {
    this.isEdit = true;
    this.selectedReport = report;
    console.log(this.selectedReport)
    this.expenseService.selectedReport.next(this.selectedReport)
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
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }
  onClose(event) {
    if (event) {
      this.modalService.dismissAll();
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
    this.expenseService.getExpenseReport().subscribe(
      (res) => {
        this.expenseReport = res.data.filter(expense => expense.status === 'Rejected');
        this.expenseTemplateReportRefreshed.emit();
      },
      (error) => {
        console.error('Error refreshing expense template table:', error);
      }
    );
  }
  exportToCsv() {
    const dataToExport = this.expenseReport.map((categories) => ({
      title: categories.title,
      employee: this.getUser(categories.employee),
      amount: categories.amount,
      isReimbursable: categories.isReimbursable ? categories.amount : 0,
      isBillable: categories.isBillable ? categories.amount : 0,
      status: categories.status
    }));
    this.exportService.exportToCSV('ApplicationUsages', 'applicationUsages', dataToExport);
  }
}