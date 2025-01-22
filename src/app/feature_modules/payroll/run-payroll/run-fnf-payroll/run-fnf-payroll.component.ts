import { Component, Input, OnInit, ViewChild, TemplateRef, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonService } from 'src/app/_services/common.Service';
import { PayrollService } from 'src/app/_services/payroll.service';
import { MatTableDataSource } from '@angular/material/table';
import { ToastrService } from 'ngx-toastr';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { UserService } from 'src/app/_services/users.service';
import { AttendanceService } from 'src/app/_services/attendance.service';

@Component({
  selector: 'app-run-fnf-payroll',
  templateUrl: './run-fnf-payroll.component.html',
  styleUrls: ['./run-fnf-payroll.component.css']
})
export class RunFnfPayrollComponent implements OnInit {
  searchText: string = '';
  closeResult: string = '';
  fnfMonths: string[] = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  years: number[] = [];
  selectedYear: number;
  selectedMonth: string;
  fnfForm: FormGroup;
  fnfUserForm: FormGroup;

  selectedFnFUser: any;
  userList: any[] = [];
  fnfPayroll = new MatTableDataSource<any>();
  displayedColumns: string[] = ['period', 'date', 'details', 'status', 'actions'];
  showFnFPayroll: boolean = true;
  showFnFSteps: boolean = false;
  fnfAttendanceUsers: any[] = [];
  selectedUserId: any;
  salary: any;
  @Output() changeView = new EventEmitter<void>();

  @ViewChild('fnfUserModal') fnfUserModal: TemplateRef<any>;

  constructor(private modalService: NgbModal,
    private fb: FormBuilder,
    private payrollService: PayrollService,
    private commonService: CommonService,
    private toast: ToastrService,
    private dialog: MatDialog,
    private userService: UserService,
    private attendanceService: AttendanceService) {
    const currentMonthIndex = new Date().getMonth();
    this.selectedMonth = this.fnfMonths[currentMonthIndex];
    const currentYear = new Date().getFullYear();
    this.selectedYear = currentYear;
    this.fnfForm = this.fb.group({
      date: [new Date(), Validators.required],
      month: [this.selectedMonth, Validators.required],
      year: [this.selectedYear, Validators.required],
    });
    this.fnfUserForm = this.fb.group({
      payrollFNF: ['', Validators.required],
      user: ['', Validators.required],
      totalFlexiBenefits: [{ value: 0, disabled: true }, Validators.required],
      totalCTC: [0, Validators.required],
      totalGrossSalary: [0, Validators.required],
      totalTakeHome: [0, Validators.required]
    });
  }

  ngOnInit() {
    this.generateYearList();
    this.fetchFnFPayroll();
    this.commonService.populateUsers().subscribe((res: any) => {
      this.userList = res.data['data'];
    });
  }



  onUserSelectedFromChild(userId: any) {
    this.selectedUserId = userId;
    this.getSalarydetailsByUser();
  }


  getSalarydetailsByUser() {
    let totalCTC = 0;
    this.userService.getSalaryByUserId(this.selectedUserId).subscribe((res: any) => {
      // const lastSalaryRecord = res.data[res.data.length - 1];
      const lastSalaryRecord = res.data[res.data.length - 1];
      if (lastSalaryRecord.enteringAmount === 'Monthly') {
        totalCTC = lastSalaryRecord.Amount * 12;
      }
      if (lastSalaryRecord.enteringAmount === 'Yearly') {
        totalCTC = lastSalaryRecord.Amount;
      }
      this.payrollService.getFlexiByUsers(this.selectedUserId).subscribe((res: any) => {
        const totalFlexiBenefits = res?.data?.records?.reduce((sum, flexiBenefit) =>
          sum + (flexiBenefit.TotalFlexiBenefitAmount || 0), 0) || 0;

        const totalFDYearlyAmount = lastSalaryRecord.fixedDeductionList?.reduce((sum, deduction) =>
          sum + (deduction.yearlyAmount || 0), 0) || 0;

        const totalVDYearlyAmount = lastSalaryRecord.variableDeductionList?.reduce((sum, deduction) =>
          sum + (deduction.yearlyAmount || 0), 0) || 0;

        const totalECYearlyAmount = lastSalaryRecord.employerContributionList?.reduce((sum, contribution) =>
          sum + (contribution.yearlyAmount || 0), 0) || 0;

        const deductions = totalFDYearlyAmount + totalVDYearlyAmount + totalECYearlyAmount

        const totalTakeHome = totalCTC - deductions;

        this.fnfUserForm.patchValue({
          totalFlexiBenefits: totalFlexiBenefits,
          totalCTC: totalCTC,
          totalGrossSalary: lastSalaryRecord.Amount,
          totalTakeHome: totalTakeHome
        });
        this.fnfUserForm.get('totalFlexiBenefits').disable();
        this.fnfUserForm.get('totalCTC').disable();
        this.fnfUserForm.get('totalGrossSalary').disable();
        this.fnfUserForm.get('totalTakeHome').disable();
      });
    })
  }

