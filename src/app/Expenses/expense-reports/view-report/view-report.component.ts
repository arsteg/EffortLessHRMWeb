import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ExpensesService } from 'src/app/_services/expenses.service';
import { ViewExpenseReportExpensesComponent } from '../view-expense-report-expenses/view-expense-report-expenses.component';

@Component({
  selector: 'app-view-report',
  templateUrl: './view-report.component.html',
  styleUrl: './view-report.component.css'
})
export class ViewReportComponent {
  expenseReportExpenses: any;
  selectedReport: any;
  @Input() report: any;
  @Output() close: any = new EventEmitter();
  totalAmount: number = 0;
  closeResult: string = '';
  selectedExpense: any;

  constructor(private expenseService: ExpensesService,
    private modalService: NgbModal,
    private dialog: MatDialog) { }

  ngOnInit() {
    this.expenseService.getExpenseReportExpensesByReportId(this.report._id).subscribe((res: any) => {
      this.expenseReportExpenses = res.data;
    })
  }

  calculateTotalAmount(): number {
    let totalAmount = 0;
    if (Array.isArray(this.expenseReportExpenses)) {
      for (let report of this.expenseReportExpenses) {
        if (report && typeof report.amount === 'number') {
          totalAmount += report.amount;
        }
      }
    }
    return totalAmount;
  }

  calculateSumOfReimbursableAmounts(): number {
    let sum = 0;
    if (Array.isArray(this.expenseReportExpenses)) {
      for (let report of this.expenseReportExpenses) {
        if (report.isReimbursable) {
          sum += report.amount;
        }
      }
    }
    return sum;
  }

  calculateSumOfBillableAmounts(): number {
    let sum = 0;
    if (Array.isArray(this.expenseReportExpenses)) {
      for (let report of this.expenseReportExpenses) {
        if (report.isBillable) {
          sum += report.amount;
        }
      }
    }
    return sum;
  }

  downloadFile() {
    let response = this.selectedReport.documentLink;
    const blob = new Blob([response], { type: 'application/png' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = response;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);

  }
  closeModal() {
    this.close.emit(true);
  }
  onClose(event) {
    if (event) {
      this.modalService.dismissAll();
    }
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
  openSecondModal(selectedReport: any): void {
    console.log(selectedReport);
    this.expenseService.report.next(selectedReport);
    const dialogRef = this.dialog.open(ViewExpenseReportExpensesComponent, {
        width: '50%',
        data: { report: selectedReport } // Pass the selected report as data to the modal
    });
    dialogRef.afterClosed().subscribe(result => {
        console.log('The modal was closed');
    });
}
}
