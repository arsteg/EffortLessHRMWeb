import { Component, inject, Input, TemplateRef, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { PayrollService } from 'src/app/_services/payroll.service';
import { ActionVisibility, TableColumn } from 'src/app/models/table-column';
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
  isSubmitted: boolean = false;
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
    private readonly translate = inject(TranslateService);

  columns: TableColumn[] = [
    { key: 'PayrollUsers', name: this.translate.instant('payroll.employee_name'), valueFn: (row) => row?.PayrollUser?.user?.firstName + ' ' + row?.PayrollUser?.user?.lastName },
    { key: 'totalOvertime', name: this.translate.instant('payroll.total_overtime'), },
    { key: 'totalFixedAllowance', name: this.translate.instant('payroll.total_fixed_allowances') },
    { key: 'totalVariableAllowance', name: this.translate.instant('payroll.total_variable_allowances') },
    { key: 'totalFixedDeduction', name: this.translate.instant('payroll.total_fixed_deductions') },
    { key: 'totalVariableDeduction', name: this.translate.instant('payroll.total_variable_deductions') },
    { key: 'totallopDaysAmount', name: this.translate.instant('payroll.total_lop_amount') },
    { key: 'totalLoanRepayment', name: this.translate.instant('payroll.total_loan_repayment') },
    { key: 'totalLoanDisbursed', name: this.translate.instant('payroll.total_loan_disbursed') },
    { key: 'totalFlexiBenefits', name: this.translate.instant('payroll.total_flexi_benefits') },
    { key: 'totalIncomeTax', name: this.translate.instant('payroll.total_tds') },
    { key: 'yearlySalary', name: this.translate.instant('payroll.total_ctc') },
    { key: 'monthlySalary', name: this.translate.instant('payroll.total_gross_salary') },
    { key: 'totalEmployerStatutoryContribution', name: this.translate.instant('payroll.total_employer_statutory_contribution')},
    { key: 'totalEmployeeStatutoryDeduction', name:this.translate.instant('payroll.total_employee_statutory_deduction') },
    { key: 'payroll_status', name:this.translate.instant('payroll._history.form.status'), valueFn: (row) => row?.PayrollUser?.status },
    { key: 'totalTakeHome', name: this.translate.instant('payroll._fnf.form.take_home') },
    {
      key: 'actions', name: this.translate.instant('payroll.actions'), isAction: true, options: [
        { label: this.translate.instant('payroll.view'), visibility: ActionVisibility.BOTH, icon: 'remove_red_eye' }
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
    this.isSubmitted = false;
    this.dialog.closeAll();
  }

  updatePayrollStatus() {
    this.isSubmitted = true;
    const id = this.selectedPayrollUser?.PayrollUser?._id;
    const payload = {
      updatedOnDate: new Date(),
      status: this.selectedStatus
    };
    this.payrollService.updatePayrollUserStatus(id, payload).subscribe((res: any) => {
      this.toast.success(this.translate.instant('payroll._history.toast.status_updated'));
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
          console.log(record);
          return {
            ...record,
            totalOvertime: record?.overtime[0]?.OvertimeAmount || 0,
            totalFixedAllowance: parseFloat(record?.totalFixedAllowance || 0).toFixed(2),
            totalFixedDeduction: parseFloat(record?.totalFixedDeduction || 0).toFixed(2),
            totalLoanRepayment: record?.totalLoanRepayment,
            totalLoanDisbursed: record.totalLoanDisbursed,
            totalFlexiBenefits: parseFloat(record?.totalFlexiBenefits || 0).toFixed(2),
            totalIncomeTax: record?.incomeTax[0]?.TDSCalculated || 0,
            yearlySalary: parseFloat(record?.totalCTC || 0).toFixed(2),
            monthlySalary: parseFloat(record?.totalGrossSalary || 0).toFixed(2),
            totalTakeHome: parseFloat(record?.totalTakeHome || 0).toFixed(2),

            payroll_status: record?.payroll_status || 'InProgress'
          };
        });
      },
      (error) => {
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