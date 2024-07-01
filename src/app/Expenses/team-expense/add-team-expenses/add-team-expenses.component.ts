import { ChangeDetectorRef, Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { AuthenticationService } from 'src/app/_services/authentication.service';
import { ExpensesService } from 'src/app/_services/expenses.service';
import { CommonService } from 'src/app/_services/common.Service';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';
import { TimeLogService } from 'src/app/_services/timeLogService';
import { CreateReportComponent } from '../../expense-reports/create-report/create-report.component';

@Component({
  selector: 'app-add-team-expenses',
  templateUrl: './add-team-expenses.component.html',
  styleUrl: './add-team-expenses.component.css'
})
export class AddTeamExpensesComponent {
  users: any = [];
  @Output() close: any = new EventEmitter();
  @Input() changeMode: string;
  addExpenseForm: FormGroup;
  expenseReport: any[];
  @Output() updateExpenseReportTable: EventEmitter<void> = new EventEmitter<void>();
  isEdit: boolean;
  category: any;
  expenseReportExpenses: any;
  selectedExpenseReportExpense: any;
  private updateTableSubscription: Subscription;
  employee: string;
  selectedUser: any = [];
  teamUser: any;
  members: any;
  member: any;
  currentUser: any;
  @ViewChild(CreateReportComponent) createExpenseReport: CreateReportComponent;
  private subscription: Subscription;

  constructor(private dialog: MatDialog,
    private commonService: CommonService,
    public expenseService: ExpensesService,
    private fb: FormBuilder,
    private toast: ToastrService,
    private cdr: ChangeDetectorRef,
    private authService: AuthenticationService,
    private timelog: TimeLogService) {

    this.addExpenseForm = this.fb.group({
      employee: [{ value: '', disabled: this.changeMode }, Validators.required],
      title: ['', Validators.required],
      amount: [Validators.required],
      status: ['', Validators.required],
      expenseReportExpenses: []
    });
  }

  ngOnInit() {
    this.getTeam();
    this.populateUsers();
    if (this.changeMode == 'Add') {
      this.addExpenseForm.reset();
    }
    else {
      console.log(this.changeMode)
      this.addExpenseForm.patchValue({
        employee: this.expenseService.selectedReport.getValue().employee,
        title: this.expenseService.selectedReport.getValue().title,
        amount: this.expenseService.selectedReport.getValue.amount
      });
      this.getExpenseReportExpensesByReportId();
    }
    this.commonService.populateUsers().subscribe((res: any) => {
      this.users = res.data.data;
    });
  }

  ngAfterViewInit() {
    this.updateTableSubscription = this.expenseService.updateTable$.subscribe(() => {
      this.getExpenseReportExpensesByReportId();
    });
  }

  ngOnDestroy() {
    this.updateTableSubscription.unsubscribe();
  }

   openSecondModal(isEdit: boolean) {
    const user = this.addExpenseForm.value.employee;
    this.expenseService.selectedUser.next(user)
    this.expenseService.isEdit.next(isEdit);
    const dialogRef = this.dialog.open(CreateReportComponent, {
      width: '50%',
      data: { isEdit: this.isEdit }
    });
    dialogRef.afterClosed().subscribe(result => {
    });
  }

  getSelectedExpenseReportExpense(selectedExpenseReportExpense: any) {
    console.log(selectedExpenseReportExpense)
    this.expenseService.expenseReportExpense.next(selectedExpenseReportExpense);
  }

  closeModal() {
    this.close.emit(true);
  }

  getCategoryByUser() {
    const user = this.addExpenseForm.value.employee;
    console.log(user);
    this.expenseService.selectedUser.next(user);
    if (this.changeMode == 'Add') {
      this.expenseService.getExpenseCategoryByUser(user).subscribe((res: any) => {
        this.expenseService.tempAndCat.next(res);
        if (!res.data) {
          this.toast.warning('User is not Assigned to any Expense Categories', 'Warning')
        }
      })
    }
  }
  createReport() {
    let payload = {
      employee: this.addExpenseForm.value.employee,
      title: this.addExpenseForm.value.title,
      amount: this.addExpenseForm.value.amount,
      status: 'Level 1 Approval Pending',
      expenseReportExpenses: []
    }
    let formArray = this.expenseService.expenseReportExpense.getValue();
    payload.expenseReportExpenses = [formArray];
    if (this.changeMode == 'Add') {
      console.log(payload)
      this.expenseService.addExpensePendingReport(payload).subscribe((res: any) => {
        this.toast.success('Expense Template Applicable Category Added Successfully!');
        this.updateExpenseReportTable.emit();
      },
        err => {
          this.toast.error('Expense Template Applicable Category Can not be Added', 'ERROR!')
        }
      )
    }
    else {
      let id = this.expenseService.selectedReport.getValue()._id
      this.expenseService.updateExpenseReport(id, payload).subscribe((res: any) => {
        this.updateExpenseReportTable.emit();
        this.toast.success('Expense Template Applicable Category Updated Successfully!');
      },
        err => {
          this.toast.error('Expense Template Applicable Category Can not be Updated', 'ERROR!')
        }
      )
    }
  }

  getCategoryById(categoryId) {
    this.expenseService.getExpenseCategoryById(categoryId).subscribe((res: any) => {
      this.category = res.data.label;
      return this.category
    });
  }
  getCategoryLabel(expenseCategoryId: string): string {
    const matchingCategory = this.expenseReportExpenses.find(category => category._id === expenseCategoryId);
    return matchingCategory ? matchingCategory.label : '';
  }


  deleteExpenseReportExpense(id: string): void {
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
    this.expenseService.deleteExpenseReportExpenses(id).subscribe((res: any) => {
      this.expenseReportExpenses = this.expenseReportExpenses.filter(report => report._id !== id);
      this.toast.success('Successfully Deleted!!!', 'Expense Report')
    },
      (err) => {
        this.toast.error('Can not be deleted!')
      })
  }

  getExpenseReportExpensesByReportId() {
    let id = this.expenseService.selectedReport.getValue()._id;
    console.log(this.expenseService.expenseReportExpense.getValue());
    this.expenseReportExpenses = this.expenseService.expenseReportExpense.getValue();
    if (this.changeMode == 'Update') {
      this.expenseService.getExpenseReportExpensesByReportId(id).subscribe((res: any) => {
        this.expenseReportExpenses = res.data;
      })
    }
  }

  getTeam() {
    this.authService.currentUser.subscribe(res => {
      this.currentUser = res;
      this.timelog.getTeamMembers(this.currentUser.id).subscribe((response: any) => {
        this.teamUser = response.data;
      });
    });
  }
  populateUsers() {
    this.authService.currentUser.subscribe(res => {
      this.currentUser = res;
      this.members = [];
      this.members.push({ id: this.currentUser.id, name: "Me", email: this.currentUser.id });
      this.member = this.currentUser;
      this.timelog.getTeamMembers(this.member.id).subscribe({
        next: (response: { data: any[]; }) => {

          this.teamUser = response.data;
          this.timelog.getusers(response.data).subscribe({
            next: result => {
              result.data.forEach(user => {
                if (user.email != this.currentUser.email) {
                  this.members.push({ id: user.id, name: `${user.firstName} ${user.lastName}`, email: user.email });
                }
              })
            },
            error: error => {
              console.log('There was an error!', error);
            }
          });
        },
        error: error => {
          console.log('There was an error!', error);
        }
      });
    })
  }

}
