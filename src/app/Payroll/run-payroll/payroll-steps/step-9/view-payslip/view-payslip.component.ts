import { Component, Input } from '@angular/core';
import { AuthenticationService } from 'src/app/_services/authentication.service';
import { PayrollService } from 'src/app/_services/payroll.service';

@Component({
  selector: 'app-view-payslip',
  templateUrl: './view-payslip.component.html',
  styleUrl: './view-payslip.component.css'
})
export class ViewPayslipComponent {
  @Input() viewPayroll: any;
  @Input() selectedPayroll: any;
  userProfile: any;
  attendanceSummary: any[];
  salaryAfterLOP: any;

  constructor(private authService: AuthenticationService,
    private payrollService: PayrollService
  ) { }

  ngOnInit() {
    this.getUser();
    this.getLopDays();
    this.calculateSalaryAfterLOP();
  }

  getUser() {
    this.authService.GetMe(this.viewPayroll?.employee).subscribe((res: any) => {
      this.userProfile = res.data.users;
    })
  }

  getLopDays() {
    this.payrollService.getAttendanceSummary(this.viewPayroll?.payrollUser).subscribe((res: any) => {
      this.attendanceSummary = res.data;
      console.log(this.attendanceSummary);
    })
  }

  calculateSalaryAfterLOP(): void {
    const monthlySalary = this.viewPayroll.monthlySalary;
    const lopDays = this.attendanceSummary[0]?.lopDays;
    const payableDays = this.attendanceSummary[0].payableDays;

    const totalDays = lopDays + payableDays;
    const perDayPay = monthlySalary / totalDays;
    const lopSalary = lopDays * perDayPay;
    console.log(this.salaryAfterLOP);
    this.salaryAfterLOP = monthlySalary - lopSalary;
  }
}
