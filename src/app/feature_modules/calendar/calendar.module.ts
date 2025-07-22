import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CalendarRoutingModule } from './calendar-routing.module';
import { FullCalendarModule } from '@fullcalendar/angular';
import { UserCalendarComponent } from './user-calendar/user-calendar.component';
import { AdminCalendarComponent } from './admin-calendar/admin-calendar.component';
import { CommonComponentsModule } from 'src/app/common/commonComponents.module';

@NgModule({
  declarations: [ UserCalendarComponent, AdminCalendarComponent ],
  imports: [
    CommonModule,
    CalendarRoutingModule,
    FullCalendarModule,
    CommonComponentsModule 
  ]
})
export class CalendarModule { }
