import { CUSTOM_ELEMENTS_SCHEMA, NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './login/register/register.component';
import { ForgotPasswordComponent } from './login/forgot-password/forgot-password.component';
import { SidebarDirective } from './layout/sidebar.directive';
import { HttpClientModule } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ResetPasswordComponent } from './login/reset-password/reset-password.component';
import { ToastrModule } from 'ngx-toastr';
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';
import { LayoutModule } from '@angular/cdk/layout';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { ProjectListComponent } from './Project/project-list/project-list.component';
import { AddProjectComponent } from './Project/add-project/add-project.component';
import { AgGridModule } from 'ag-grid-angular';
import { ChangePasswordComponent } from './login/change-password/change-password.component';
import { UserListComponent } from './users/user-list/user-list.component';
import { UserFormCOntrolComponent } from './users/user-profile/user-form-control/user-form-control.component';
import { UserProfileComponent } from './users/user-profile/user-profile.component';
import { FormControlsComponent } from './common/form-controls/form-controls.component';
import { ScreenshotsComponent } from './screenshots/screenshots/screenshots.component';
import { DatePipe } from '@angular/common';
import { NgHttpLoaderModule } from 'ng-http-loader';
import { TeammembersComponent } from './manage/teammembers/teammembers.component';
import { HomeComponent } from './home/home.component';
import { RolesComponent } from './manage/roles/roles/roles.component';
import { PermissionModelComponent } from './manage/permissonModel/permission-model/permission-model.component';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatRadioModule} from '@angular/material/radio';
import { ProfileComponent } from './profile/profile.component';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ReportsComponent } from './reports/reports.component';
import { TimelineComponent } from './reports/timeline/timeline.component';
import {MatTableModule} from '@angular/material/table';
import {MatFormFieldModule} from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { SortDirective } from './directive/sort.directive';
import { SearchPipe } from './search.pipe';
import { NgxPaginationModule } from 'ngx-pagination';
import { AttendanceComponent } from './reports/attendance/attendance.component';
import { RealtimeComponent } from './realtime/realtime.component';
import { MainComponent } from './main/main.component';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { TasksComponent } from './tasks/tasks.component';
import { ModalModule } from 'ngx-bootstrap/modal';
import {MatSelectModule} from '@angular/material/select';
import { CdkTableModule } from '@angular/cdk/table';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from "@angular/common";
import { CommonService } from './common/common.service';
import { UserService } from './users/users.service';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { RequestManualTimeComponent } from './manualTime/request-manual-time/request-manual-time.component';
import { RequestApprovalComponent } from './manualTime/requestApproval/requestApproval.component';
import { ActivityDescriptionComponent } from './reports/activity-description/activity-description.component';
import { AppAndWebsiteUsageComponent } from './reports/app-and-website-usage/app-and-website-usage.component';
import { TaskreportComponent } from './reports/taskreport/taskreport.component';
import { LeaveReportComponent } from './reports/leave-report/leave-report.component';
import { ProductivityReportComponent } from './reports/productivity-report/productivity-report.component';
import { AppWebsiteSettingsComponent } from './settings/app-website-settings/app-website-settings.component';
import { AddManualTimeComponent } from './manualTime/addManualTime/add-manual-time.component';
import { MatTabsModule } from '@angular/material/tabs';
import {MatDatepickerModule} from '@angular/material/datepicker';
import { ManageModule } from './manage/manage.module';
import { PermissionsComponent } from './permissions/permissions.component';
import { RolePermissionComponent } from './role-permission/role-permission.component';
import { AuthGuard } from './auth.guard';
import { DashboardComponent } from './dashboard/dashboard.component';
import { MatNativeDateModule } from '@angular/material/core';
import { TimesheetsComponent } from './timesheets/timesheets.component';
import { ActivityLevelComponent } from './reports/activity-level/activity-level.component';
import {MatPaginatorModule} from '@angular/material/paginator';
import { ProfileSettingsComponent } from './settings/profile-settings/profile-settings.component';
import { WorkspaceSettingsComponent } from './settings/workspace-settings/workspace-settings.component';
import { FeaturesSettingsComponent } from './settings/features-settings/features-settings.component';
import { AttendanceSettingsComponent } from './settings/attendance-settings/attendance-settings.component';
import { Ng5SliderModule } from 'ng5-slider';
import { LeaveSettingsComponent } from './settings/leave-settings/leave-settings.component';

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
          SortDirective,
          SearchPipe,
          AttendanceComponent,
          RealtimeComponent,
          MainComponent,
          TasksComponent,
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
          LeaveSettingsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    ToastrModule.forRoot(),
    NgHttpLoaderModule.forRoot(),
    AgGridModule.withComponents([]),
    BsDropdownModule.forRoot(),
    BrowserAnimationsModule,
    NoopAnimationsModule,
    LayoutModule,
    MatToolbarModule,
    MatButtonModule,
    MatSidenavModule, MatIconModule, MatListModule,
    MatCheckboxModule, MatRadioModule, TooltipModule,
    MatTableModule, MatFormFieldModule, MatInputModule,
    NgxPaginationModule,
    ModalModule,
    MatSelectModule,
    CdkTableModule,
    DragDropModule,
    CommonModule,
    MatTabsModule,
    BsDatepickerModule.forRoot(),
    ManageModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatPaginatorModule,
    Ng5SliderModule
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA,
    NO_ERRORS_SCHEMA
  ],
  providers: [DatePipe, CommonService, UserService, DatePipe, AuthGuard],
  bootstrap: [AppComponent]
})

export class AppModule { }
