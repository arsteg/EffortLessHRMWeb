import { Component, Input, TemplateRef, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { PayrollService } from 'src/app/_services/payroll.service';
import { ActionVisibility, TableColumn } from 'src/app/models/table-column';
import { receiveMessageOnPort } from 'worker_threads';

interface PayrollStatus {
  InProgress: string,
  Pending: string,
  OnHold: string,
  Processed: string,
  Approved: string,
  Paid: string,
  Cleared: string,
  Rejected: string,
  Finilized: string,
  Exit_Interview_Completed: string
}

@Component({
  selector: 'app-step-9',
  templateUrl: './step-9.component.html',
  styleUrl: './step-9.component.css'
})
export class Step9Component {
  searchText: string = '';
  closeResult: string = '';
  allUsers: any;
  selectedRecord: any;
  payrollUser: any;
  @Input() selectedPayroll: any;
  selectedPayrollUser: any;
  generatedPayroll: any[] = [];
  payrollStatus: any;
  payrollStatusArray: any;
  selectedStatus: string = '';
  @ViewChild('updateStatus') updateStatus: TemplateRef<any>;
  @ViewChild('dialogTemplate') dialogTemplate: TemplateRef<any>;
  @ViewChild('updateStatusResignation') updateStatusResignation: TemplateRef<any>;
  isEditMode: boolean = false;
  payrollForm: FormGroup;
  changedStatus: string;
  dialogRef: any;
  displayedColumns = [
    'PayrollUsers',
    'totalOvertime',
    'totalFixedAllowance',
    'totalFixedDeduction',
    'totalLoanRepayment',
    'totalLoanDisbursed',
    'totalFlexiBenefits',
    'totalIncomeTax',
    'yearlySalary',
    'monthlySalary',
    'totalEmployerStatutoryContribution',
    'totalEmployeeStatutoryDeduction',
    'payroll_status',
    'totalTakeHome',
    'actions'
  ];

  columns: TableColumn[] = [
    { key: 'PayrollUsers', name: 'Employee Name', valueFn: (row) => row?.PayrollUser?.user?.firstName + ' ' + row?.PayrollUser?.user?.lastName },
    { key: 'totalOvertime', name: 'Total Overtime' },
    { key: 'totalFixedAllowance', name: 'Total Fixed Allowances' },
    { key: 'totalFixedDeduction', name: 'Total Fixed Deductions', },
    { key: 'totalLoanRepayment', name: 'Total Loan Repayment', },
    { key: 'totalLoanDisbursed', name: 'Total Loan Disbursed', },
    { key: 'totalFlexiBenefits', name: 'Total Flexi Benefits', },
    { key: 'totalIncomeTax', name: 'Total TDS', },
    { key: 'yearlySalary', name: 'Total CTC', },
    { key: 'monthlySalary', name: 'Total Gross Salary', },
    { key: 'totalEmployerStatutoryContribution', name: 'Total Employer Statutory Contribution', },
    { key: 'totalEmployeeStatutoryDeduction', name: 'Total Employee Statutory Deduction', },
    { key: 'payroll_status', name: 'Payroll Status', valueFn: (row) => row?.PayrollUser?.status },
    { key: 'totalTakeHome', name: 'Total Take Home', },
    {
      key: 'actions', name: 'Actions', isAction: true, options: [
        { label: 'View', visibility: ActionVisibility.BOTH, icon: 'remove_red_eye' }
      ]
    },
  ]

  constructor(
    private dialog: MatDialog,
    private payrollService: PayrollService,
    private toast: ToastrService
  ) { }

  ngOnInit() {
    this.getPayrollStatus();
    this.payrollService.allUsers.subscribe(res => {
      this.allUsers = res;
    });
    this.payrollService.payrollUsers.subscribe(res => {
      this.payrollUser = res;
    });
    this.getGeneratedPayroll();
  }

  onAction(event: any) {
    console.log(event.action.label);
    switch (event.action.label) {
      case 'View':
        this.selectedStatus = event.row?._id;
        this.selectedRecord = event.row;
        this.openDialog()
        break;

      default:
        // this.payrollStatusArray.forEach(status => {

        //     if (status === event.row?.PayrollUser?.status) {
        //       this.selectedPayrollUser = event.row;
        //       this.openUpdateStatusDialog(status)
        //     }

        // })
        this.selectedPayrollUser = event.row;
        this.openUpdateStatusDialog(event.action.label);
        break;
    }
  }

  getPayrollStatus() {
    this.payrollService.getPayrollUserStatus().subscribe((res: any) => {
      this.payrollStatus = res.data;
      this.payrollStatusArray = Object.values(this.payrollStatus).filter(status => status);

      const actionColumn = this.columns.find((col) => col.key === 'actions');
      this.payrollStatusArray.forEach((value: any) => {
        actionColumn.options.push({
          label: value,
          icon: '',
          visibility: ActionVisibility.LABEL,
          hideCondition: (row) => {
            return row.status === value
          }
        })
      });
    });
  }

  openUpdateStatusDialog(status: string) {
    this.selectedStatus = status;
    const dialogRef = this.dialog.open(this.updateStatus, {
      width: '600px',
      disableClose: true,
      data: status
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) { }
    });
  }
  closeAddDialog() {
    this.dialog.closeAll();
  }

  updatePayrollStatus() {
    const id = this.selectedPayrollUser?.PayrollUser?._id;
    const payload = {
      updatedOnDate: new Date(),
      status: this.selectedStatus
    };
    this.payrollService.updatePayrollUserStatus(id, payload).subscribe((res: any) => {
      this.toast.success('Payroll status updated successfully', 'Success');
      this.getGeneratedPayroll();
      this.closeAddDialog();
    })
  }

  getGeneratedPayroll() {
    if (!this.selectedPayroll?._id) {
      this.generatedPayroll = [];
      return;
    }
    this.payrollService.generatedPayrollByPayroll(this.selectedPayroll?._id).subscribe(
      (res: any) => {
        this.generatedPayroll = res.data.map((record) => {
          return {
            ...record,
            totalOvertime: record?.overtime[0]?.OvertimeAmount || 0,
            totalFixedAllowance: parseFloat(record?.totalFixedAllowance || 0).toFixed(2),
            totalFixedDeduction: parseFloat(record?.totalFixedDeduction || 0).toFixed(2),
            totalLoanRepayment: record?.totalLoanRepayment,
            totalLoanDisbursed: record.totalLoanDisbursed,
            totalFlexiBenefits: parseFloat(record?.totalFlexiBenefits || 0).toFixed(2),
            totalIncomeTax: record?.incomeTax[0]?.TDSCalculated || 0,
            yearlySalary: parseFloat(record?.yearlySalary || 0).toFixed(2),
            monthlySalary: parseFloat(record?.monthlySalary || 0).toFixed(2),
            totalTakeHome: parseFloat(record?.totalTakeHome || 0).toFixed(2),

            payroll_status: record?.payroll_status || 'Pending'
          };
        });
      },
      (error) => {
        console.error('Error fetching generated payroll:', error);
        this.generatedPayroll = [];
      }
    );
  }

  getUser(employeeId: string) {
    const matchingUser = this.allUsers?.find(user => user._id === employeeId);
    return matchingUser ? `${matchingUser.firstName} ${matchingUser.lastName}` : 'N/A';
  }

  openDialog(data?: any): void {
    this.isEditMode = !!data;
    if (this.isEditMode) {
      this.payrollForm?.patchValue(data);
    } else {
      this.payrollForm?.reset();
    }
    this.dialog.open(this.dialogTemplate, {
      width: '80%',
      height: '80%',
      disableClose: true
    });
  }

  closeDialog() {
    this.dialog.closeAll();
  }

  getCompanyNameFromCookies(): string | null {
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [key, value] = cookie.split('=').map(c => c.trim());
      if (key === 'companyName') {
        return decodeURIComponent(value);
      }
    }
    return null;
  }

  changeStatus(recordId: string, status: string): void {
    if (!recordId || !status) {
      return;
    }
    const updatedRecord = { _id: recordId, payroll_status: status };
    // this.payrollService.updatePayrollRecord(updatedRecord).subscribe(
    //   (response) => {
    //     this.getGeneratedPayroll(); // Refresh table data
    //   },
    //   (error) => {
    //   }
    // );
  }
}