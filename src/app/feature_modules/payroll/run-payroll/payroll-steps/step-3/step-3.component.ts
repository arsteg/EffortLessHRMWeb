import { Component, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { forkJoin, map } from 'rxjs';
import { CommonService } from 'src/app/_services/common.Service';
import { PayrollService } from 'src/app/_services/payroll.service';
import { UserService } from 'src/app/_services/users.service';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-step-3',
  templateUrl: './step-3.component.html',
  styleUrl: './step-3.component.css'
})
export class Step3Component {
  searchText: string = '';
  closeResult: string = '';
  variablePayForm: FormGroup;
  @Input() selectedPayroll: any;
  selectedUserId: any;
  variablePay: any;
  varAllowance: any;
  varDeduction: any;
  years: number[] = [];
  selectedYear: number;
  users: any;
  changeMode: 'Add' | 'Update' = 'Add';
  selectedRecord: any;
  payrollUser: any;
  salary: any;

  months = [
    { name: 'January', value: 1 },
    { name: 'February', value: 2 },
    { name: 'March', value: 3 },
    { name: 'April', value: 4 },
    { name: 'May', value: 5 },
    { name: 'June', value: 6 },
    { name: 'July', value: 7 },
    { name: 'August', value: 8 },
    { name: 'September', value: 9 },
    { name: 'October', value: 10 },
    { name: 'November', value: 11 },
    { name: 'December', value: 12 }
  ];

  constructor(private modalService: NgbModal,
    private payrollService: PayrollService,
    private fb: FormBuilder,
    private toast: ToastrService,
    private commonService: CommonService,
    private dialog: MatDialog,
    private userService: UserService
  ) {
    this.variablePayForm = this.fb.group({
      payrollUser: ['', Validators.required],
      variableDeduction: ['', Validators.required],
      variableAllowance: ['', Validators.required],
      amount: [0, [Validators.required, Validators.min(1)]],
      month: [0, [Validators.required, Validators.min(1), Validators.max(12)]],
      year: [0, [Validators.required, Validators.min(2000), Validators.max(new Date().getFullYear())]]
    })
  }

  ngOnInit() {
    this.generateYearList();
    this.getAllUsers();
    this.getVariableDeductionAndAllowance();
  }

  generateYearList() {
    const currentYear = new Date().getFullYear();
    this.years = [currentYear - 1, currentYear, currentYear + 1];
    this.variablePayForm.value.year = currentYear;

  }
  open(content: any) {
    this.variablePayForm.patchValue({
      month: this.selectedPayroll?.month,
      year: this.selectedPayroll?.year
    });
    this.variablePayForm.get('month').disable();
    this.variablePayForm.get('year').disable();
    if (this.changeMode === 'Update') {
      this.payrollService.getPayrollUserById(this.selectedRecord.payrollUser).subscribe((res: any) => {
        this.payrollUser = res.data;

        const payrollUser = this.payrollUser?.user;
        this.variablePayForm.patchValue({
          payrollUser: this.getUser(payrollUser),
          variableDeduction: this.selectedRecord?.variableDeduction,
          variableAllowance: this.selectedRecord?.variableAllowance,
          amount: this.selectedRecord?.amount,
          month: this.selectedRecord?.month,
          year: this.selectedRecord?.year
        });
        this.variablePayForm.get('payrollUser').disable();
        this.variablePayForm.get('month').disable();
        this.variablePayForm.get('year').disable();
      });
    }

    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', backdrop: 'static' }).result.then((result) => {
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

  getSalarydetails() {
    this.selectedUserId
    this.userService.getSalaryByUserId(this.selectedUserId?.user).subscribe((res: any) => {
      this.salary = res.data;
    })
  }

  onUserSelectedFromChild(userId: string) {
    this.selectedUserId = userId;
    this.getSalarydetails();
    this.getVariablePay();
  }

  getVariablePay() {
    this.payrollService.getVariablePay(this.selectedUserId?._id).subscribe((res: any) => {
      this.variablePay = res.data;
      const userRequests = this.variablePay.map((item: any) => {
        return this.payrollService.getPayrollUserById(item.payrollUser).pipe(
          map((userRes: any) => ({
            ...item,
            payrollUserDetails: this.getUser(userRes?.data.user)
          }))
        );
      });
      forkJoin(userRequests).subscribe(
        (results: any[]) => {
          this.variablePay = results;
        },
        (error) => {
          this.toast.error("Error fetching payroll user details:", error);
        }
      );
    },
      (error) => {
        this.toast.error("Error fetching attendance summary:", error);
      }
    );
  }

  getVariableDeductionAndAllowance() {
    let payload = { skipe: '', next: '' }
    this.payrollService.getVariableAllowance(payload).subscribe((res: any) => { this.varAllowance = res.data });
    this.payrollService.getVariableDeduction(payload).subscribe((res: any) => { this.varDeduction = res.data });
  }

  onSubmit() {
    this.variablePayForm.value.payrollUser = this.selectedUserId._id;
    this.variablePayForm.value.month = this.selectedPayroll.month;
    this.variablePayForm.value.year = this.selectedPayroll.year;
    if (this.changeMode == 'Add') {
      this.payrollService.addVariablePay(this.variablePayForm.value).subscribe((res: any) => {
        this.variablePay = res.data;
        this.getVariablePay();
        this.variablePayForm.reset();
        this.toast.success('Variable Pay Added', 'Successfully!');
        this.modalService.dismissAll();
      },
        err => {
          this.toast.error('Variable Pay can not be Added', 'Error!');
        });
    }
    if (this.changeMode == 'Update') {
      // Update API call
      let id = this.selectedRecord._id;
      this.payrollService.updateVariablePay(id, this.variablePayForm.value).subscribe((res: any) => {
        this.getVariablePay();
        this.variablePayForm.reset();
        this.changeMode = 'Update';
        this.toast.success('Variable Pay Updated', 'Successfully!');
        this.modalService.dismissAll();
      },
        err => {
          this.toast.error('Variable Pay can not be Updated', 'Error!');
        });
    }
  }

  deleteTemplate(_id: string) {
    this.payrollService.deleteVariablePay(_id).subscribe((res: any) => {
      this.getVariablePay();
      this.toast.success('Successfully Deleted!!!', 'Variable Pay')
    },
      (err) => {
        this.toast.error('This Variable Pay Can not be deleted!')
      })
  }

  deleteDialog(id: string): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'delete') {
        this.deleteTemplate(id);
      }
    });
  }

  getAllUsers() {
    this.commonService.populateUsers().subscribe((res: any) => {
      this.users = res.data.data;
    })
  }

  getUser(employeeId: string) {
    const matchingUser = this.users?.find(user => user?._id === employeeId);
    return matchingUser ? `${matchingUser.firstName} ${matchingUser.lastName}` : 'N/A';
  }

}