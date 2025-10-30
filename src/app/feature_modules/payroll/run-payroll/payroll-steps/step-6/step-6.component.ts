import { Component, inject, Input, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { PayrollService } from 'src/app/_services/payroll.service';
import { UserService } from 'src/app/_services/users.service';
import { ActionVisibility, TableColumn } from 'src/app/models/table-column';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-step-6',
  templateUrl: './step-6.component.html',
  styleUrl: './step-6.component.css'
})
export class Step6Component {
  searchText: string = '';
  flexiBenefitsForm: FormGroup;
  flexiBenefits: any;
  changeMode: 'Add' | 'Update' = 'Update';
  allUsers: any;
  selectedUserId: any;
  selectedRecord: any;
  payrollUsers: any;
  payrollUser: any;
  selectedPayrollUser: any;
  professionalTaxSlabs: any;
  @ViewChild('dialogTemplate') dialogTemplate: TemplateRef<any>;
  @Input() selectedPayroll: any;
  noSalaryRecordFound: boolean = false;
  isSubmitted: boolean = false;
  private readonly translate = inject(TranslateService);

  columns: TableColumn[] = [
    { key: 'payrollUserDetails', name: this.translate.instant('payroll.employee_name') },
    { key: 'TotalFlexiBenefitAmount', name: this.translate.instant('payroll._fnf.form.flexi_benefits') },
    {
      key: 'action', name: this.translate.instant('payroll.actions'), isAction: true, options: [
        { label: this.translate.instant('payroll.edit'), visibility: ActionVisibility.BOTH, icon: 'edit' },
        { label: this.translate.instant('payroll.delete'), visibility: ActionVisibility.BOTH, icon: 'delete', cssClass: 'delete-btn' }
      ]
    }
  ]

  constructor(
    private payrollService: PayrollService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private toast: ToastrService,
    private userService: UserService
  ) {
    this.flexiBenefitsForm = this.fb.group({
      PayrollUser: ['', Validators.required],
      TotalFlexiBenefitAmount: [0, [Validators.required, Validators.min(0)]],
    });
  }

  ngOnInit() {
    this.getProfessionalTaxSlabs();
    this.payrollService.allUsers.subscribe(res => {
      this.allUsers = res;
    });
    this.payrollService.payrollUsers.subscribe(res => {
      this.payrollUsers = res;
    });
    this.getFlexiBenefitsByPayroll();
  }

  onActionClick(event: any) {
    switch (event.action.label) {
      case 'Edit':
        this.changeMode = 'Update';
        this.selectedRecord = event.row;
        this.openDialog();
        break;
      case 'Delete':
        this.selectedRecord = event.row;
        this.deleteDialog(this.selectedRecord._id);
        break;
      default:
        break;
    }
  }

  getProfessionalTaxSlabs(callback?: Function) {
    this.payrollService.getStateWisePTSlabs().subscribe((res: any) => {
      this.professionalTaxSlabs = res.data;
      if (callback) callback(); // Execute callback after slabs are loaded
    });
  }

  onUserSelectedFromChild(user: any) {
    this.selectedUserId = user.value.user;
    this.selectedPayrollUser = user.value._id;

    if (this.changeMode !== 'Add') {
      this.getFlexiBenefitsProfessionalTax();
    } else {
      let payload = { userId: this.selectedUserId };

      this.userService.getUserById(payload).subscribe((res: any) => {
        const result = res.data;
        if (result.length > 0) {
          const userState = result[0];
          // Ensure professional tax slabs are available before proceeding
          if (!this.professionalTaxSlabs) {
            this.getProfessionalTaxSlabs(() => this.processTaxSlabs(userState));
          } else {
            this.processTaxSlabs(userState);
          }
        }
      });
    }
  }

  processTaxSlabs(userState: any) {
    // const stateSlab = this.professionalTaxSlabs?.states.find(
    //   (slab: any) => slab.name.toLowerCase() === userState?.state.toLowerCase()
    // );

    // if (!stateSlab || !stateSlab.slabs) {
    //   this.noSalaryRecordFound = true;
    //   this.toast.error('No professional tax slabs found for the state.', 'Error');
    //   return;
    // }

    // // Fetch salary details for the user
    // this.userService.getSalaryByUserId(this.selectedUserId).subscribe((res: any) => {
    //   if (!res.data || res.data.length === 0) {
    //     this.noSalaryRecordFound = true;
    //     this.toast.error('No salary records found for the user.', 'Error');
    //     return;
    //   }

    //   const lastSalaryRecord = res.data[res.data.length - 1];
    //   let ctc;

    //   // Determine CTC based on enteringAmount
    //   if (lastSalaryRecord?.enteringAmount === 'Monthly') {
    //     ctc = lastSalaryRecord.Amount * 12; // Convert to yearly CTC
    //   } else if (lastSalaryRecord?.enteringAmount === 'Yearly') {
    //     ctc = lastSalaryRecord.Amount; // Already yearly CTC
    //   } else {
    //     this.noSalaryRecordFound = true;
    //     this.toast.error('Invalid salary amount type.', 'Error');
    //     return;
    //   }

    //   // Calculate basic salary (40% of CTC)
    //   const basicSalaryAnnual = ctc * 0.4;
    //   const basicSalaryMonthly = basicSalaryAnnual / 12;

    //   // Calculate total variable allowances where isProfessionalTaxAffected = true
    //   let totalVariableAllowances = 0;
    //   const variableAllowances = lastSalaryRecord.variableAllowanceList || [];
    //   variableAllowances.forEach((allowance: any) => {
    //     if (allowance.variableAllowance.isProfessionalTaxAffected) {
    //       totalVariableAllowances += allowance.monthlyAmount;
    //     }
    //   });

    //   // Calculate gross monthly salary for professional tax
    //   const grossMonthlySalary = basicSalaryMonthly + totalVariableAllowances;

    //   // Find matching professional tax slab
    //   const matchingSlab = stateSlab.slabs.find(
    //     (slab: any) => grossMonthlySalary >= slab.fromAmount && grossMonthlySalary <= (slab.toAmount || 999999999999)
    //   );

    //   let professionalTaxAmount = matchingSlab ? matchingSlab.employeeAmount : 0;

    //   // Handle exemptions (e.g., Maharashtra women <= ₹25,000)
    //   if (userState?.state === 'Maharashtra' && userState?.Gender === 'female' && grossMonthlySalary <= 25000) {
    //     professionalTaxAmount = 0;
    //   }

    //   // Handle special case for Maharashtra (February: ₹300 for salaries > ₹10,000)
    //   const currentMonth = new Date().getMonth() + 1; // 1 = January, 2 = February, etc.
    //   if (userState?.state === 'Maharashtra' && currentMonth === 2 && grossMonthlySalary > 10000) {
    //     professionalTaxAmount = 300;
    //   }

    //   // Update form with calculated professional tax

    // });
  }

