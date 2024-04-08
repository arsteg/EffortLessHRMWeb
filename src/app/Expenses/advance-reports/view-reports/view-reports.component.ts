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

  constructor(public expenseService: ExpensesService) { }

  ngOnInit() {
    this.advanceReport = this.expenseService.advanceReport.getValue();
    console.log(this.advanceReport);
  }

  closeModal() {
    this.close.emit(true);
  }

}
