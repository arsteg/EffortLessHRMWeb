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
import { ChangePasswordComponent } from './login/change-password/change-password.component';
// import { UserFormCOntrolComponent } from './users/user-profile/user-form-control/user-form-control.component';
// import { UserProfileComponent } from './users/user-profile/user-profile.component';
import { FormControlsComponent } from './common/form-controls/form-controls.component';
import { NgHttpLoaderModule } from 'ng-http-loader';
import { HomeComponent } from './layouts/home/home.component';
import { ProfileComponent } from './profile/profile.component';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { MainComponent } from './main/main.component';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { ModalModule } from 'ngx-bootstrap/modal';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonService } from 'src/app/_services/common.Service';
import { UserService } from './_services/users.service';
import { AddManualTimeComponent } from './manualTime/addManualTime/add-manual-time.component';
import { PermissionsComponent } from './permissions/permissions.component';
import { RolePermissionComponent } from './role-permission/role-permission.component';
import { AuthGuard } from './auth.guard';
import { WorkspaceSettingsComponent } from './settings/workspace-settings/workspace-settings.component';
import { FeaturesSettingsComponent } from './settings/features-settings/features-settings.component';
import { LeaveSettingsComponent } from './settings/leave-settings/leave-settings.component';
import { taskModule } from './tasks/task.Module';
import { SharedModule } from './shared/shared.Module';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { DatePipe } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { timesheetModule } from './timesheets/timesheet.Module';
import { ViewLiveScreenComponent } from './viewLiveScreen/view-live-screen/view-live-screen.component';
// import { DashboardModule } from './dashboard/dashboard.module';
import { ApprovalsModule } from './approvals/approvals.module';
import { QuillModule } from 'ngx-quill';
import { CommonComponentsModule } from './common/commonComponents.module';
// import { AssetsModule } from './AssetsManagement/assetManagement.module';
import { UserCalendarComponent } from './calendar/user-calendar/user-calendar.component';
import { AdminCalendarComponent } from './calendar/admin-calendar/admin-calendar.component';
import { FullCalendarModule } from '@fullcalendar/angular';
// import { DocumentManagementModule } from './documentManager/documentManager.module';
import { LeaveModule } from './Leave/leave.module';
import { AttendanceModule } from './attendance/attendance.module';
import { ExpensesModule } from './Expenses/expenses.module';
import { AlertsModule } from './Alerts/alerts.module';
import { TaxationModule } from './Taxation/taxation.module';
import { SeparationModule } from './Separation/separation.module';
import { UserTaxDeclarationComponent } from './Taxation/user-tax-declaration/user-tax-declaration.component';
import { FormsModule } from '@angular/forms';
import { SocketIoConfig, SocketIoModule } from 'ngx-socket-io';
import { NotificationComponent } from './layouts/home/notification/notification.component';
import { environment } from '../environments/environment';
import { SettingsModule } from './settings/settings.Module';
import { ReportsModule } from './reports/reports.module';
import { RequestManualTimeComponent } from './manualTime/request-manual-time/request-manual-time.component';
import { AssetsModule } from './AssetsManagement/assetManagement.module';
import { DocumentManagementModule } from './documentManager/documentManager.module';
import { UserProfileComponent } from './feature_modules/manage/users/user-profile/user-profile.component';

const config: SocketIoConfig = { url: environment.webSocketUrl, options: {} };

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    ForgotPasswordComponent,
    SidebarDirective,
    ResetPasswordComponent,
    ChangePasswordComponent,
    // UserFormCOntrolComponent,
    FormControlsComponent,
    HomeComponent,
    ProfileComponent,
    MainComponent,
    AddManualTimeComponent,
    PermissionsComponent,
    RolePermissionComponent,
    WorkspaceSettingsComponent,
    FeaturesSettingsComponent,
    ViewLiveScreenComponent,
    UserCalendarComponent,
    AdminCalendarComponent,
    UserTaxDeclarationComponent,
    NotificationComponent,
    RequestManualTimeComponent,
    UserProfileComponent // TODO: Remove it from manage module and use it in home/layout for editing user profile
   
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
    SharedModule,
    taskModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatPaginatorModule,
    MatSlideToggleModule,
    MatDialogModule,
    timesheetModule,
    // DashboardModule,
    ApprovalsModule,
    CommonComponentsModule,
    QuillModule.forRoot(),
    FullCalendarModule,
    LeaveModule,
    AttendanceModule,
    ExpensesModule,
    AlertsModule,
    TaxationModule,
    SeparationModule,
    FormsModule,
    SocketIoModule.forRoot(config),
    SettingsModule,
    ReportsModule,
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA,
    NO_ERRORS_SCHEMA
  ],
  providers: [CommonService, UserService, AuthGuard, DatePipe, HttpClient],
  bootstrap: [AppComponent]
})

export class AppModule { }
