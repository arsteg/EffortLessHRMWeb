import { NgModule, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { CommonComponentsModule } from '../../common/commonComponents.module';
import { SharedModule } from '../../shared/shared.Module';
import { ReportsComponent } from './reports.component';
import { BrowserHistoryModule } from './browserHistory/browserHistory.module';
import { AppAndWebsiteUsageComponent } from './app-and-website-usage/app-and-website-usage.component';
import { ProductivityReportComponent } from './productivity-report/productivity-report.component';
import { LeaveReportComponent } from './leave-report/leave-report.component';
import { CommonService } from 'src/app/_services/common.Service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivityDescriptionComponent } from './activity-description/activity-description.component';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { TimelineComponent } from './timeline/timeline.component';
import { ReportsRoutingModule } from './reports-routing.module';
import { AiReportsComponent } from './AI-Reporting/ai-reports/ai-reports.component';
import { UserTimesheetComponent } from '../timesheets/user-timesheet/user-timesheet.component';
import { AdminTimesheetComponent } from '../timesheets/admin-timesheet/admin-timesheet.component';
import { TimelineManagementComponent } from './timeline/timeline-management/timeline-management/timeline-management.component';

@NgModule({
  declarations: [
    ReportsComponent,
    TimelineComponent,
    TimelineManagementComponent,
    ProductivityReportComponent,
    LeaveReportComponent,
    AppAndWebsiteUsageComponent,
    ActivityDescriptionComponent,
    AiReportsComponent,
    UserTimesheetComponent,
    AdminTimesheetComponent
  ],
  imports: [
    CommonModule,
    CommonComponentsModule,
    BrowserHistoryModule,
    MatOptionModule,
    ReportsRoutingModule
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA,
    NO_ERRORS_SCHEMA
  ],
  providers: [DatePipe, CommonService]
})
export class ReportsModule { }
