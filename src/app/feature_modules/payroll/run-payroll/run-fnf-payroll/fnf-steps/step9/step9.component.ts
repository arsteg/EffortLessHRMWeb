import { Component, inject, Input, TemplateRef, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { PayrollService } from 'src/app/_services/payroll.service';
import { map, catchError } from 'rxjs';
import { ActionVisibility, TableColumn } from 'src/app/models/table-column';
import { TranslateService } from '@ngx-translate/core';

interface PayrollStatus {
  InProgress: string;
  Pending: string;
  OnHold: string;
  Processed: string;
  Approved: string;
  Paid: string;
  Cleared: string;
  Rejected: string;
  Finilized: string;
  Exit_Interview_Completed: string;
}

@Component({
  selector: 'app-step9',
  templateUrl: './step9.component.html',
  styleUrls: ['./step9.component.css']
})
export class FNFStep9Component {
  searchText: string = '';
  allUsers: any;
  selectedRecord: any;
  payrollUser: any;
  @Input() selectedPayroll: any;
  @Input() selectedFnF: any;

  generatedPayroll: any[] = [];
  payrollStatus: any;
  payrollStatusArray: any[] = [];
  selectedStatus: string = '';
  selectedPayrollUser: any;
  @ViewChild('updateStatus') updateStatus: TemplateRef<any>;
  @ViewChild('dialogTemplate') dialogTemplate: TemplateRef<any>;
  private readonly translate = inject(TranslateService);
  isEditMode: boolean = false;

  payrollForm: FormGroup;

  columns: TableColumn[] = [
    {
      key: 'PayrollUsers',
      name: this.translate.instant('payroll.payroll_user_label'),
      valueFn: (row) => row.PayrollFNFUser?.user
        ? `${row.PayrollFNFUser.user.firstName} ${row.PayrollFNFUser.user.lastName}`
        : this.translate.instant('payroll.no_user_specified')
    },
    {
      key: 'totalFixedAllowance',
      name: this.translate.instant('payroll.total_fixed_allowances'),
      valueFn: (row) => row.totalFixedAllowance || 0
    },
    {
      key: 'totalVariableAllowance',
      name: this.translate.instant('payroll.total_variable_allowances'),
      valueFn: (row) => row.totalVariableAllowance || 0
    },
    {
      key: 'manualArrears',
      name: this.translate.instant('payroll.manual_Arrears'),
      valueFn: (row) => row.manualArrears?.totalArrears || 0
    },
    // {
    //   key: 'totalOtherBenefit',
    //   name: this.translate.instant('payroll._fnf.steps.compensation'),
    //   valueFn: (row) => row.totalOtherBenefit || 0
    // },
    {
      key: 'totalOvertime',
      name: this.translate.instant('payroll.total_overtime'),
      valueFn: (row) => row.totalOvertime || 0
    },
    {
      key: 'totalFixedDeduction',
      name: this.translate.instant('payroll.total_fixed_deductions'),
      valueFn: (row) => row.totalFixedDeduction || 0
    },
    {
      key: 'totalVariableDeduction',
      name: this.translate.instant('payroll.total_variable_deductions'),
      valueFn: (row) => row.totalVariableDeduction || 0
    },
    {
      key: 'totalLoanRepayment',
      name: this.translate.instant('payroll.total_loan_advance'),
      valueFn: (row) => row.totalLoanRepayment || 0
    },
    {
      key: 'totalIncomeTax',
      name: this.translate.instant('payroll.total_tds'),
      valueFn: (row) => row.totalIncomeTax || 0
    },
    {
      key: 'yearlySalary',
      name: this.translate.instant('payroll.total_ctc'),
      valueFn: (row) => row.totalCTC || 0
    },
    {
      key: 'monthlySalary',
      name: this.translate.instant('payroll.total_gross_salary'),
      valueFn: (row) => row.totalGrossSalary || 0
    },
    {
      key: 'totalEmployerStatutoryContribution',
      name: this.translate.instant('payroll.total_employer_statutory_contribution'),
      valueFn: (row) => row.totalEmployerStatutoryContribution || 0
    },
    {
      key: 'totalEmployeeStatutoryDeduction',
      name: this.translate.instant('payroll.total_employee_statutory_deduction'),
      valueFn: (row) => row.totalEmployeeStatutoryDeduction || 0
    },
    {
      key: 'payroll_status',
      name: this.translate.instant('payroll._history.form.status'),
      valueFn: (row) => row.PayrollFNFUser?.status
        ? row.PayrollFNFUser.status.charAt(0).toUpperCase() + row.PayrollFNFUser.status.slice(1).toLowerCase()
        : 'N/A'
    },
    {
      key: 'totalTakeHome',
      name: this.translate.instant('payroll.take_home_salary'),
      valueFn: (row) => row.totalTakeHome || 0
    },
    {
      key: 'actions',
      name: this.translate.instant('payroll.actions'),
      isAction: true,
      options: [
        { label: this.translate.instant('payroll.view'), visibility: ActionVisibility.BOTH, icon: 'remove_red_eye', hideCondition: (row) => false }
      ]
    }
  ];

  constructor(
    private dialog: MatDialog,
    private payrollService: PayrollService,
    private toast: ToastrService
  ) { }

  ngOnInit() {
    this.getFNFPayrollStatus();
    this.getGeneratedPayroll();
    this.payrollService.allUsers.subscribe(res => {
      this.allUsers = res;
    });
    this.payrollService.payrollUsers.subscribe(res => {
      this.payrollUser = res;
    });
  }

  getFNFPayrollStatus() {
    this.payrollService.getFNFPayrollUserStatus().subscribe({
      next: (res: any) => {
        this.payrollStatus = res.data;
        this.payrollStatusArray = Object.values(this.payrollStatus).filter(status => status);
        // Update actions column with status options
        this.columns = this.columns.map(column => {
          if (column.key === 'actions') {
            return {
              ...column,
              options: [
                { label: this.translate.instant('payroll.view'), visibility: ActionVisibility.BOTH, icon: 'remove_red_eye', hideCondition: (row) => false },
                ...this.payrollStatusArray.map((status: string) => ({
                  label: status,
                  visibility: ActionVisibility.LABEL,
                  icon: '',
                  hideCondition: (row: any) => status.toLowerCase() === row.PayrollFNFUser?.status?.toLowerCase()
                }))
              ]
            };
          }
          return column;
        });
      },
      error: () => {
        this.toast.error(this.translate.instant('payroll.failed_fetch_payroll_status'), this.translate.instant('payroll.error'));
      }
    });
  }

  getGeneratedPayroll() {
    this.payrollService.getGeneratedFnFPayrollByFNFPayroll(this.selectedFnF?._id).pipe(
      map((res: any) => res.data),
      catchError((error) => {
        this.toast.error(this.translate.instant('payroll.failed_fetch_generated_payroll'), this.translate.instant('payroll.error'));
        throw error;
      })
    ).subscribe({
      next: (data) => {
        this.generatedPayroll = data;
      },
      error: (error) => {
      }
    });
  }

  openUpdateStatusDialog(status: string) {
    this.selectedStatus = status;
    this.dialog.open(this.updateStatus, {
      width: '600px',
      disableClose: true,
      data: status
    });
  }

  updatePayrollStatus() {
    const id = this.selectedPayrollUser?.PayrollFNFUser?._id;
    const payload = {
      updatedOnDate: new Date(),
      status: this.selectedStatus
    };
    this.payrollService.updateFnFUserStatus(id, payload).subscribe({
      next: () => {
        this.toast.success(this.translate.instant('payroll._history.toast.status_updated'), this.translate.instant('payroll.successfully'));
        this.getGeneratedPayroll();
        this.closeDialog();
      },
      error: () => {
        this.toast.error(this.translate.instant('payroll._history.toast.error_update_status'), this.translate.instant('payroll.error'));
      }
    });
  }

  openDialog(data?: any): void {
    this.isEditMode = !!data;
    this.selectedRecord = data;
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

  onAction(event: any): void {
    this.selectedPayrollUser = event.row;
    if (event.action.label === 'View') {
      this.openDialog(event.row);
    } else {
      // Handle status change actions
      this.openUpdateStatusDialog(event.action.label);
    }
  }
}