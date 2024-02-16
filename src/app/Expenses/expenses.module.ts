import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExpensesComponent } from './expenses.component';
import { SettingsComponent } from './settings/settings.component';
import { ExpensesCategoriesComponent } from './settings/expenses-categories/expenses-categories.component';
import { ExpensesTemplatesComponent } from './settings/expenses-templates/expenses-templates.component';
import { ExpensesTemplateAssignmentComponent } from './settings/expenses-template-assignment/expenses-template-assignment.component';
import { SharedModule } from '../shared/shared.Module';
import { CommonComponentsModule } from '../common/commonComponents.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AdvanceCategoriesComponent } from './settings/advance-categories/advance-categories.component';
import { AdvanceTemplateAssignmentComponent } from './settings/advance-template-assignment/advance-template-assignment.component';
import { AdvanceTemplatesComponent } from './settings/advance-templates/advance-templates.component';
import { ExpenseGeneralSettingsComponent } from './settings/expense-general-settings/expense-general-settings.component';
import { ExpenseCategorySettingsComponent } from './settings/expense-category-settings/expense-category-settings.component';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { ExpenseReportsComponent } from './expense-reports/expense-reports.component';
import { PendingComponent } from './expense-reports/pending/pending.component';
import { ApprovedComponent } from './expense-reports/approved/approved.component';
import { CancelledComponent } from './expense-reports/cancelled/cancelled.component';
import { RejectedComponent } from './expense-reports/rejected/rejected.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { AddExpenseReportComponent } from './expense-reports/add-expense-report/add-expense-report.component';
import { CreateReportComponent } from './expense-reports/create-report/create-report.component';
import { MatDialogModule } from '@angular/material/dialog';
import {MatIconModule} from '@angular/material/icon';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatRadioModule} from '@angular/material/radio';
import { ViewReportComponent } from './expense-reports/view-report/view-report.component';
import { ViewExpenseReportExpensesComponent } from './expense-reports/view-expense-report-expenses/view-expense-report-expenses.component';
import { AdvanceReportsComponent } from './advance-reports/advance-reports.component';
import { ShowReportComponent } from './advance-reports/show-report/show-report.component';
import { AddAdvanceReportComponent } from './advance-reports/add-advance-report/add-advance-report.component';
import { AdvancePendingComponent } from './advance-reports/advance-pending/advance-pending.component';
import { AdvanceApprovedComponent } from './advance-reports/advance-approved/advance-approved.component';
import { AdvanceRejectedComponent } from './advance-reports/advance-rejected/advance-rejected.component';
import { AdvanceCancelledComponent } from './advance-reports/advance-cancelled/advance-cancelled.component';
import { ViewReportsComponent } from './advance-reports/view-reports/view-reports.component';
import { StatusUpdateComponent } from './advance-reports/status-update/status-update.component';
import { BrowserModule } from '@angular/platform-browser';
@NgModule({
  declarations: [
    ExpensesComponent,
    SettingsComponent,
    ExpensesCategoriesComponent,
    ExpensesTemplatesComponent,
    ExpensesTemplateAssignmentComponent,
    AdvanceCategoriesComponent,
    AdvanceTemplateAssignmentComponent,
    AdvanceTemplatesComponent,
    ExpenseGeneralSettingsComponent,
    ExpenseCategorySettingsComponent,
    ExpenseReportsComponent,
    PendingComponent,
    ApprovedComponent,
    CancelledComponent,
    RejectedComponent,
    AddExpenseReportComponent,
    CreateReportComponent,
    ViewReportComponent,
    ViewExpenseReportExpensesComponent,
    AdvanceReportsComponent,
    ShowReportComponent,
    AddAdvanceReportComponent,
    AdvancePendingComponent,
    AdvanceApprovedComponent,
    AdvanceRejectedComponent,
    AdvanceCancelledComponent,
    ViewReportsComponent,
    StatusUpdateComponent
  ],
  imports: [
    BrowserModule,
    CommonModule,
    SharedModule,
    CommonComponentsModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    BrowserAnimationsModule,
    MatDialogModule,
    MatIconModule,
    BsDatepickerModule.forRoot(),
    MatExpansionModule,
    MatCheckboxModule,
    MatRadioModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ExpensesModule { }
