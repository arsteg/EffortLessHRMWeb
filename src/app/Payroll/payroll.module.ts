import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
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
import { RoundingRulesComponent } from './settings/general-settings/rounding-rules/rounding-rules.component';
import { PfTemplateComponent } from './settings/general-settings/pf-template/pf-template.component';
import { GratuityTemplateComponent } from './settings/general-settings/gratuity-template/gratuity-template.component';
import { LwfComponent } from './settings/fixed-contribution/lwf/lwf.component';
import { LwfSlabComponent } from './settings/fixed-contribution/lwf/lwf-slab/lwf-slab.component';
import { PtComponent } from './settings/fixed-contribution/pt/pt.component';
import { EligibleStatesComponent } from './settings/fixed-contribution/pt/eligible-states/eligible-states.component';
import { PtDeductionComponent } from './settings/fixed-contribution/pt/pt-deduction/pt-deduction.component';
import { EsicComponent } from './settings/fixed-contribution/esic/esic.component';
import { CeilingAmountComponent } from './settings/fixed-contribution/esic/ceiling-amount/ceiling-amount.component';
import { ContributionComponent } from './settings/fixed-contribution/esic/contribution/contribution.component';
import { DeductionComponent } from './settings/fixed-contribution/lwf/deduction/deduction.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { PtSlabComponent } from './settings/fixed-contribution/pt/pt-slab/pt-slab.component';



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
    FnfPayslipsComponent,
    RoundingRulesComponent,
    PfTemplateComponent,
    GratuityTemplateComponent,
    LwfComponent,
    LwfSlabComponent,
    PtComponent,
    EligibleStatesComponent,
    PtDeductionComponent,
    PtSlabComponent,
    EsicComponent,
    CeilingAmountComponent,
    ContributionComponent,
    DeductionComponent

  ],
  imports: [
    CommonModule, 
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    CommonModule,
    MatSidenavModule,
    MatButtonModule,
    BrowserAnimationsModule,
    BrowserModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class PayrollModule { }
