import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PayrollComponent } from './payroll.component';
import { SettingsComponent } from './settings/settings.component';
import { GeneralSettingsComponent } from './settings/general-settings/general-settings.component';
import { FixedAllowanceComponent } from './settings/fixed-allowance/fixed-allowance.component';
import { FixedContributionComponent } from './settings/fixed-contribution/fixed-contribution.component';
import { VariableAllowanceComponent } from './settings/variable-allowance/variable-allowance.component';
import { FixedDeductionComponent } from './settings/fixed-deduction/fixed-deduction.component';
import { VariableDeductionComponent } from './settings/variable-deduction/variable-deduction.component';
import { OtherBenefitsComponent } from './settings/other-benefits/other-benefits.component';
import { LoansAdvancesComponent } from './settings/loans-advances/loans-advances.component';
import { FlexiBenefitsComponent } from './settings/flexi-benefits/flexi-benefits.component';
import { PfChargesComponent } from './settings/pf-charges/pf-charges.component';
import { CtcTemplatesComponent } from './ctc-templates/ctc-templates.component';
import { LopReversalComponent } from './lop-reversal/lop-reversal.component';
import { RunPayrollComponent } from './run-payroll/run-payroll.component';
import { PayslipsComponent } from './payslips/payslips.component';
import { FnfPayslipsComponent } from './fnf-payslips/fnf-payslips.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.Module';



@NgModule({
  declarations: [
    PayrollComponent,
    SettingsComponent,
    GeneralSettingsComponent,
    FixedAllowanceComponent,
    FixedContributionComponent,
    VariableAllowanceComponent,
    FixedDeductionComponent,
    VariableDeductionComponent,
    OtherBenefitsComponent,
    LoansAdvancesComponent,
    FlexiBenefitsComponent,
    PfChargesComponent,
    CtcTemplatesComponent,
    LopReversalComponent,
    RunPayrollComponent,
    PayslipsComponent,
    FnfPayslipsComponent
  ],
  imports: [
    CommonModule, 
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    CommonModule
  ]
})
export class PayrollModule { }
