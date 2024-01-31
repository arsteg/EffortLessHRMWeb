import { Component, EventEmitter, Output } from '@angular/core';
import { FormGroup, FormBuilder, FormArray, Validators, FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { isEqual } from 'date-fns';
import { ToastrService } from 'ngx-toastr';
import { of, forkJoin } from 'rxjs';
import { map, switchMap } from 'rxjs/operators'
import { ExpensesService } from 'src/app/_services/expenses.service';
import { CommonService } from 'src/app/common/common.service';
import { ExpenseCategory, ExpenseCategoryField } from 'src/app/models/expenses';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';
import { AuthenticationService } from 'src/app/_services/authentication.service';
import { ExportService } from 'src/app/_services/export.service';

@Component({
  selector: 'app-pending',
  templateUrl: './pending.component.html',
  styleUrl: './pending.component.css'
})
export class PendingComponent {
  [x: string]: any;
  searchText: string = '';
  expenseCategories: any;
  isEdit = false;
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

  constructor(private modalService: NgbModal,
    private expenseService: ExpensesService,
    private commonService: CommonService,
    private authService: AuthenticationService,
    private dialog: MatDialog,
    private toast: ToastrService,
    private exportService: ExportService) { }

  ngOnInit() {
    this.getExpenseReport();
    this.commonService.populateUsers().subscribe((res: any) => {
      this.users = res.data.data;
    });
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
onChangeMode(event){
  if(this.isEdit = true){
    this.changeMode = event
  }
}
  getExpenseReport() {
    this.expenseService.getExpenseReport().subscribe((res: any) => {
      this.expenseReport = res.data;
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
      this.toast.success('Successfully Deleted!!!', 'Advance Category')
    },
      (err) => {
        this.toast.error('This category is already being used in an expense template!'
          , 'Advance Category, Can not be deleted!')
      })
  }


  getUser(employeeId: string) {
    const matchingUser = this.users.find(user => user._id === employeeId);
    return matchingUser ? `${matchingUser.firstName} ${matchingUser.lastName}` : 'User Not Found';
  }

  editReport(report: any) {
    this.isEdit = true;
    this.selectedReport = report;
    console.log(this.selectedReport)
    this.expenseService.selectedReport.next(this.selectedReport)

  }

 
  exportToCsv() {
    const dataToExport = this.displayedData.map((categories) => ({
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
