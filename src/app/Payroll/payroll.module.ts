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
import { ConfigureStateComponent } from './settings/fixed-contribution/pt/eligible-states/configure-state/configure-state.component';
import { UpdateStateComponent } from './settings/fixed-contribution/pt/eligible-states/configure-state/update-state/update-state.component';
import { OverlayModule } from '@angular/cdk/overlay';
import { UpdateCTCTemplateComponent } from './ctc-templates/update-ctctemplate/update-ctctemplate.component';
import { AssignedTemplatesComponent } from './ctc-templates/assigned-templates/assigned-templates.component';
import { EmployeeDeductionComponent } from './ctc-templates/assigned-templates/employee-deduction/employee-deduction.component';
import { OtherBenefitComponent } from './ctc-templates/assigned-templates/other-benefit/other-benefit.component';
import { AssignedFixedAllowanceComponent } from './ctc-templates/assigned-templates/fixed-allowance/fixed-allowance.component';
import { AssignedFixedContributionComponent } from './ctc-templates/assigned-templates/fixed-contribution/fixed-contribution.component';
import { AssignedFixedDeductionComponent } from './ctc-templates/assigned-templates/fixed-deduction/fixed-deduction.component';
import { PayrollHistoryComponent } from './run-payroll/payroll-history/payroll-history.component';
import { RunFnfPayrollComponent } from './run-payroll/run-fnf-payroll/run-fnf-payroll.component';
import { NgbDropdown, NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { PayrollStepsComponent } from './run-payroll/payroll-steps/payroll-steps.component';
import { Step1Component } from './run-payroll/payroll-steps/step-1/step-1.component';
import { Step2Component } from './run-payroll/payroll-steps/step-2/step-2.component';
import { Step3Component } from './run-payroll/payroll-steps/step-3/step-3.component';
import { Step4Component } from './run-payroll/payroll-steps/step-4/step-4.component';
import { Step5Component } from './run-payroll/payroll-steps/step-5/step-5.component';
import { Step6Component } from './run-payroll/payroll-steps/step-6/step-6.component';
import { Step7Component } from './run-payroll/payroll-steps/step-7/step-7.component';
import { Step8Component } from './run-payroll/payroll-steps/step-8/step-8.component';
import { Step9Component } from './run-payroll/payroll-steps/step-9/step-9.component';
import { ViewPayslipComponent } from './run-payroll/payroll-steps/step-9/view-payslip/view-payslip.component';
import { VarAllowanceComponent } from './ctc-templates/assigned-templates/var-allowance/var-allowance.component';
import { VarDeductionComponent } from './ctc-templates/assigned-templates/var-deduction/var-deduction.component';
import { CommonComponentsModule } from '../common/commonComponents.module';
import { PayrollRoutingModule } from './payroll-routing.module';
import { PayrollUserListComponent } from './run-payroll/payroll-steps/payroll-user-list/payroll-user-list.component';

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
    DeductionComponent,
    ConfigureStateComponent,
    UpdateStateComponent,
    UpdateCTCTemplateComponent,
    AssignedTemplatesComponent,
    EmployeeDeductionComponent,
    OtherBenefitComponent,
    AssignedFixedAllowanceComponent,
    AssignedFixedContributionComponent,
    AssignedFixedDeductionComponent,
    PayrollHistoryComponent,
    RunFnfPayrollComponent,
    PayrollStepsComponent,
    Step1Component,
    Step2Component,
    Step3Component,
    Step4Component,
    Step5Component,
    Step6Component,
    Step7Component,
    Step8Component,
    Step9Component,
    ViewPayslipComponent,
    VarAllowanceComponent,
    VarDeductionComponent,
    PayrollUserListComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    MatSidenavModule,
    MatButtonModule,
    BrowserAnimationsModule,
    BrowserModule,
    OverlayModule,
    NgbDropdownModule,
    CommonComponentsModule,
    PayrollRoutingModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class PayrollModule { }