  generateYearList() {
    const currentYear = new Date().getFullYear();
    this.years = [currentYear - 1, currentYear, currentYear + 1];
  }

  onYearChange(event: any) {
    this.selectedYear = event.target.value;
  }

  fetchFnFPayroll() {
    const payload = { skip: '', next: '' };
    this.payrollService.getFnF(payload).subscribe(res => {
      this.fnfPayroll.data = res.data;
      this.fnfPayroll.data.forEach((fnf: any) => {
        this.getFnFUsers(fnf._id);
      });
    }, error => {
      this.toast.error('Failed to fetch Full & Final Payroll data', 'Error');
    });
  }

  getFnFUsers(fnfPayrollId: string): void {
    const payload = {
      skip: '',
      next: '',
      payrollFNF: fnfPayrollId
    }

    this.payrollService.getFnFUsers(payload).subscribe(
      (res: any) => {
        const fnfPayroll = this.fnfPayroll.data.find((fnf: any) => fnf._id === fnfPayrollId);
        if (fnfPayroll) {
          fnfPayroll.userList = res.data;
          fnfPayroll.userLength = res.total;
        }
      },
      (error: any) => {
        this.toast.error('Failed to fetch FnF Users', 'Error');
      }
    );
  }

  open(content: any) {
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', backdrop: 'static' }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  editFnF(user: any) {
    this.payrollService.selectedFnFPayroll.next(user);
    // this.getFnFAttendanceUsers(user);
    this.selectedFnFUser = user;
    this.fnfUserForm.patchValue({
      ...user,
      payrollFNF: this.selectedFnFUser._id
    });
    this.open(this.fnfUserModal);
  }

  openFnFSteps(user: any) {
    this.selectedFnFUser = user;
    this.showFnFPayroll = false;
    this.showFnFSteps = true;

    this.payrollService.selectedFnFPayroll.next({ ...user, isSteps: this.showFnFSteps })

    // let payload = {
    //   skip: '', next: '', payrollFNF: user._id
    // }
    // this.payrollService.getFnFUsers(payload).subscribe(
    //   (res: any) => {
    //     this.userList = res.data;
    //     this.payrollService.selectedFnFPayroll.next({ ...user, userList: this.userList, isSteps: this.showFnFSteps });
    //   },
    //   (error: any) => {
    //     this.toast.error('Failed to fetch FnF Users', 'Error');
    //   }
    // );

    this.changeView.emit();
  }

  goBack() {
    this.showFnFPayroll = true;
    this.changeView.emit();
  }

  onSubmission() {
    if (this.fnfForm.valid) {
      const payload = this.fnfForm.value;
      this.payrollService.addFnF(payload).subscribe((res: any) => {
        this.fnfPayroll.data = [...this.fnfPayroll.data, res.data];
        const currentMonthIndex = new Date().getMonth();
        this.selectedMonth = this.fnfMonths[currentMonthIndex];
        const currentYear = new Date().getFullYear();
        this.selectedYear = currentYear;
        this.fnfForm.setValue({
          date: new Date(),
          month: this.selectedMonth,
          year: this.selectedYear
        });
        this.modalService.dismissAll();
        this.toast.success('Full & Final Payroll Created', 'Success');
      }, error => {
        this.toast.error('Failed to create Full & Final Payroll', 'Error');
      });
    }
  }

  // onMemberSelection(event: any) {
  //   const userId = event.value;
  //   console.log('Selected user ID:', userId);
  //   this.getTotalByUser(userId);
  // }

