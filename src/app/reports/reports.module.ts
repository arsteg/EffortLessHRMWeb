import { NgModule, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { CommonComponentsModule } from '../common/commonComponents.module';
import { SharedModule } from '../shared/shared.Module';
import { ReportsComponent } from './reports.component';
import { BrowserHistoryModule } from '../browserHistory/browserHistory.module';
import { BrowserHistoryComponent } from '../browserHistory/browserHistory.component';
import { AppAndWebsiteUsageComponent } from './app-and-website-usage/app-and-website-usage.component';
import { ProductivityReportComponent } from './productivity-report/productivity-report.component';
import { LeaveReportComponent } from './leave-report/leave-report.component';
import { FormsModule } from '@angular/forms';
import { CommonService } from 'src/app/_services/common.Service';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    CommonComponentsModule,
    SharedModule,
    FormsModule
  ],
  exports: [],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA,
    NO_ERRORS_SCHEMA
  ],
  providers: [DatePipe, CommonService]
})
export class ReportsModule { }
