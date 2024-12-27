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
  @Output() changeView = new EventEmitter<void>();

  @ViewChild('fnfUserModal') fnfUserModal: TemplateRef<any>;

  constructor(private modalService: NgbModal,
    private fb: FormBuilder,
    private payrollService: PayrollService,
    private commonService: CommonService,
    private toast: ToastrService,
    private dialog: MatDialog,
    private userService: UserService) {
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

  generateYearList() {
    const currentYear = new Date().getFullYear();
    this.years = [currentYear - 1, currentYear, currentYear + 1];
  }

  onYearChange(event: any) {
    this.selectedYear = event.target.value;
    console.log('Selected year:', this.selectedYear);
  }

  fetchFnFPayroll() {
    const payload = { skip: '', next: '' };
    this.payrollService.getFnF(payload).subscribe(res => {
      this.fnfPayroll.data = res.data;
    }, error => {
      this.toast.error('Failed to fetch Full & Final Payroll data', 'Error');
    });
  }

  open(content: any) {
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', backdrop: 'static' }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  editFnF(user: any) {
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
    let payload = {
      skip: '', next: '', payrollFNF: user._id
    }
    this.payrollService.getFnFUsers(payload).subscribe(
      (res: any) => {
        this.userList = res.data;
        this.payrollService.selectedFnFPayroll.next({ ...user, userList: this.userList });
      },
      (error: any) => {
        this.toast.error('Failed to fetch FnF Users', 'Error');
      }
    );
    
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

  onMemberSelection(event: any) {
    const userId = event.value;
    console.log('Selected user ID:', userId);
    this.getTotalByUser(userId);
  }

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
      console.log('Last Salary Record:', lastSalaryRecord);
      console.log('Total CTC:', totalCTC);

      this.payrollService.getFlexiByUsers(userId).subscribe((res: any) => {
        const totalFlexiBenefits = res?.data?.records?.reduce((sum, flexiBenefit) =>
          sum + (flexiBenefit.TotalFlexiBenefitAmount || 0), 0) || 0;
        console.log('Total Flexi Benefits:', totalFlexiBenefits);

        const totalFDYearlyAmount = lastSalaryRecord.fixedDeductionList?.reduce((sum, deduction) =>
          sum + (deduction.yearlyAmount || 0), 0) || 0;

        const totalVDYearlyAmount = lastSalaryRecord.variableDeductionList?.reduce((sum, deduction) =>
          sum + (deduction.yearlyAmount || 0), 0) || 0;

        const totalECYearlyAmount = lastSalaryRecord.employerContributionList?.reduce((sum, contribution) =>
          sum + (contribution.yearlyAmount || 0), 0) || 0;

        const deductions = totalFDYearlyAmount + totalVDYearlyAmount + totalECYearlyAmount

        const totalTakeHome = totalCTC - deductions;
        console.log('Total Take Home:', totalTakeHome);

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
    if (this.fnfUserForm.valid) {
      this.fnfUserForm.get('totalFlexiBenefits').enable();
      this.fnfUserForm.get('totalCTC').enable();
      this.fnfUserForm.get('totalGrossSalary').enable();
      this.fnfUserForm.get('totalTakeHome').enable();
      this.payrollService.addFnFUser(this.fnfUserForm.value).subscribe((res: any) => {
        this.toast.success('FnF User Updated', 'Success');
        this.modalService.dismissAll();
        this.fetchFnFPayroll();
      }, error => {
        this.toast.error('Failed to update FnF User', 'Error');
      });
      this.fnfUserForm.get('totalFlexiBenefits').disable();
      this.fnfUserForm.get('totalCTC').disable();
      this.fnfUserForm.get('totalGrossSalary').disable();
      this.fnfUserForm.get('totalTakeHome').disable();
    }
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

  getFnFUsers(): void {
    const fnfPayroll = this.payrollService.selectedFnFPayroll.getValue();
    const payload = { fnfPayrollId: fnfPayroll._id };
    this.payrollService.getFnFUsers(payload).subscribe(
      (res: any) => {
        this.userList = res.data;
      },
      (error: any) => {
        this.toast.error('Failed to fetch FnF Users', 'Error');
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
}
