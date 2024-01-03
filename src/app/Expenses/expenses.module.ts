import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExpensesComponent } from './expenses.component';
import { SettingsComponent } from './settings/settings.component';
import { ExpensesCategoriesComponent } from './settings/expenses-categories/expenses-categories.component';
import { ExpensesTemplatesComponent } from './settings/expenses-templates/expenses-templates.component';
import { ExpensesTemplateAssignmentComponent } from './settings/expenses-template-assignment/expenses-template-assignment.component';
import { SharedModule } from '../shared/shared.Module';
import { CommonComponentsModule } from '../common/commonComponents.module';
import { FormsModule } from '@angular/forms';
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
    RejectedComponent
    
  ],
  imports: [
    CommonModule,
    SharedModule,
    CommonComponentsModule,
    FormsModule,
    RouterModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ExpensesModule { }
