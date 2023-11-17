import { CUSTOM_ELEMENTS_SCHEMA, NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { SharedModule } from "../shared/shared.Module";
import { ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { CommonModule } from '@angular/common';
import { TimesheetsComponent } from "./timesheets.component";
import { UserTimesheetComponent } from "./user-timesheet/user-timesheet.component";
import { AdminTimesheetComponent } from "./admin-timesheet/admin-timesheet.component";
import { MatLegacySlideToggleModule as MatSlideToggleModule } from '@angular/material/legacy-slide-toggle';

@NgModule({
  declarations: [TimesheetsComponent, UserTimesheetComponent, AdminTimesheetComponent],
  exports: [TimesheetsComponent, UserTimesheetComponent, AdminTimesheetComponent],
  imports: [SharedModule, ReactiveFormsModule, RouterModule, TooltipModule, MatDialogModule, MatButtonModule, CommonModule, MatSlideToggleModule],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA,
    NO_ERRORS_SCHEMA
  ],
})
export class timesheetModule {

}
