import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { PayrollService } from 'src/app/_services/payroll.service';

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
  payslips = new MatTableDataSource<any>;
  selectedRecord: any;

  constructor(private dialog: MatDialog,
    private payrollService: PayrollService
  ) { }

  ngOnInit() {
    this.payrollService.getGeneratedFnFPayroll().subscribe((res: any) => {
      this.payslips = res.data;
    })
  }

  refreshData(){
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