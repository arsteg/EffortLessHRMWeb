import { Component } from '@angular/core';
import { PayrollService } from 'src/app/_services/payroll.service';

@Component({
  selector: 'app-pt-deduction',
  templateUrl: './pt-deduction.component.html',
  styleUrl: './pt-deduction.component.css'
})
export class PtDeductionComponent {
  months = ['N/A', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  deductionMonth: any;

  constructor(private payroll: PayrollService) { }

  ngOnInit() {
    this.getDeductionMonth();
  }

  getDeductionMonth() {
    this.payroll.getDeductionMonth().subscribe((res: any) => {
      this.deductionMonth = res.data;
    });
  }
}
