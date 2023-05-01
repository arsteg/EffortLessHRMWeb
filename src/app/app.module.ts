import { CUSTOM_ELEMENTS_SCHEMA, NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './login/register/register.component';
import { ForgotPasswordComponent } from './login/forgot-password/forgot-password.component';
import { SidebarDirective } from './layout/sidebar.directive';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ResetPasswordComponent } from './login/reset-password/reset-password.component';
import { ToastrModule } from 'ngx-toastr';
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';
import { LayoutModule } from '@angular/cdk/layout';
import { ProjectListComponent } from './Project/project-list/project-list.component';
import { AddProjectComponent } from './Project/add-project/add-project.component';
import { ChangePasswordComponent } from './login/change-password/change-password.component';
import { UserListComponent } from './users/user-list/user-list.component';
import { UserFormCOntrolComponent } from './users/user-profile/user-form-control/user-form-control.component';
import { UserProfileComponent } from './users/user-profile/user-profile.component';
import { FormControlsComponent } from './common/form-controls/form-controls.component';
import { ScreenshotsComponent } from './screenshots/screenshots/screenshots.component';
import { NgHttpLoaderModule } from 'ng-http-loader';
import { TeammembersComponent } from './manage/teammembers/teammembers.component';
import { HomeComponent } from './home/home.component';
import { RolesComponent } from './manage/roles/roles/roles.component';
import { PermissionModelComponent } from './manage/permissonModel/permission-model/permission-model.component';
import { ProfileComponent } from './profile/profile.component';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ReportsComponent } from './reports/reports.component';
import { TimelineComponent } from './reports/timeline/timeline.component';
import { AttendanceComponent } from './reports/attendance/attendance.component';
import { RealtimeComponent } from './realtime/realtime.component';
import { MainComponent } from './main/main.component';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { ModalModule } from 'ngx-bootstrap/modal';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonService } from './common/common.service';
import { UserService } from './users/users.service';
import { RequestManualTimeComponent } from './manualTime/request-manual-time/request-manual-time.component';
import { RequestApprovalComponent } from './manualTime/requestApproval/requestApproval.component';
import { ActivityDescriptionComponent } from './reports/activity-description/activity-description.component';
import { AppAndWebsiteUsageComponent } from './reports/app-and-website-usage/app-and-website-usage.component';
import { TaskreportComponent } from './reports/taskreport/taskreport.component';
import { LeaveReportComponent } from './reports/leave-report/leave-report.component';
import { ProductivityReportComponent } from './reports/productivity-report/productivity-report.component';
import { AppWebsiteSettingsComponent } from './settings/app-website-settings/app-website-settings.component';
import { AddManualTimeComponent } from './manualTime/addManualTime/add-manual-time.component';
import { ManageModule } from './manage/manage.module';
import { PermissionsComponent } from './permissions/permissions.component';
import { RolePermissionComponent } from './role-permission/role-permission.component';
import { AuthGuard } from './auth.guard';
import { DashboardComponent } from './dashboard/dashboard.component';
import { TimesheetsComponent } from './timesheets/timesheets.component';
import { ActivityLevelComponent } from './reports/activity-level/activity-level.component';
import { ProfileSettingsComponent } from './settings/profile-settings/profile-settings.component';
import { WorkspaceSettingsComponent } from './settings/workspace-settings/workspace-settings.component';
import { FeaturesSettingsComponent } from './settings/features-settings/features-settings.component';
import { AttendanceSettingsComponent } from './settings/attendance-settings/attendance-settings.component';
import { Ng5SliderModule } from 'ng5-slider';
import { LeaveSettingsComponent } from './settings/leave-settings/leave-settings.component';
import { taskModule } from './tasks/task.Module';
import { SharedModule } from './shared/shared.Module';

import {MatPaginatorModule} from '@angular/material/paginator';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { DatePipe } from '@angular/common';
import { EditTaskComponent } from './tasks/edit-task/edit-task.component';
import {MatDialogModule} from '@angular/material/dialog';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    ForgotPasswordComponent,
    SidebarDirective,
    ResetPasswordComponent,
    ProjectListComponent,
    AddProjectComponent,
          ChangePasswordComponent,
          UserListComponent,
          UserProfileComponent,
          UserFormCOntrolComponent,
          FormControlsComponent,
          ScreenshotsComponent,
          TeammembersComponent,
          HomeComponent,
          RolesComponent,
          PermissionModelComponent,
          ProfileComponent,
          ReportsComponent,
          TimelineComponent,
          AttendanceComponent,
          RealtimeComponent,
          MainComponent,
          RequestManualTimeComponent,
          RequestApprovalComponent,
          ActivityDescriptionComponent,
          AppAndWebsiteUsageComponent,
          TaskreportComponent,
          LeaveReportComponent,
          ProductivityReportComponent,
          AppWebsiteSettingsComponent,
          AddManualTimeComponent,
          PermissionsComponent,
          RolePermissionComponent,
          DashboardComponent,
          TimesheetsComponent,
          ActivityLevelComponent,
          ProfileSettingsComponent,
          WorkspaceSettingsComponent,
          FeaturesSettingsComponent,
          AttendanceSettingsComponent,
          LeaveSettingsComponent, EditTaskComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ToastrModule.forRoot(),
    NgHttpLoaderModule.forRoot(),
    BsDropdownModule.forRoot(),
    BrowserAnimationsModule,
    NoopAnimationsModule,
    LayoutModule,
    TooltipModule,
    ModalModule,
    DragDropModule,
    ManageModule,
    Ng5SliderModule,
    SharedModule,
    taskModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatPaginatorModule,
    MatSlideToggleModule,
    MatDialogModule
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA,
    NO_ERRORS_SCHEMA
  ],
  providers: [CommonService, UserService, AuthGuard, DatePipe, HttpClient],
  bootstrap: [AppComponent]
})

export class AppModule { }
