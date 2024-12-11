import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ExpensesComponent } from './expenses.component';
import { AuthGuard } from 'src/app/auth.guard';
import { SettingsComponent } from './settings/settings.component';
import { ExpenseReportsComponent } from './expense-reports/expense-reports.component';
import { AdvanceReportsComponent } from './advance-reports/advance-reports.component';
import { ExpensesCategoriesComponent } from './settings/expenses-categories/expenses-categories.component';
import { ExpensesTemplatesComponent } from './settings/expenses-templates/expenses-templates.component';
import { ExpensesTemplateAssignmentComponent } from './settings/expenses-template-assignment/expenses-template-assignment.component';
import { AdvanceCategoriesComponent } from './settings/advance-categories/advance-categories.component';
import { AdvanceTemplatesComponent } from './settings/advance-templates/advance-templates.component';
import { AdvanceTemplateAssignmentComponent } from './settings/advance-template-assignment/advance-template-assignment.component';
import { ShowMyExpensesComponent } from './my-expense/show-my-expenses/show-my-expenses.component';
import { TeamExpenseComponent } from './team-expense/team-expense.component';
import { GeneralInformationComponent } from './general-information/general-information.component';

const routes: Routes = [
  {
    path: '', component: ExpensesComponent, canActivate: [AuthGuard],
    children: [
      {
        path: '',
        redirectTo: (localStorage.getItem('adminView') === 'user') ? 'my-expense' : 'settings',
        pathMatch: 'full'
      },
      { path: 'my-expense', component: ShowMyExpensesComponent },
      { path: 'team-expense', component: TeamExpenseComponent },
      { path: 'general-information', component: GeneralInformationComponent },
      {
        path: 'settings', component: SettingsComponent, canActivate: [AuthGuard],
        children: [
          { path: '', redirectTo: 'expense-category', pathMatch: 'full' },
          { path: 'expense-category', component: ExpensesCategoriesComponent },
          { path: 'expense-template', component: ExpensesTemplatesComponent },
          { path: 'expense-template-assignment', component: ExpensesTemplateAssignmentComponent },
          { path: 'advance-category', component: AdvanceCategoriesComponent },
          { path: 'advance-template', component: AdvanceTemplatesComponent },
          { path: 'advance-template-assignment', component: AdvanceTemplateAssignmentComponent },
        ],
      },
      { path: 'expense-reports', component: ExpenseReportsComponent },
      { path: 'advance-reports', component: AdvanceReportsComponent },
    ],
  },
];

@NgModule({
  declarations: [],
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ExpensesRoutingModule { }
