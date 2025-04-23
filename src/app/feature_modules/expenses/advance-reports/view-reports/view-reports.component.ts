import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonService } from 'src/app/_services/common.Service';
import { ExpensesService } from 'src/app/_services/expenses.service';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-view-reports',
  templateUrl: './view-reports.component.html',
  styleUrl: './view-reports.component.css'
})
export class ViewReportsComponent {
  private translate: TranslateService = inject(TranslateService);
  @Output() close: any = new EventEmitter();
  advanceReport: any;
  report: any;
  allAssignee: any[];
  allCategory: any;

  constructor(public expenseService: ExpensesService,
    private commonService: CommonService
  ) { }

  ngOnInit() {
    this.report = this.expenseService.advanceReport.getValue();
    console.log(this.report)
    this.expenseService.getAdvanceReportById(this.report._id).subscribe((res: any) => {
      this.advanceReport = res.data;
    });
    this.commonService.populateUsers().subscribe(result => {
      this.allAssignee = result && result.data && result.data.data;
    });

    this.expenseService.getAdvanceCatgories({ skip: '', next: '' }).subscribe((res: any) => {
      this.allCategory = res.data;
    });
  }

  closeModal() {
    this.close.emit(true);
  }
  getUser(employeeId: string) {
    const matchingUser = this.allAssignee?.find(user => user?._id === employeeId);
    return matchingUser ? `${matchingUser.firstName} ${matchingUser.lastName}` : '';
  }

  getCategory(categoryId: string) {
    const matchingCategory = this.allCategory?.find(category => category?._id === categoryId);
    return matchingCategory ? `${matchingCategory?.label}` : this.translate.instant('expenses.category_not_found');
  }

}
