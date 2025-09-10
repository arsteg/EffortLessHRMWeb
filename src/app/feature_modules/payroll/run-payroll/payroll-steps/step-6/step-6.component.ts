import { Component, Input, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
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
  columns: TableColumn[] = [
    { key: 'payrollUserDetails', name: 'Employee Name' },
    { key: 'TotalFlexiBenefitAmount', name: 'Total Flexi Benefit' },
    {
      key: 'action', name: 'Action', isAction: true, options: [
        { label: 'Edit', visibility: ActionVisibility.BOTH, icon: 'edit' },
        { label: 'Delete', visibility: ActionVisibility.BOTH, icon: 'delete', cssClass: 'delete-btn' }
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
    this.flexiBenefitsForm.get('PayrollUser').enable();
    this.flexiBenefitsForm.value.PayrollUser = this.selectedPayrollUser;
    if (this.flexiBenefitsForm.invalid) {
      this.isSubmitted = false;
      this.flexiBenefitsForm.markAllAsTouched();
      return;
    }
    else {
      this.isSubmitted = true;
      if (this.changeMode == 'Add') {
        this.payrollService.addFlexi(this.flexiBenefitsForm.value).subscribe((res: any) => {
          this.getFlexiBenefitsProfessionalTax();
          this.toast.success('Flexi Benefits and Professional Tax Created', 'Successfully!');
          this.closeDialog();
        },
          (err) => { this.toast.error('Flexi Benefits and Professional Tax can not be Added', 'Error!'); }
        );
      }
      if (this.changeMode == 'Update') {
        this.payrollService.updateFlexi(this.selectedRecord._id, this.flexiBenefitsForm.value).subscribe((res: any) => {
          this.getFlexiBenefitsProfessionalTax();
          this.toast.success('Flexi Benefits and Professional Tax Updated', 'Successfully!');
          this.closeDialog();
        },
          err => { this.toast.error('Flexi Benefits and Professional Tax can not be Updated', 'Error!'); });
      }
    }
  }

  openDialog() {

    if (this.changeMode == 'Update') {
      this.payrollService.getPayrollUserById(this.selectedRecord.PayrollUser).subscribe((res: any) => {
        this.payrollUser = res.data;
        const payrollUser = this.payrollUser?.user;
        this.flexiBenefitsForm.patchValue({
          PayrollUser: this.getUser(payrollUser),
          TotalFlexiBenefitAmount: this.selectedRecord?.TotalFlexiBenefitAmount,
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
    this.flexiBenefitsForm.reset();
    this.flexiBenefitsForm.get('PayrollUser').enable();
    this.changeMode = 'Update';
    this.dialog.closeAll();
  }

  deleteTemplate(_id: string) {
    this.payrollService.deleteFlexi(_id).subscribe((res: any) => {
      this.getFlexiBenefitsProfessionalTax();
      this.toast.success('Successfully Deleted!!!', 'Flexi Benefits and Professional Tax');
    },
      (err) => {
        this.toast.error('This Flexi Benefits and Professional Tax Can not be deleted!');
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
