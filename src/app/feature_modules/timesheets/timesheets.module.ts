import { NgModule } from '@angular/core';

import { TimesheetsRoutingModule } from './timesheets-routing.module';
import { CommonComponentsModule } from 'src/app/common/commonComponents.module';
import { AdminTimesheetComponent } from './admin-timesheet/admin-timesheet.component';
import { UserTimesheetComponent } from './user-timesheet/user-timesheet.component';


@NgModule({
  declarations: [AdminTimesheetComponent, UserTimesheetComponent],
  imports: [
    TimesheetsRoutingModule,
    CommonComponentsModule,
  ]
})
export class TimesheetsModule { }
