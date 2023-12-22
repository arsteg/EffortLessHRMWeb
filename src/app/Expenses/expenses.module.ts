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



@NgModule({
  declarations: [
    ExpensesComponent,
    SettingsComponent,
    ExpensesCategoriesComponent,
    ExpensesTemplatesComponent,
    ExpensesTemplateAssignmentComponent,
    AdvanceCategoriesComponent,
    AdvanceTemplateAssignmentComponent,
    AdvanceTemplatesComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    CommonComponentsModule,
    FormsModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ExpensesModule { }
