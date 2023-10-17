import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExpensesComponent } from './expenses.component';
import { SettingsComponent } from './settings/settings.component';
import { ExpensesCategoriesComponent } from './settings/expenses-categories/expenses-categories.component';
import { ExpensesTemplatesComponent } from './settings/expenses-templates/expenses-templates.component';
import { ExpensesTemplateAssignmentComponent } from './settings/expenses-template-assignment/expenses-template-assignment.component';
import { SharedModule } from '../shared/shared.Module';
import { CommonComponentsModule } from '../common/commonComponents.module';



@NgModule({
  declarations: [ExpensesComponent, SettingsComponent, ExpensesCategoriesComponent, ExpensesTemplatesComponent, ExpensesTemplateAssignmentComponent],
  imports: [
    CommonModule,
    SharedModule,
    CommonComponentsModule
  ]
})
export class ExpensesModule { }
