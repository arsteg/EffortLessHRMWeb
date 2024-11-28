import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from '../home/home.component';
import { AuthGuard } from '../auth.guard';
import { PayrollComponent } from './payroll.component';
import { SettingsComponent } from './settings/settings.component';
import { CtcTemplatesComponent } from './ctc-templates/ctc-templates.component';
import { LopReversalComponent } from './lop-reversal/lop-reversal.component';
import { RunPayrollComponent } from './run-payroll/run-payroll.component';
import { PayslipsComponent } from './payslips/payslips.component';
import { FnfPayslipsComponent } from './fnf-payslips/fnf-payslips.component';
import { GeneralSettingsComponent } from './settings/general-settings/general-settings.component';
import { FixedAllowanceComponent } from './settings/fixed-allowance/fixed-allowance.component';
import { PfChargesComponent } from './settings/pf-charges/pf-charges.component';
import { FlexiBenefitsComponent } from './settings/flexi-benefits/flexi-benefits.component';
import { LoansAdvancesComponent } from './settings/loans-advances/loans-advances.component';
import { OtherBenefitsComponent } from './settings/other-benefits/other-benefits.component';
import { VariableDeductionComponent } from './settings/variable-deduction/variable-deduction.component';
import { FixedDeductionComponent } from './settings/fixed-deduction/fixed-deduction.component';
import { VariableAllowanceComponent } from './settings/variable-allowance/variable-allowance.component';
import { FixedContributionComponent } from './settings/fixed-contribution/fixed-contribution.component';

const routes: Routes = [
  
      {
        path: '', component: PayrollComponent, canActivate: [AuthGuard],
        children: [
          { path: '', redirectTo: 'settings', pathMatch: 'full' },
          {
            path: 'settings', component: SettingsComponent, canActivate: [AuthGuard],
            children: [
              { path: '', redirectTo: 'general-settings', pathMatch: 'full' },
              { path: 'general-settings', component: GeneralSettingsComponent },
              { path: 'fixed-allowances', component: FixedAllowanceComponent },
              { path: 'fixed-contributions', component: FixedContributionComponent },
              { path: 'variable-allowances', component: VariableAllowanceComponent },
              { path: 'fixed-deductions', component: FixedDeductionComponent },
              { path: 'variable-deductions', component: VariableDeductionComponent },
              { path: 'other-benefits', component: OtherBenefitsComponent },
              { path: 'loans-advances', component: LoansAdvancesComponent },
              { path: 'flexi-benefits', component: FlexiBenefitsComponent },
              { path: 'pf-charges', component: PfChargesComponent }
            ]
          },
          { path: 'ctc-template', component: CtcTemplatesComponent },
          { path: 'lop-reversal', component: LopReversalComponent },
          { path: 'run-payroll', component: RunPayrollComponent },
          { path: 'payslips', component: PayslipsComponent },
          { path: 'fnf-payslips', component: FnfPayslipsComponent }
        ]
      }
    ];
  

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PayrollRoutingModule { }
