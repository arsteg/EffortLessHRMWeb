import { Component, Input } from '@angular/core';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonService } from 'src/app/_services/common.Service';
import { PayrollService } from 'src/app/_services/payroll.service';
import { UserService } from 'src/app/_services/users.service';

@Component({
  selector: 'app-step-9',
  templateUrl: './step-9.component.html',
  styleUrl: './step-9.component.css'
})
export class Step9Component {
  searchText: string = '';
  closeResult: string = '';
  payrollUsers: any[] = [];
  users: any;
  totalFAYearlyAmount: number = 0;
  totalOBYearlyAmount: number = 0;
  totalFDYearlyAmount: number = 0;
  totalLoanAdvance: number = 0;
  monthlySalary: number = 0;
  grossSalary: number = 0;

  @Input() selectedPayroll: any;

  constructor(private modalService: NgbModal,
    private payrollService: PayrollService,
    private commonService: CommonService,
    private userService: UserService
  ) { }

  ngOnInit() {
    this.getPayrollUsers();
    this.getAllUsers();
  }

  getAllUsers() {
    this.commonService.populateUsers().subscribe((res: any) => {
      this.users = res.data.data;
    })
  }

  getUser(employeeId: string) {
    const matchingUser = this.users?.find(user => user._id === employeeId);
    return matchingUser ? `${matchingUser.firstName} ${matchingUser.lastName}` : 'N/A';
  }

  open(content: any) {
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

  getPayrollUsers() {
    const payload = { skip: '', next: '', payroll: this.selectedPayroll?._id };
    this.payrollService.getPayrollUsers(payload).subscribe((res: any) => {
      const payrollUsers = res.data;

      payrollUsers.forEach((payrollUser) => {
        this.userService.getSalaryByUserId(payrollUser?.user).subscribe((res: any) => {

          // Loans/Advances of payroll users

          const lastSalaryRecord = res.data[res.data.length - 1];

          const enteringSalary = lastSalaryRecord.enteringAmount;
          const salaryAmount = lastSalaryRecord.Amount;
  
          const { monthlySalary, yearlySalary } = enteringSalary === 'Yearly'
            ? { monthlySalary: salaryAmount / 12, yearlySalary: salaryAmount }
            : { monthlySalary: salaryAmount, yearlySalary: salaryAmount * 12 };
  
          // fixedAllowanceList accumulation
          const totalFAYearlyAmount = lastSalaryRecord.fixedAllowanceList?.reduce((sum, allowance) => 
            sum + (allowance.yearlyAmount || 0), 0) || 0;
  
          // otherBenefitList accumulation
          const totalOBYearlyAmount = lastSalaryRecord.otherBenefitList?.reduce((sum, benefit) => 
            sum + (benefit.yearlyAmount || 0), 0) || 0;
  
          // fixedDeductionList accumulation
          const totalFDYearlyAmount = lastSalaryRecord.fixedDeductionList?.reduce((sum, deduction) => 
            sum + (deduction.yearlyAmount || 0), 0) || 0;
  
          // Loans/Advances
          this.userService.getLoansAdvancesByUserId(payrollUser?.user, { skip: '', next: '' }).subscribe((loanRes: any) => {
            const totalLoanAdvance = loanRes.data?.reduce((sum, loanAdvance) => 
              sum + (loanAdvance.amount || 0), 0) || 0;
  
            // Push to payrollUsers with accumulated values
            this.payrollUsers.push({
              employee: lastSalaryRecord.user,
              totalFixedAllowance: totalFAYearlyAmount,
              totalOtherBenefit: totalOBYearlyAmount,
              totalFixedDeduction: totalFDYearlyAmount,
              totalLoanAdvance: totalLoanAdvance,
              monthlySalary: monthlySalary,
              yearlySalary: yearlySalary
            });
            console.log(this.payrollUsers);
          });
        });
      });
    });
  }
}