  getUser(employeeId: string) {
    const matchingUser = this.allUsers?.find(user => user._id === employeeId);
    return matchingUser ? `${matchingUser.firstName} ${matchingUser.lastName}` : 'N/A';
  }

  getFlexiBenefitsProfessionalTax() {
    this.payrollService.getFlexiByUsers(this.selectedPayrollUser).subscribe((res: any) => {
      this.flexiBenefits = res.data;
      const userRequests = this.flexiBenefits.map((item: any) => {
        const payrollUser = this.payrollUsers?.find((user: any) => user._id === item.PayrollUser);
        return {
          ...item,
          payrollUserDetails: payrollUser ? this.getUser(payrollUser.user) : null
        };
      });
      this.flexiBenefits = userRequests
    })
  }

  getFlexiBenefitsByPayroll() {
    this.payrollService.getFlexiByPayroll(this.selectedPayroll?._id).subscribe((res: any) => {
      this.flexiBenefits = res.data;
      const userRequests = this.flexiBenefits.map((item: any) => {
        const payrollUser = this.payrollUsers?.find((user: any) => user._id === item.PayrollUser);
        return {
          ...item,
          payrollUserDetails: payrollUser ? this.getUser(payrollUser.user) : null
        };
      });
      this.flexiBenefits = userRequests;
    });
  }

  onSubmission() {
    if (this.flexiBenefitsForm.invalid) {
      this.isSubmitted = false;
      this.flexiBenefitsForm.markAllAsTouched();
      return;
    }
    else {
      this.isSubmitted = true;
      // this.flexiBenefitsForm.get('PayrollUser').enable();
      this.flexiBenefitsForm.value.PayrollUser = this.selectedPayrollUser;
      if (this.changeMode == 'Add') {
        this.payrollService.addFlexi(this.flexiBenefitsForm.value).subscribe((res: any) => {
          this.getFlexiBenefitsProfessionalTax();
          this.toast.success(this.translate.instant('payroll.messages.flexi_benefit_created'), this.translate.instant('payroll.successfully'));
          this.closeDialog();
        },
          (err) => { this.toast.error(this.translate.instant('payroll.messages.flexi_benefit_created_error')); }
        );
      }
      if (this.changeMode == 'Update') {
        this.flexiBenefitsForm.patchValue({ PayrollUser: this.selectedPayrollUser });
        this.payrollService.updateFlexi(this.selectedRecord._id, this.flexiBenefitsForm.value).subscribe((res: any) => {
          this.selectedPayrollUser = res.data.record.PayrollUser;
          this.getFlexiBenefitsProfessionalTax();
          this.toast.success(this.translate.instant('payroll.messages.flexi_benefit_updated'), this.translate.instant('payroll.successfully'));
          this.closeDialog();
        },
          err => { this.toast.error(this.translate.instant('payroll.messages.flexi_benefit_updated_error')); });
      }
    }
  }

  openDialog() {
    this.isSubmitted = false;
    if (this.changeMode == 'Update') {
      this.payrollService.getPayrollUserById(this.selectedRecord.PayrollUser).subscribe((res: any) => {
        this.payrollUser = res.data;
        const payrollUser = this.payrollUser?.user;
        this.flexiBenefitsForm.patchValue({
          PayrollUser: this.getUser(payrollUser),
          TotalFlexiBenefitAmount: this.selectedRecord?.TotalFlexiBenefitAmount || 0,
        });
        this.flexiBenefitsForm.get('PayrollUser').disable();
      });
    }
    this.dialog.open(this.dialogTemplate, {
      width: '600px',
      disableClose: true
    });
  }

  closeDialog() {
    this.isSubmitted = false;
    this.flexiBenefitsForm.reset({
      TotalFlexiBenefitAmount: 0
    });
    console.log(this.flexiBenefitsForm.value);
    this.flexiBenefitsForm.get('PayrollUser').enable();
    this.changeMode = 'Update';
    this.dialog.closeAll();
  }

  deleteTemplate(_id: string) {
    this.payrollService.deleteFlexi(_id).subscribe((res: any) => {
      this.getFlexiBenefitsProfessionalTax();
      this.toast.success(this.translate.instant('payroll.messages.flexi_benefit_deleted'), this.translate.instant('payroll.successfully'));
    },
      (err) => {
        this.toast.error(this.translate.instant('payroll.messages.flexi_benefit_deleted_error'));
      });
  }

  deleteDialog(id: string): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'delete') {
        this.deleteTemplate(id);
      }
    });
  }
}