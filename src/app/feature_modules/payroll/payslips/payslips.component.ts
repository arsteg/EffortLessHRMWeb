import { Component, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { PayrollService } from 'src/app/_services/payroll.service';
import { TranslateService } from '@ngx-translate/core';

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
  payslips = new MatTableDataSource<any>;
  selectedRecord: any;
  view = localStorage.getItem('adminView');
  user = JSON.parse(localStorage.getItem('currentUser'));
  private readonly translate = inject(TranslateService);

  constructor(private dialog: MatDialog,
    private payrollService: PayrollService
  ) { }

  ngOnInit() {
    if (this.view == 'admin') {
      this.payrollService.getAllGeneratedPayroll().subscribe((res: any) => {
        this.payslips = res.data;
      });
    } else {
      this.payrollService.getGeneratedPayrollByUser('68120a7f6602ce9410720605').subscribe((res: any) => {
        this.payslips = res.data;
      })
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