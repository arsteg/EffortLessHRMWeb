import { NO_ERRORS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { LeaveApplicationComponent } from './leave-application/leave-application.component';
import { LeaveSettingComponent } from './leave-setting/leave-setting.component';
import { LeaveAssignmentComponent } from './leave-setting/leave-assignment/leave-assignment.component';
import { LeaveCategoryComponent } from './leave-setting/leave-category/leave-category.component';
import { LeaveTemplateComponent } from './leave-setting/leave-template/leave-template.component';
import { LeaveManagementComponent } from './leave-grant/leave-grant.component';
import { LeaveComponent } from './leave.component';
import { GeneralSettingsComponent } from './leave-setting/general-settings/general-settings.component';
import { CommonComponentsModule } from 'src/app/common/commonComponents.module';
import { AddCategoryLeaveComponent } from './leave-setting/leave-template/add-category-leave/add-category-leave.component';
import { CreateLeaveComponent } from './leave-setting/leave-template/create-leave/create-leave.component';
import { PendingComponent } from './leave-grant/pending/pending.component';
import { RejectedComponent } from './leave-grant/rejected/rejected.component';
import { ApprovedComponent } from './leave-grant/approved/approved.component';
import { ShowStatusComponent } from './leave-grant/show-status/show-status.component';
import { UpdateStatusComponent } from './leave-grant/update-status/update-status.component';
import { AddLeaveComponent } from './leave-grant/add-leave/add-leave.component';
import { ViewLeaveComponent } from './leave-grant/view-leave/view-leave.component';
import { ShortLeaveComponent } from './short-leave/short-leave.component';
import { LeaveBalanceComponent } from './leave-balance/leave-balance.component';
import { ShowApplicationComponent } from './leave-application/show-application/show-application.component';
import { AddApplicationComponent } from './leave-application/add-application/add-application.component';
import { UpdateApplicationComponent } from './leave-application/update-application/update-application.component';
import { ApprovedApplicationComponent } from './leave-application/approved/approved-application.component';
import { CancelledApplicationComponent } from './leave-application/cancelled/cancelled-application.component';
import { PendingApplicationComponent } from './leave-application/pending/pending-application.component';
import { RejectedApplicationComponent } from './leave-application/rejected/rejected-application.component';
import { ViewApplicationComponent } from './leave-application/view-application/view-application.component';
import { ShowShortLeaveComponent } from './short-leave/show-short-leave/show-short-leave.component';
import { UpdateShortLeaveComponent } from './short-leave/update-short-leave/update-short-leave.component';
import { PendingShortLeaveComponent } from './short-leave/pending-short-leave/pending-short-leave.component';
import { ApprovedShortLeaveComponent } from './short-leave/approved-short-leave/approved-short-leave.component';
import { CancelledShortLeaveComponent } from './short-leave/cancelled-short-leave/cancelled-short-leave.component';
import { RejectedShortLeaveComponent } from './short-leave/rejected-short-leave/rejected-short-leave.component';
import { AddShortLeaveComponent } from './short-leave/add-short-leave/add-short-leave.component';
import { ViewShortLeaveComponent } from './short-leave/view-short-leave/view-short-leave.component';
import { SupervisorsComponent } from './general-information/supervisors/supervisors.component';
import { HolidaysComponent } from './general-information/holidays/holidays.component';
import { GeneralComponent } from './general-information/general/general.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { LeaveRoutingModule } from './leave-routing.module';

@NgModule({
  declarations: [
    LeaveComponent,
    LeaveApplicationComponent,
    LeaveSettingComponent,
    LeaveAssignmentComponent,
    LeaveCategoryComponent,
    LeaveManagementComponent,
    LeaveTemplateComponent,
    GeneralSettingsComponent,
    CreateLeaveComponent,
    AddCategoryLeaveComponent,
    PendingComponent,
    RejectedComponent,
    ApprovedComponent,
    ShowStatusComponent,
    UpdateStatusComponent,
    AddLeaveComponent,
    ViewLeaveComponent,
    ShortLeaveComponent,
    LeaveBalanceComponent,
    ShowApplicationComponent,
    AddApplicationComponent,
    UpdateApplicationComponent,
    ApprovedApplicationComponent,
    CancelledApplicationComponent,
    PendingApplicationComponent,
    RejectedApplicationComponent,
    ViewApplicationComponent,
    ShowShortLeaveComponent,
    UpdateShortLeaveComponent,
    PendingShortLeaveComponent,
    ApprovedShortLeaveComponent,
    CancelledShortLeaveComponent,
    RejectedShortLeaveComponent,
    AddShortLeaveComponent,
    ViewShortLeaveComponent,
    SupervisorsComponent,
    HolidaysComponent,
    GeneralComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    NgxChartsModule,
    CommonComponentsModule,
    NgbModule,
    LeaveRoutingModule,
  ],
  schemas: [NO_ERRORS_SCHEMA]
})
export class LeaveModule { }
