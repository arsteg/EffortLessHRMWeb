import { Component, OnInit, ViewChild, TemplateRef, Input, inject } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { PayrollService } from 'src/app/_services/payroll.service';
import { ToastrService } from 'ngx-toastr';
import { UserService } from 'src/app/_services/users.service';
import { forkJoin, map, catchError } from 'rxjs';
import { TableColumn } from 'src/app/models/table-column';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-step8',
  templateUrl: './step8.component.html',
  styleUrls: ['./step8.component.css']
})
export class FNFStep8Component implements OnInit {
  incomeTax = new MatTableDataSource<any>();
  incomeTaxForm: FormGroup;
  selectedIncomeTax: any;
  isEdit: boolean = false;
  selectedFNFUser: any;
  @Input() settledUsers: any[] = [];
  @Input() isSteps: boolean = false;
  @Input() selectedFnF: any;
  @ViewChild('dialogTemplate') dialogTemplate: TemplateRef<any>;
  private readonly translate = inject(TranslateService);

  columns: TableColumn[] = [
    {
      key: 'userName',
      name: this.translate.instant('payroll.payroll_user_label'),
      valueFn: (row) => row.userName || ''
    },
    {
      key: 'TaxCalculatedMethod',
      name: this.translate.instant('payroll.tax_calculated_method'),
      valueFn: (row) => row.TaxCalculatedMethod
    },
    {
      key: 'TaxCalculated',
      name: this.translate.instant('payroll.tax_calculated'),
      valueFn: (row) => row.TaxCalculated.toFixed(2)
    },
    {
      key: 'TDSCalculated',
      name: this.translate.instant('payroll.tds_calculated'),
      valueFn: (row) => row.TDSCalculated.toFixed(2)
    }
  ];

  constructor(
    private fb: FormBuilder,
    private payrollService: PayrollService,
    private userService: UserService,
    public dialog: MatDialog,
    private toast: ToastrService
  ) {
    this.incomeTaxForm = this.fb.group({
      PayrollFNFUser: ['', Validators.required],
      TaxCalculatedMethod: ['', Validators.required],
      TaxCalculated: [0, [Validators.required, Validators.min(0)]],
      TDSCalculated: [0, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    forkJoin({
      incomeTax: this.fetchIncomeTax(this.selectedFnF)
    }).subscribe({
      next: (results) => {
        this.incomeTax.data = results.incomeTax;
      },
      error: (error) => {
      }
    });
  }

  fetchIncomeTax(fnfPayroll: any) {
    return this.payrollService.getFnFIncomeTaxByPayrollFnF(fnfPayroll?._id).pipe(
      map((res: any) => {
        return res.data.map((item: any) => {
          const matchedUser = this.selectedFnF.userList.find(
            (user: any) => user._id === item.PayrollFNFUser
          );
          return {
            ...item,
            userName: this.getMatchedSettledUser(matchedUser?.user || '')
          };
        });
      }),
      catchError((error) => {
        this.toast.error(this.translate.instant('payroll.failed_fetch_income_tax_records'), this.translate.instant('payroll.error'));
        throw error;
      })
    );
  }

  getMatchedSettledUser(userId: string) {
    const matchedUser = this.settledUsers?.find((user) => user?._id === userId);
    return matchedUser ? `${matchedUser.firstName} ${matchedUser.lastName}` : '';
  }

  onUserChange(fnfUserId: string): void {
    this.selectedFNFUser = fnfUserId;
    const matchedUser = this.selectedFnF.userList.find((user: any) => user.user === fnfUserId);
    const payrollFNFUserId = matchedUser ? matchedUser._id : null;

    if (payrollFNFUserId) {
      this.payrollService.getFnFIncomeTaxByPayrollFnFUser(payrollFNFUserId).subscribe({
        next: (res: any) => {
          this.incomeTax.data = res.data['records'].map((item: any) => ({
            ...item,
            userName: this.getMatchedSettledUser(fnfUserId)
          }));
        },
        error: () => {
          this.toast.error(this.translate.instant('payroll.failed_fetch_income_tax_records_for_user'), this.translate.instant('payroll.error'));
        }
      });
    }
    this.onUserSelectedFromChild(fnfUserId);
  }

  onUserSelectedFromChild(userId: string): void {
    this.userService.CalculateFNFTDSAmountByUserId(userId).subscribe({
      next: (res: any) => {
        this.incomeTaxForm.patchValue({
          PayrollFNFUser: this.getMatchedSettledUser(userId),
          TaxCalculatedMethod: res.data.regime,
          TaxCalculated: res.data.yearlyTDS,
          TDSCalculated: res.data.fnfDaysTDS
        });
      },
      error: () => {
        this.toast.error(this.translate.instant('payroll.failed_calculate_fnf_tds_amount'), this.translate.instant('payroll.error'));
      }
    });
  }
}