  getTotalByUser(userId: string) {
    let totalCTC = 0;
    this.userService.getSalaryByUserId(userId).subscribe((res: any) => {
      const lastSalaryRecord = res.data[res.data.length - 1];
      if (lastSalaryRecord.enteringAmount === 'Monthly') {
        totalCTC = lastSalaryRecord.Amount * 12;
      }
      if (lastSalaryRecord.enteringAmount === 'Yearly') {
        totalCTC = lastSalaryRecord.Amount;
      }
     
      this.payrollService.getFlexiByUsers(userId).subscribe((res: any) => {
        const totalFlexiBenefits = res?.data?.records?.reduce((sum, flexiBenefit) =>
          sum + (flexiBenefit.TotalFlexiBenefitAmount || 0), 0) || 0;
        
        const totalFDYearlyAmount = lastSalaryRecord.fixedDeductionList?.reduce((sum, deduction) =>
          sum + (deduction.yearlyAmount || 0), 0) || 0;

        const totalVDYearlyAmount = lastSalaryRecord.variableDeductionList?.reduce((sum, deduction) =>
          sum + (deduction.yearlyAmount || 0), 0) || 0;

        const totalECYearlyAmount = lastSalaryRecord.employerContributionList?.reduce((sum, contribution) =>
          sum + (contribution.yearlyAmount || 0), 0) || 0;

        const deductions = totalFDYearlyAmount + totalVDYearlyAmount + totalECYearlyAmount

        const totalTakeHome = totalCTC - deductions;

        this.fnfUserForm.patchValue({
          totalFlexiBenefits: totalFlexiBenefits,
          totalCTC: totalCTC,
          totalGrossSalary: lastSalaryRecord.Amount,
          totalTakeHome: totalTakeHome
        });
        this.fnfUserForm.get('totalFlexiBenefits').disable();
        this.fnfUserForm.get('totalCTC').disable();
        this.fnfUserForm.get('totalGrossSalary').disable();
        this.fnfUserForm.get('totalTakeHome').disable();
      });
    });
  }

  onFnFUserSubmission() {
    this.fnfUserForm.patchValue({
      user: this.selectedUserId
    })

    this.fnfUserForm.get('totalFlexiBenefits').enable();
    this.fnfUserForm.get('totalCTC').enable();
    this.fnfUserForm.get('totalGrossSalary').enable();
    this.fnfUserForm.get('totalTakeHome').enable();

    if (this.fnfUserForm.valid) {

      this.payrollService.addFnFUser(this.fnfUserForm.value).subscribe((res: any) => {
        this.toast.success('FnF User Updated', 'Success');
        this.modalService.dismissAll();
        this.fetchFnFPayroll();
      }, error => {
        this.toast.error('Failed to update FnF User', 'Error');
      });

    }
    this.fnfUserForm.get('totalFlexiBenefits').disable();
    this.fnfUserForm.get('totalCTC').disable();
    this.fnfUserForm.get('totalGrossSalary').disable();
    this.fnfUserForm.get('totalTakeHome').disable();
  }

  resetForm() {
    const currentMonthIndex = new Date().getMonth();
    this.selectedMonth = this.fnfMonths[currentMonthIndex];
    const currentYear = new Date().getFullYear();
    this.selectedYear = currentYear;
    this.fnfForm.setValue({
      date: new Date(),
      month: this.selectedMonth,
      year: this.selectedYear
    });
  }

  deleteTemplate(_id: string) {
    this.payrollService.deleteFnF(_id).subscribe((res: any) => {
      this.ngOnInit();
      this.toast.success('Full & Final Payroll Deleted', 'Success');
    }, error => {
      this.toast.error('Failed to delete Full & Final Payroll', 'Error');
    });
  }

  deleteFnF(id: string): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, { width: '400px', });
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'delete') { this.deleteTemplate(id); }
    });
  }

  completeFnF() {
    // Implement the logic to complete the FnF process
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


  // getFnFAttendanceUsers(data: any) {
  //   const payload = {
  //     skip: '',
  //     next: '',
  //     month: data?.month,
  //     year: data?.year,
  //     isFNF: true
  //   }
  //   this.attendanceService.getfnfAttendanceProcess(payload).subscribe((res: any) => {
  //     this.fnfAttendanceUsers = res['data'].map((record: any) => record.users).flat();
  //     console.log(this.fnfAttendanceUsers);
  //   });
  // }

  getUserName(userId: string) {
    const matchedName = this.userList.find(user => user._id === userId);
    return matchedName ? `${matchedName.firstName + ' ' + matchedName.lastName}` : '';
  }

}