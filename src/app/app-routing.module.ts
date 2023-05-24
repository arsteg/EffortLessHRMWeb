import { Component, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './login/register/register.component';
import { ForgotPasswordComponent } from './login/forgot-password/forgot-password.component';
import { ProjectListComponent } from './Project/project-list/project-list.component';
import { AuthGuard } from './auth.guard';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ChangePasswordComponent } from './login/change-password/change-password.component';
import { UserProfileComponent } from './users/user-profile/user-profile.component';
import { ScreenshotsComponent } from './screenshots/screenshots/screenshots.component';
import { TeammembersComponent } from './manage/teammembers/teammembers.component';
import { HomeComponent } from './home/home.component';
import { RolesComponent } from './manage/roles/roles/roles.component';
import { PermissionModelComponent } from './manage/permissonModel/permission-model/permission-model.component';
import { ProfileComponent } from './profile/profile.component';
import { TimelineComponent } from './reports/timeline/timeline.component';
import { UserListComponent } from './users/user-list/user-list.component';
import { AttendanceComponent } from './reports/attendance/attendance.component';
import { RealtimeComponent } from './realtime/realtime.component';
import { MainComponent } from './main/main.component';
import { changeUserPassword } from './models/user';
import { TasksComponent } from './tasks/tasks.component';
import { RequestManualTimeComponent } from './manualTime/request-manual-time/request-manual-time.component';
import { RequestApprovalComponent } from './manualTime/requestApproval/requestApproval.component';
import { AddManualTimeComponent } from './manualTime/addManualTime/add-manual-time.component';
import { ActivityDescriptionComponent } from './reports/activity-description/activity-description.component';
import { AppAndWebsiteUsageComponent } from './reports/app-and-website-usage/app-and-website-usage.component';
import { TaskreportComponent } from './reports/taskreport/taskreport.component';
import { LeaveReportComponent } from './reports/leave-report/leave-report.component';
import { ProductivityReportComponent } from './reports/productivity-report/productivity-report.component';
import { AppWebsiteSettingsComponent } from './settings/app-website-settings/app-website-settings.component';

import { PermissionsComponent } from './permissions/permissions.component';
import { RolePermissionComponent } from './role-permission/role-permission.component';
import { ResetPasswordComponent } from './login/reset-password/reset-password.component';
import { TimesheetsComponent } from './timesheets/timesheets.component';
import { ActivityLevelComponent } from './reports/activity-level/activity-level.component';
import { ProfileSettingsComponent } from './settings/profile-settings/profile-settings.component';
import { WorkspaceSettingsComponent } from './settings/workspace-settings/workspace-settings.component';
import { FeaturesSettingsComponent } from './settings/features-settings/features-settings.component';
import { AttendanceSettingsComponent } from './settings/attendance-settings/attendance-settings.component';
import { LeaveSettingsComponent } from './settings/leave-settings/leave-settings.component';
import { TagComponent } from './tasks/task.tag/tag.component';
import { EditTaskComponent } from './tasks/edit-task/edit-task.component';
import { TaskCommentComponent } from './tasks/task-comment/task-comment.component';
import { UserTimesheetComponent } from './timesheets/user-timesheet/user-timesheet.component';
import { AdminTimesheetComponent } from './timesheets/admin-timesheet/admin-timesheet.component';
import { GenericSettingsComponent } from './settings/generic-settings/generic-settings.component';
import { ViewLiveScreenComponent } from './viewLiveScreen/view-live-screen/view-live-screen.component';
import { UserDashboardComponent } from './dashboard/user-dashboard/user-dashboard.component';
import { EmailTemplateComponent } from './email-template/email-template.component';

const routes: Routes = [
  // {path:'',component:LayoutComponentComponent, canActivate: [AuthGuard]},


  { path: '', component: MainComponent },
  { path: 'main', component: MainComponent },
  { path: 'login', component: LoginComponent },
  { path: 'forgotPassword', component: ForgotPasswordComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'changePassword', component: ChangePasswordComponent },
  { path: 'resetPassword/:token', component: ResetPasswordComponent },

  {
    path: '', component: HomeComponent, canActivate: [AuthGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'userDashboard', component: UserDashboardComponent },
      { path: 'logout', component: LoginComponent },
      { path: 'userProfile', component: UserProfileComponent },
      { path: 'screenshots', component: ScreenshotsComponent },
      { path: 'teamMembers', component: TeammembersComponent },
      { path: 'roles', component: RolesComponent },
      { path: 'permissionModel', component: PermissionModelComponent },
      { path: 'Profile', component: ProfileComponent },
      { path: 'timeline', component: TimelineComponent },
      { path: 'project', component: ProjectListComponent },
      { path: 'employees', component: UserListComponent },
      { path: 'attendance', component: AttendanceComponent },
      { path: 'realtime', component: RealtimeComponent },
      { path: 'tasks', component: TasksComponent },
      { path: 'tags', component: TagComponent },
      { path: 'requestManualTime', component: RequestManualTimeComponent },
      { path: 'ManualTimeRequestApproval', component: RequestApprovalComponent },
      { path: 'AddManualTime', component: AddManualTimeComponent },
      { path: 'activityDescription', component: ActivityDescriptionComponent },
      { path: 'applicationusages', component: AppAndWebsiteUsageComponent },
      { path: 'task', component: TaskreportComponent },
      { path: 'leave', component: LeaveReportComponent },
      { path: 'productivity', component: ProductivityReportComponent },
      { path: 'appwebsitesettings', component: AppWebsiteSettingsComponent },
      { path: 'permissions', component: PermissionsComponent },
      { path: 'rolePermission', component: RolePermissionComponent },
      { path: 'timesheets', component: TimesheetsComponent },
      { path: 'adminTimesheets', component: AdminTimesheetComponent},
      { path: 'userTimesheet', component: UserTimesheetComponent },
      { path: 'activityLevel', component: ActivityLevelComponent },
      { path: 'profileSettings', component: ProfileSettingsComponent },
      { path: 'workspace', component: WorkspaceSettingsComponent },
      { path: 'features', component: FeaturesSettingsComponent },
      { path: 'attendancesettings', component: AttendanceSettingsComponent },
      { path: 'leavesettings', component: LeaveSettingsComponent },
      { path: 'edit-task/:id', component: EditTaskComponent },
      {path: 'comments', component: TaskCommentComponent},
      { path: 'genericSettings', component: GenericSettingsComponent },
      { path: 'viewLiveScreen', component: ViewLiveScreenComponent },
      { path: 'emailtemplate', component: EmailTemplateComponent}
    ]
  }
]

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy', useHash: true }),
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
