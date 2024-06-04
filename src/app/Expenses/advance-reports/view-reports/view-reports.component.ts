import { Component, EventEmitter, Output } from '@angular/core';
import { ExpensesService } from 'src/app/_services/expenses.service';

@Component({
  selector: 'app-view-reports',
  templateUrl: './view-reports.component.html',
  styleUrl: './view-reports.component.css'
})
export class ViewReportsComponent {
  @Output() close: any = new EventEmitter();
  advanceReport: any;
  report: any;

  constructor(public expenseService: ExpensesService) { }

  ngOnInit() {
    this.report = this.expenseService.advanceReport.getValue();
    console.log(this.report)
    this.expenseService.getAdvanceReportById(this.report._id).subscribe((res: any) => {
      this.advanceReport = res.data;
    })
  }

  closeModal() {
    this.close.emit(true);
  }

}
