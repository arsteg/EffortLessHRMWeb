import { Component, Input, TemplateRef, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { PayrollService } from 'src/app/_services/payroll.service';
import { map, catchError } from 'rxjs';
import { ActionVisibility, TableColumn } from 'src/app/models/table-column';

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
  isEditMode: boolean = false;

  payrollForm: FormGroup;

  columns: TableColumn[] = [
    {
      key: 'PayrollUsers',
      name: 'Employee Name',
      valueFn: (row) => row.PayrollFNFUser?.user
        ? `${row.PayrollFNFUser.user.firstName} ${row.PayrollFNFUser.user.lastName}`
        : 'No User Specified'
    },
    {
      key: 'manualArrears',
      name: 'Manual Arrears',
      valueFn: (row) => row.manualArrears?.totalArrears || 0
    },
    {
      key: 'totalFixedAllowance',
      name: 'Total Variable Pay',
      valueFn: (row) => row.totalFixedAllowance || 0
    },
    {
      key: 'totalOtherBenefit',
      name: 'Termination/Resignation Compensation',
      valueFn: (row) => row.totalOtherBenefit || 0
    },
    {
      key: 'totalFixedDeduction',
      name: 'Total Overtime',
      valueFn: (row) => row.totalFixedDeduction || 0
    },
    {
      key: 'totalLoanRepayment',
      name: 'Total Loans/Advances',
      valueFn: (row) => row.totalLoanRepayment || 0
    },
    {
      key: 'totalIncomeTax',
      name: 'Total TDS',
      valueFn: (row) => row.totalIncomeTax || 0
    },
    {
      key: 'yearlySalary',
      name: 'Total CTC',
      valueFn: (row) => row.yearlySalary || 0
    },
    {
      key: 'monthlySalary',
      name: 'Total Gross Salary',
      valueFn: (row) => row.monthlySalary || 0
    },
    {
      key: 'totalEmployerStatutoryContribution',
      name: 'Total Employer Statutory Contribution',
      valueFn: (row) => row.totalEmployerStatutoryContribution || 0
    },
    {
      key: 'totalEmployeeStatutoryDeduction',
      name: 'Total Employee Statutory Deduction',
      valueFn: (row) => row.totalEmployeeStatutoryDeduction || 0
    },
    {
      key: 'payroll_status',
      name: 'Payroll Status',
      valueFn: (row) => row.PayrollFNFUser?.status
        ? row.PayrollFNFUser.status.charAt(0).toUpperCase() + row.PayrollFNFUser.status.slice(1).toLowerCase()
        : 'N/A'
    },
    {
      key: 'actions',
      name: 'Actions',
      isAction: true,
      options: [
        { label: 'View', visibility: ActionVisibility.BOTH, icon: 'remove_red_eye', hideCondition: (row) => false }
        // Status options will be dynamically added in getFNFPayrollStatus
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
    this.payrollService.getFNFPayrollStatus().subscribe({
      next: (res: any) => {
        this.payrollStatus = res.data;
        this.payrollStatusArray = Object.values(this.payrollStatus).filter(status => status);
        // Update actions column with status options
        this.columns = this.columns.map(column => {
          if (column.key === 'actions') {
            return {
              ...column,
              options: [
                { label: 'View', visibility: ActionVisibility.BOTH, icon: 'remove_red_eye', hideCondition: (row) => false },
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
        this.toast.error('Failed to fetch Payroll Status', 'Error');
      }
    });
  }

  getGeneratedPayroll() {
    this.payrollService.getGeneratedFnFPayrollByFNFPayroll(this.selectedFnF?._id).pipe(
      map((res: any) => res.data),
      catchError((error) => {
        this.toast.error('Failed to fetch Generated Payroll', 'Error');
        throw error;
      })
    ).subscribe({
      next: (data) => {
        this.generatedPayroll = data;
      },
      error: (error) => {
        console.error('Error while fetching generated payroll:', error);
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
    const id = this.selectedPayrollUser?.PayrollFNFUser?.id;
    const payload = {
      updatedOnDate: new Date(),
      status: this.selectedStatus
    };
    this.payrollService.updateFnFUserStatus(id, payload).subscribe({
      next: () => {
        this.toast.success('Payroll status updated successfully', 'Success');
        this.getGeneratedPayroll();
        this.closeDialog();
      },
      error: () => {
        this.toast.error('Failed to update Payroll Status', 'Error');
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