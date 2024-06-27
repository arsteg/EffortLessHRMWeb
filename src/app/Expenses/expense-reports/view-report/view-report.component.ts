import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ExpensesService } from 'src/app/_services/expenses.service';
import { ViewExpenseReportExpensesComponent } from '../view-expense-report-expenses/view-expense-report-expenses.component';
import { CommonService } from 'src/app/common/common.service';

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
  users: any[];
  category: any;

  constructor(private expenseService: ExpensesService,
    private modalService: NgbModal,
    private dialog: MatDialog,
    private commonService: CommonService) { }

  ngOnInit() {
    this.expenseService.getExpenseReportExpensesByReportId(this.report._id).subscribe((res: any) => {
      this.expenseReportExpenses = res.data;
    });
    this.getAllUsers();
    this.getCategory();
  }

  getAllUsers() {
    this.commonService.populateUsers().subscribe((res: any) => {
      this.users = res?.data?.data;
    });
  }
  getUser(employeeId: string) {
    const matchingUser = this.users?.find(user => user?._id === employeeId);
    return matchingUser ? `${matchingUser?.firstName} ${matchingUser?.lastName}` : 'User Not Found';
  }
  getCategory() {
    // let category = this.expenseService.report.getValue().expenseCategory
    let payload ={
      next: '',
      skip: ''
    }
    this.expenseService.getExpenseCatgories(payload).subscribe(res => {
      this.category = res.data;
      console.log(this.category);
    })
  }
  getCategoryById(categoryId: string) {
    const matchingCategory = this.category?.find(cat => cat?._id === categoryId);
    return matchingCategory ? matchingCategory?.label : 'Category Not Found';
  }

  // calculateTotalAmount(): number {
  //   let totalAmount = 0;
  //   if (Array.isArray(this.expenseReportExpenses)) {
  //     for (let report of this.expenseReportExpenses) {
  //       if (report && typeof report.amount === 'number') {
  //         totalAmount += report.amount;
  //       }
  //     }
  //   }
  //   return totalAmount;
  // }

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
    const fileContent = this.selectedReport.documentLink;
    window.open(fileContent, '_blank');
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
      data: { report: selectedReport }
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log('The modal was closed');
    });
  }
  getFileNameFromUrl(url: string): string {
    const urlParts = url.split('/');
    const fileName = urlParts[urlParts.length - 1];
    return fileName;
  }
}
