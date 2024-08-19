import { CUSTOM_ELEMENTS_SCHEMA, NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimeLogService } from '../_services/timeLogService';
// import { TeammembersComponent } from './teammembers/teammembers.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { ManageComponent } from './manage/manage.component';
import { UserListComponent } from '../users/user-list/user-list.component';
import { CommonComponentsModule } from '../common/commonComponents.module';
import { SharedModule } from '../shared/shared.Module';
import { ProjectListComponent } from '../Project/project-list/project-list.component';
import { TasksComponent } from '../tasks/tasks.component';
import { RequestManualTimeComponent } from '../manualTime/request-manual-time/request-manual-time.component';
import { TeammembersComponent } from './teammembers/teammembers.component';
import { EmailTemplateComponent } from '../email-template/email-template.component';
import { taskModule } from '../tasks/task.Module';
import { EmployeeSettingsComponent } from '../users/employee-settings/employee-settings.component';
import { EmploymentDetailsComponent } from '../users/employee-settings/employment-details/employment-details.component';
import { SalaryDetailsComponent } from '../users/employee-settings/salary-details/salary-details.component';
import { StatutoryDetailsComponent } from '../users/employee-settings/statutory-details/statutory-details.component';
import { UserLoansAdvancesComponent } from '../users/employee-settings/loans-advances/loans-advances.component';
import { TaxComponent } from '../users/employee-settings/tax/tax.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { ViewSalaryDetailsComponent } from '../users/employee-settings/salary-details/view-salary-details/view-salary-details.component';
import { AddSalaryDetailsComponent } from '../users/employee-settings/salary-details/add-salary-details/add-salary-details.component';
import { ViewLoansAdvancesComponent } from '../users/employee-settings/loans-advances/view-loans-advances/view-loans-advances.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { EmployeeProfileComponent } from '../users/employee-settings/employee-profile/employee-profile.component';
import { TaxCalculatorComponent } from '../users/employee-settings/tax/tax-calculator/tax-calculator.component';
import { EditTaxComponent } from '../users/employee-settings/tax/edit-tax/edit-tax.component';
import { TaxComponentsComponent } from '../users/employee-settings/tax/edit-tax/tax-components/tax-components.component';

@NgModule({
  declarations: [
    ManageComponent, UserListComponent, ProjectListComponent, RequestManualTimeComponent,
    TeammembersComponent, EmailTemplateComponent, EmployeeSettingsComponent, EmploymentDetailsComponent,
    SalaryDetailsComponent,
    StatutoryDetailsComponent,
    UserLoansAdvancesComponent,
    ViewSalaryDetailsComponent,
    TaxComponent,
    AddSalaryDetailsComponent,
    ViewLoansAdvancesComponent,
    EmployeeProfileComponent,
    TaxCalculatorComponent,
    EditTaxComponent,
    TaxComponentsComponent
  ],
  imports: [
    CommonModule,
    MatRadioModule,
    MatCheckboxModule, CommonComponentsModule, SharedModule, taskModule, CommonComponentsModule, MatExpansionModule,
    NgbModule
  ],
  exports: [UserListComponent, ProjectListComponent, RequestManualTimeComponent,
    TeammembersComponent, EmailTemplateComponent, EmployeeSettingsComponent, EmploymentDetailsComponent,
    SalaryDetailsComponent,
    StatutoryDetailsComponent,
    UserLoansAdvancesComponent,
    ViewSalaryDetailsComponent,
    AddSalaryDetailsComponent,
    ViewLoansAdvancesComponent,
    TaxComponent,
    EmployeeProfileComponent,
    TaxCalculatorComponent,
    TaxComponentsComponent,
    EditTaxComponent,
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA,
    NO_ERRORS_SCHEMA
  ],
  providers: [TimeLogService],
})
export class ManageModule { }
