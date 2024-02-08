import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';
import { ExpensesService } from 'src/app/_services/expenses.service';
import { CommonService } from 'src/app/common/common.service';
import { map } from 'rxjs/operators'
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
  users: any[];
  isEdit: boolean = false;
  p: number = 1;
  updateExpenseReport: FormGroup;
  expenseReportExpenses: any;
  selectedReport: any;
  categories: any;
  displayedData: any[] = [];


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
    })
  }

  ngOnInit() {
    this.getExpenseReport();
    this.commonService.populateUsers().subscribe((res: any) => {
      this.users = res.data.data;
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
        this.expenseReport = res.data;
        this.expenseTemplateReportRefreshed.emit();
      },
      (error) => {
        console.error('Error refreshing expense template table:', error);
      }
    );
  }
  getExpenseReport() {
    this.expenseService.getExpenseReport().subscribe((res: any) => {
      this.expenseReport = res.data.filter(expense => expense.status === 'Approved');
      console.log(this.expenseReport)
    });
  }

  getUser(employeeId: string) {
    const matchingUser = this.users.find(user => user._id === employeeId);
    return matchingUser ? `${matchingUser.firstName} ${matchingUser.lastName}` : 'User Not Found';
  }

  updateReport() {
    let id = this.selectedReport._id;
    let payload = {
      employee: this.selectedReport.employee,
      title: this.selectedReport.title,
      status: 'Cancelled',
      primaryApprovalReason: '',
      secondaryApprovalReason: ''
    }
    this.expenseService.updateExpenseReport(id, payload).subscribe((res: any) => {
      this.expenseReport = this.expenseReport.filter(report => report._id !== id);
    })
  }



  getCategories() {
    this.expenseService.getExpenseCatgories().subscribe((res: any) => {
      console.log(res.data);
      this.categories = res.data;
    })
  }



  getCategoryLabel(expenseCategoryId: string): Observable<string> {
    return this.expenseService.getExpenseCatgories().pipe(
      map((res: any) => {
        const categories = res.data;
        const matchingCategory = categories.find(category => category._id === expenseCategoryId);
        return matchingCategory ? matchingCategory.label : '';
      })
    );
  }
  updateCancelledReport() {
    let id = this.selectedReport._id;
    let payload = {
      employee: this.selectedReport.employee,
      title: this.selectedReport.title,
      status: 'Cancelled',
      primaryApprovalReason: this.updateExpenseReport.value.primaryApprovalReason,
      secondaryApprovalReason: ''
    }
    this.expenseService.updateExpenseReport(id, payload).subscribe((res: any) => {
      this.expenseReport = this.expenseReport.filter(report => report._id !== id);
    })
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
    this.exportService.exportToCSV('Expense-Report', 'Expense-Report', dataToExport);
  }
}