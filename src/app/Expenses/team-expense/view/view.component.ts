import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ExpensesService } from 'src/app/_services/expenses.service';

@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
  styleUrl: './view.component.css'
})
export class ViewComponent {
  @Output() close: any = new EventEmitter();
  @Input() expense: any;
  expenseReportExpense: any;
  expenseReport: any;
  category: any;

  constructor(private expenseService: ExpensesService) { }
  ngOnInit() {
    let id = this.expenseService.report.getValue()._id;
    console.log(this.expenseService.report.getValue())
    this.expenseService.advanceReport.subscribe(res =>{
      this.expenseReport = res;
      console.log(this.expenseReport);
    });
  }
  
  closeModal() {
    this.close.emit(true);
  }

}
