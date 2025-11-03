import { DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { PayrollService } from 'src/app/_services/payroll.service';
import { ActionVisibility, TableColumn } from 'src/app/models/table-column';

@Component({
  selector: 'app-fnf-payslips',
  templateUrl: './fnf-payslips.component.html',
  styleUrl: './fnf-payslips.component.css'
})
export class FnfPayslipsComponent {
  closeResult: string = '';
  searchText: string = '';
  showPayslipDetail: boolean;
  displayedColumns: string[] = ['PayrollUser', 'period', 'payroll', 'status', 'actions'];
  payslips = [];
  selectedRecord: any;
  private readonly translate = inject(TranslateService);

  columns: TableColumn[] = [
    { key: 'PayrollUser', name: this.translate.instant('payroll.employee'), valueFn: (row: any) => row?.PayrollFNFUser?.user?.name },
    { key: 'period', name: this.translate.instant('payroll.period'), valueFn: (row: any) => row?.payroll?.month + '-' + row?.payroll?.year },
    { key: 'generatedOn', name: this.translate.instant('payroll.generated_on'), valueFn: (row: any) => row?.payroll?.date ? this.datePipe.transform(row?.payroll?.date, 'mediumDate') : '' },
    { key: 'status', name: this.translate.instant('payroll.status'), valueFn: (row: any) => row?.payroll?.status },
    {
      key: 'actions', name: this.translate.instant('payroll.actions'),
      isAction: true, options: [
        { label: this.translate.instant('payroll.show_payslip'), icon: '', visibility: ActionVisibility.LABEL, cssClass: 'success-btn' }
      ]
    },
  ]
  constructor(private dialog: MatDialog,
    private payrollService: PayrollService,
    private datePipe: DatePipe
  ) { }

  ngOnInit() {
    this.payrollService.getGeneratedFnFPayroll().subscribe((res: any) => {
      this.payslips = res.data;
    })
  }

  onActionClick(event: any) {
    switch (event.action.label) {
      case this.translate.instant('payroll.show_payslip'):
        this.selectedRecord = event.row;
        this.viewPayslip();
        break;
    }
  }

  refreshData() {
    this.ngOnInit();
  }

  open(content: any) {
    const dialogRef = this.dialog.open(content, {
      width: '500px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
    });
  }

  viewPayslip() {
    this.showPayslipDetail = true;
    this.payrollService.payslip.next(this.selectedRecord)
  }

  closePayslipDetail() {
    this.showPayslipDetail = false;
  }
}