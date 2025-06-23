import { NgModule } from '@angular/core';

import { TimesheetsRoutingModule } from './timesheets-routing.module';
import { CommonComponentsModule } from 'src/app/common/commonComponents.module';
import { AdminTimesheetComponent } from './admin-timesheet/admin-timesheet.component';
import { UserTimesheetComponent } from './user-timesheet/user-timesheet.component';
import { SharedModule } from 'src/app/shared/shared.Module';


@NgModule({
  declarations: [],//[AdminTimesheetComponent, UserTimesheetComponent],
  imports: [
    TimesheetsRoutingModule,
    SharedModule
  ]
})
export class TimesheetsModule { }
