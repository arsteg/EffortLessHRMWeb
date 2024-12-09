import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { forkJoin } from 'rxjs';
import { CommonService } from 'src/app/_services/common.Service';
import { PayrollService } from 'src/app/_services/payroll.service';
import { UserService } from 'src/app/_services/users.service';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-payroll-history',
  templateUrl: './payroll-history.component.html',
  styleUrl: './payroll-history.component.css'
})
export class PayrollHistoryComponent {
  closeResult: string = '';
  isAllEmployees: boolean;
  searchText: string = '';
  payroll: any;
  payrollUsers: any;
  selectedPayroll;
  payrollForm: FormGroup;
  payrollUserForm: FormGroup;
  years: number[] = [];
  users: any;

  months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ];

  constructor(private modalService: NgbModal,
    private payrollService: PayrollService,
    private fb: FormBuilder,
    private toast: ToastrService,
    private commonService: CommonService,
    private dialog: MatDialog,
    private userService: UserService
  ) {
    this.payrollForm = this.fb.group({
      date: [],
      status: [''],
      month: [''],
      year: ['']
    });
    this.payrollUserForm = this.fb.group({
      payroll: [''],
      user: ['', Validators.required],
      totalHomeTake: [0],
      totalFlexiBenefits: [0],
      totalCTC: [0],
      totalGrossSalary: [0],
      totalTakeHome: [0],
      status: ['Active']
    })
  }

  ngOnInit() {
    this.generateYearList();
    this.getAllUsers();
    this.getPayrollWithUserCounts();
  }
  generateYearList() {
    const currentYear = new Date().getFullYear();
    this.years = [currentYear - 1, currentYear, currentYear + 1];
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
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', backdrop: 'static' }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  getPayrollWithUserCounts() {
    const payrollPayload = { skip: '', next: '' };
    this.payrollService.getPayroll(payrollPayload).subscribe((payrollRes: any) => {
      this.payroll = payrollRes.data;

      this.payroll.forEach((payrollItem, index) => {
        const payrollUsersPayload = { skip: '', next: '', payroll: payrollItem._id };

        this.payrollService.getPayrollUsers(payrollUsersPayload).subscribe((payrollUsersRes: any) => {
          const users = payrollUsersRes.data;

          const activeCount = users.filter(user => user.status === 'Active').length;
          const onHoldCount = users.filter(user => user.status === 'OnHold').length;
          const processedCount = users.filter(user => user.status === 'Processed').length;

          this.payroll[index] = {
            ...payrollItem,
            activeCount: activeCount,
            onHoldCount: onHoldCount,
            processedCount: processedCount
          };
        });
      });
    });
  }

  getAllUsers() {
    this.commonService.populateUsers().subscribe((res: any) => {
      this.users = res.data.data;
    })
  }

  getMonthName(monthNumber: number): string {
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    return monthNames[monthNumber - 1] || "Invalid month";
  }

  onSubmission() {
    this.payrollService.addPayroll(this.payrollForm.value).subscribe((res: any) => {
      const record = res.data;
      this.payroll.push(record);
      this.toast.success('Payroll Created', 'Successfully!')
    },
      err => {
        this.toast.error('Payroll can not be created', 'Error!')
      })
  }

  updatePayrollUser() {
    // add user

    console.log(this.payrollUserForm.value.totalGrossSalary);

    if (this.payrollUserForm.valid) {
      this.payrollUserForm.value.payroll = this.selectedPayroll;

      this.userService.getSalaryByUserId(this.payrollUserForm.value.user).subscribe((res: any) => {
        const lastSalaryRecord = res.data[res.data.length - 1];
        this.payrollUserForm.value.totalGrossSalary = lastSalaryRecord.Amount;

        this.payrollService.addPayrollUser(this.payrollUserForm.value).subscribe((res: any) => {
          this.payrollUsers = res.data;
          this.getPayrollWithUserCounts();
          this.toast.success('Employee added to the payroll', 'Successfully');
          this.payrollUserForm.patchValue({
            user: '',
            payroll: this.selectedPayroll,
            totalHomeTake: 0,
            totalFlexiBenefits: 0,
            totalCTC: 0,
            totalGrossSalary: 0,
            totalTakeHome: 0,
            status: 'Active'
          })
        })
      })
    }

    else { this.payrollUserForm.markAllAsTouched(); }
  }

  getGrossSalaryBySalaryStructure(): void {
    this.userService.getSalaryByUserId(this.payrollUserForm.value.user).subscribe((res: any) => {
      const lastSalaryRecord = res.data[res.data.length - 1];
      this.payrollUserForm.get('totalGrossSalary').disable();
      return this.payrollUserForm.patchValue({
        totalGrossSalary: lastSalaryRecord.Amount
      })
    });
  }

  deleteTemplate(_id: string) {
    this.payrollService.deleteArrear(_id).subscribe((res: any) => {
      this.ngOnInit();
      this.toast.success('Successfully Deleted!!!', 'Payroll')
    },
      (err) => {
        this.toast.error('This Payroll Can not be deleted!')
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


}