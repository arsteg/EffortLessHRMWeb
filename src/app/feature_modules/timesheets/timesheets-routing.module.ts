import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminTimesheetComponent } from './admin-timesheet/admin-timesheet.component';
import { UserTimesheetComponent } from './user-timesheet/user-timesheet.component';

const routes: Routes = [
  {path: 'admin', component:AdminTimesheetComponent},
  {path: 'user', component: UserTimesheetComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TimesheetsRoutingModule { }
