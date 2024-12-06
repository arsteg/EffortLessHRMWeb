import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminCalendarComponent } from './admin-calendar/admin-calendar.component';
import { UserCalendarComponent } from './user-calendar/user-calendar.component';

const routes: Routes = [
  {path:'admin', component:AdminCalendarComponent},
  {path: 'user', component: UserCalendarComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CalendarRoutingModule { }
