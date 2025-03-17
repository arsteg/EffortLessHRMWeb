import { CUSTOM_ELEMENTS_SCHEMA, NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmployeeSettingsRoutingModule } from './employee-settings-routing.module';
import { EmployeeProfileComponent } from './employee-profile/employee-profile.component';
import { ViewLoansAdvancesComponent } from './loans-advances/view-loans-advances/view-loans-advances.component';
import { AddSalaryDetailsComponent } from './salary-details/add-salary-details/add-salary-details.component';
import { UserLoansAdvancesComponent } from './loans-advances/loans-advances.component';
import { StatutoryDetailsComponent } from './statutory-details/statutory-details.component';
import { SalaryDetailsComponent } from './salary-details/salary-details.component';
import { EmploymentDetailsComponent } from './employment-details/employment-details.component';
import { EmployeeSettingsComponent } from './employee-settings.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonComponentsModule } from 'src/app/common/commonComponents.module';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatExpansionModule } from '@angular/material/expansion';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';


@NgModule({
  declarations: [
    EmployeeSettingsComponent,
    EmploymentDetailsComponent,
    SalaryDetailsComponent,
    StatutoryDetailsComponent,
    UserLoansAdvancesComponent,
    AddSalaryDetailsComponent,
    ViewLoansAdvancesComponent,
    EmployeeProfileComponent,
    ],
  imports: [
    CommonModule,
    EmployeeSettingsRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    CommonComponentsModule,
    MatRadioModule,
    MatCheckboxModule,
    MatExpansionModule,
    NgbModule
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA,
    NO_ERRORS_SCHEMA
  ]
})
export class EmployeeSettingsModule { }
