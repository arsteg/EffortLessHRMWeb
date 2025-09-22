import { Component, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { PayrollService } from 'src/app/_services/payroll.service';
import { TranslateService } from '@ngx-translate/core';
import { ActionVisibility, TableColumn } from 'src/app/models/table-column';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-payslips',
  templateUrl: './payslips.component.html',
  styleUrl: './payslips.component.css'
})
export class PayslipsComponent {
  closeResult: string = '';
  searchText: string = '';
  showPayslipDetail: boolean;
  displayedColumns: string[] = ['PayrollUser', 'period', 'payroll', 'status', 'actions'];
  payslips = [];
  selectedRecord: any;
  view = localStorage.getItem('adminView');
  user = JSON.parse(localStorage.getItem('currentUser'));
  private readonly translate = inject(TranslateService);
  columns: TableColumn[] = [
    { key: 'PayrollUser', name: 'Employee', valueFn: (row: any) => row?.PayrollUser?.user?.firstName + ' ' + row?.PayrollUser?.user?.lastName },
    { key: 'period', name: 'Period', valueFn: (row: any) =>  row?.PayrollUser?.payroll ? row?.PayrollUser?.payroll?.month + '-' + row?.PayrollUser?.payroll?.year : '' },
    { key: 'generatedOn', name: 'Generated On', valueFn: (row: any) => row?.PayrollUser?.payroll?.date ? this.datePipe.transform(row?.PayrollUser?.payroll?.date, 'mediumDate') : '' },
    { key: 'status', name: 'Status', valueFn: (row: any) => row?.PayrollUser?.payroll?.status },
    {
      key: 'actions', name: 'Actions',
      isAction: true, options: [
        { label: 'Show Payslip', icon: '', visibility: ActionVisibility.LABEL, cssClass: 'success-btn' }
      ]
    },
  ]

  constructor(private dialog: MatDialog,
    private payrollService: PayrollService,
    private datePipe: DatePipe
  ) { }

  ngOnInit() {
    if (this.view == 'admin') {
      this.payrollService.getAllGeneratedPayroll().subscribe((res: any) => {
        this.payslips = res.data;
      });
    } else {
      this.payrollService.getGeneratedPayrollByUser(this.user?.id).subscribe((res: any) => {
        this.payslips = res.data;
      })
    }
  }

  onActionClick(event: any) {
    switch (event.action.label) {
      case 'Show Payslip':
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
      console.log(`Dialog result: ${result}`);
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

export interface Payslip {
  employee: string;
  period: string;
  payroll: string;
  status: string;
}