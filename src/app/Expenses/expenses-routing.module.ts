import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ExpenseCategorySettingsComponent } from './settings/expense-category-settings/expense-category-settings.component';
import { ExpensesModule } from './expenses.module';

const routes: Routes = [
  { path: 'category-settings', component: ExpenseCategorySettingsComponent } 
];

@NgModule({
  declarations: [],
  imports: [RouterModule.forRoot(routes), CommonModule, ExpensesModule],
  exports: [RouterModule]
})
export class ExpensesRoutingModule { }
