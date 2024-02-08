import { Component, EventEmitter, Output } from '@angular/core';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ExpensesService } from 'src/app/_services/expenses.service';
import { CommonService } from 'src/app/common/common.service';

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

  constructor(private modalService: NgbModal,
    private expenseService: ExpensesService,
    private commonService: CommonService ) { }

    ngOnInit() {
      this.getExpenseReport();
      this.commonService.populateUsers().subscribe((res: any) => {
        this.users = res.data.data;
      });
    }
  
    getExpenseReport() {
      this.expenseService.getExpenseReport().subscribe((res: any) => {
        this.expenseReport = res.data.filter(expense => expense.status === 'Cancelled');
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
    getReports() {
      this.expenseService.getExpenseReportExpensesByReportId(this.selectedReport._id).subscribe((res: any) => {
        this.expenseReportExpenses = res.data;
      })
    }
}
