import { UserDashboardComponent } from './user-dashboard/user-dashboard.component';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA, NgModule } from "@angular/core";
import { SharedModule } from "src/app/shared/shared.Module";
import { DashboardComponent } from './dashboard.component';
import { AttendanceLogsDialogComponent } from './attendance-logs-dialog.component';
import { AttendanceOverviewComponent } from './attendance-overview/attendance-overview.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule, MatRippleModule } from '@angular/material/core';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DashboardRoutingModule } from './dashboard.routing.module';

@NgModule({
  declarations: [UserDashboardComponent, DashboardComponent, AttendanceLogsDialogComponent, AttendanceOverviewComponent],
  exports: [UserDashboardComponent, DashboardComponent],
  imports: [
    DashboardRoutingModule,
    SharedModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatButtonModule,
    MatInputModule,
    MatRippleModule,
    MatNativeDateModule,
    MatRippleModule,
    NgxChartsModule,
    FormsModule,
    CommonModule,
    SharedModule
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA,
    NO_ERRORS_SCHEMA
  ]
})
export class DashboardModule {
}

