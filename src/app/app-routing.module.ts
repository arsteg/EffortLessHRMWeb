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
import { RealtimeComponent } from './realtime/realtime.component';
import { MainComponent } from './main/main.component';
import { TasksComponent } from './tasks/tasks.component';
import { RequestManualTimeComponent } from './manualTime/request-manual-time/request-manual-time.component';
import { RequestApprovalComponent } from './manualTime/requestApproval/requestApproval.component';
import { AddManualTimeComponent } from './manualTime/addManualTime/add-manual-time.component';
import { ActivityDescriptionComponent } from './reports/activity-description/activity-description.component';
import { AppAndWebsiteUsageComponent } from './reports/app-and-website-usage/app-and-website-usage.component';
import { PermissionsComponent } from './permissions/permissions.component';
import { RolePermissionComponent } from './role-permission/role-permission.component';
import { ResetPasswordComponent } from './login/reset-password/reset-password.component';
import { ProfileSettingsComponent } from './settings/profile-settings/profile-settings.component';
import { WorkspaceSettingsComponent } from './settings/workspace-settings/workspace-settings.component';
import { FeaturesSettingsComponent } from './settings/features-settings/features-settings.component';
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
import { SubtaskComponent } from './tasks/subtask/subtask.component';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { AdminCalendarComponent } from './calendar/admin-calendar/admin-calendar.component';
import { UserCalendarComponent } from './calendar/user-calendar/user-calendar.component';
import { AssetManagerComponent } from './AssetsManagement/assetAssetManager/asset.component';
import { DocumentManagerComponent } from './documentManager/documentManager.component';
import { LeaveManagementComponent } from './Leave/leave-grant/leave-grant.component';
import { ManageComponent } from './manage/manage/manage.component';
import { OrganizationComponent } from './organization/organization/organization.component';
import { TimesheetsComponent } from './timesheets/timesheets.component';
import { LeaveComponent } from './Leave/leave/leave.component';
import { ExpensesComponent } from './Expenses/expenses.component';
import { AlertsComponent } from './Alerts/alerts.component';
import { PayrollComponent } from './Payroll/payroll.component';
import { TaxationComponent } from './Taxation/taxation.component';
import { SeparationComponent } from './Separation/separation.component';
import { SettingsComponent } from './settings/settings.component';
import { ReportsComponent } from './reports/reports.component';
import { ApprovalsComponent } from './approvals/approvals.component';
import { UserTaxDeclarationComponent } from './Taxation/user-tax-declaration/user-tax-declaration.component';
import { ExpenseCategorySettingsComponent } from './Expenses/settings/expense-category-settings/expense-category-settings.component';
import { InterviewProcessMainComponent } from './pages/interviewProcess/interview-process-main/interview-process-main.component';
import { AttendanceManagementComponent } from './attendance/attendance-management/attendance-management.component';
const routes: Routes = [
  { path: '', component: MainComponent },
  { path: 'main', component: MainComponent },
  { path: 'login', component: LoginComponent },
  { path: 'forgotPassword', component: ForgotPasswordComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'changePassword', component: ChangePasswordComponent },
  { path: 'resetPassword/:token', component: ResetPasswordComponent },
  { path: 'category-settings', component: ExpenseCategorySettingsComponent },
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
      { path: 'project', component: ProjectListComponent },
      { path: 'realtime', component: RealtimeComponent },
      { path: 'tasks', component: TasksComponent },
      { path: 'tags', component: TagComponent },
      { path: 'requestManualTime', component: RequestManualTimeComponent },
      { path: 'ManualTimeRequestApproval', component: RequestApprovalComponent },
      { path: 'AddManualTime', component: AddManualTimeComponent },
      { path: 'activityDescription', component: ActivityDescriptionComponent },
      { path: 'applicationusages', component: AppAndWebsiteUsageComponent },
      { path: 'permissions', component: PermissionsComponent },
      { path: 'rolePermission', component: RolePermissionComponent },
      { path: 'adminTimesheets', component: AdminTimesheetComponent },
      { path: 'userTimesheet', component: UserTimesheetComponent },
      { path: 'workspace', component: WorkspaceSettingsComponent },
      { path: 'features', component: FeaturesSettingsComponent },
      { path: 'leavesettings', component: LeaveSettingsComponent },
      { path: 'edit-task', component: EditTaskComponent },
      { path: 'comments', component: TaskCommentComponent },
      { path: 'genericSettings', component: GenericSettingsComponent },
      { path: 'viewLiveScreen', component: ViewLiveScreenComponent },
      { path: 'emailtemplate', component: EmailTemplateComponent },
      { path: 'SubTask', component: SubtaskComponent },
      { path: 'assetsManagement', component: AssetManagerComponent },
      { path: 'AdminCalendar', component: AdminCalendarComponent },
      { path: 'UserCalendar', component: UserCalendarComponent },
      { path: 'documentManager', component: DocumentManagerComponent },
      { path: 'leave', component: LeaveManagementComponent },
      { path: 'manage', component: ManageComponent },
      { path: 'organization', component: OrganizationComponent },
      { path: 'attendance', component: AttendanceManagementComponent },
      { path: 'timesheet', component: TimesheetsComponent },
      { path: 'Leave', component: LeaveComponent },
      { path: 'expenses', component: ExpensesComponent },
      { path: 'alerts', component: AlertsComponent },
      { path: 'payroll', component: PayrollComponent },
      { path: 'taxation', component: TaxationComponent},
      { path: 'separation', component: SeparationComponent },
      { path: 'settings', component: SettingsComponent },
      { path: 'reports', component: ReportsComponent},
      { path: 'Approvals', component: ApprovalsComponent},
      { path: 'taxDeclaration', component: UserTaxDeclarationComponent },
      { path: 'interviewProcess', component: InterviewProcessMainComponent }
    ]
  }
]

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forRoot(routes, { useHash: true }),
    ScrollingModule
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
