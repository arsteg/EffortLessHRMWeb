import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CalendarRoutingModule } from './calendar-routing.module';
import { FullCalendarModule } from '@fullcalendar/angular';
import { UserCalendarComponent } from './user-calendar/user-calendar.component';
import { AdminCalendarComponent } from './admin-calendar/admin-calendar.component';

@NgModule({
  declarations: [ UserCalendarComponent, AdminCalendarComponent ],
  imports: [
    CommonModule,
    CalendarRoutingModule,
    FullCalendarModule 
  ]
})
export class CalendarModule { }
