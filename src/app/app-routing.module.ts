import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './login/register/register.component';
import { ForgotPasswordComponent } from './login/forgot-password/forgot-password.component';
import { AuthGuard } from './auth.guard';
import { ChangePasswordComponent } from './login/change-password/change-password.component';
import { TeammembersComponent } from './manage/teammembers/teammembers.component';
import { HomeComponent } from './layouts/home/home.component';
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
import { WorkspaceSettingsComponent } from './settings/workspace-settings/workspace-settings.component';
import { FeaturesSettingsComponent } from './settings/features-settings/features-settings.component';
import { TagComponent } from './tasks/task.tag/tag.component';
import { EditTaskComponent } from './tasks/edit-task/edit-task.component';
import { TaskCommentComponent } from './tasks/task-comment/task-comment.component';
import { UserTimesheetComponent } from './timesheets/user-timesheet/user-timesheet.component';
import { AdminTimesheetComponent } from './timesheets/admin-timesheet/admin-timesheet.component';
import { GenericSettingsComponent } from './settings/generic-settings/generic-settings.component';
import { ViewLiveScreenComponent } from './viewLiveScreen/view-live-screen/view-live-screen.component';
import { SubtaskComponent } from './tasks/subtask/subtask.component';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { AdminCalendarComponent } from './calendar/admin-calendar/admin-calendar.component';
import { UserCalendarComponent } from './calendar/user-calendar/user-calendar.component';
import { TimesheetsComponent } from './timesheets/timesheets.component';
import { AlertsComponent } from './Alerts/alerts.component';
import { TaxationComponent } from './Taxation/taxation.component';
import { SeparationComponent } from './Separation/separation.component';
import { SettingsComponent } from './settings/settings.component';
import { ReportsComponent } from './reports/reports.component';
import { ApprovalsComponent } from './approvals/approvals.component';
import { UserTaxDeclarationComponent } from './Taxation/user-tax-declaration/user-tax-declaration.component';
import { ExpenseCategorySettingsComponent } from './Expenses/settings/expense-category-settings/expense-category-settings.component';
import { InterviewProcessMainComponent } from './pages/interviewProcess/interview-process-main/interview-process-main.component';

const routes: Routes = [
  {
    path: '', component: HomeComponent, canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard', loadChildren: () =>
          import('./feature_modules/dashboard/dashboard.module').then(m => m.DashboardModule),
      },
      {
        path: 'screenshots', loadChildren: () =>
          import('./feature_modules/screenshots/screenshots.module').then(m => m.ScreenshotsModule)
      },
      { path: 'logout', component: LoginComponent },
      { path: 'teamMembers', component: TeammembersComponent },
      { path: 'roles', component: RolesComponent },
      { path: 'permissionModel', component: PermissionModelComponent },
      { path: 'Profile', component: ProfileComponent },
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
      { path: 'edit-task', component: EditTaskComponent },
      { path: 'comments', component: TaskCommentComponent },
      { path: 'genericSettings', component: GenericSettingsComponent },
      { path: 'viewLiveScreen', component: ViewLiveScreenComponent },
      { path: 'SubTask', component: SubtaskComponent },
      { path: 'AdminCalendar', component: AdminCalendarComponent },
      { path: 'UserCalendar', component: UserCalendarComponent },
      { path: 'manage', loadChildren: () => import('./manage/manage-routing.module').then(m => m.ManageRoutingModule) },
      { path: 'organization', loadChildren: () => import('./organization/organization-routing.module').then(m => m.OrganizationRoutingModule) },
      { path: 'attendance', loadChildren: () => import('./attendance/attendance-routing.module').then(m => m.AttendanceRoutingModule) },
      { path: 'timesheet', component: TimesheetsComponent },
      { path: 'leave', loadChildren: () => import('./Leave/leave-routing.module').then(m => m.LeaveRoutingModule) },
      { path: 'expense', loadChildren: () => import('./Expenses/expenses-routing.module').then(m => m.ExpensesRoutingModule) },
      { path: 'alerts', component: AlertsComponent },
      { path: 'payroll', loadChildren: () => import('./feature_modules/payroll/payroll.module').then(m => m.PayrollModule) },
      { path: 'taxation', component: TaxationComponent },
      { path: 'separation', component: SeparationComponent },
      { path: 'settings', component: SettingsComponent },
      { path: 'reports', component: ReportsComponent },
      { path: 'Approvals', component: ApprovalsComponent },
      { path: 'taxDeclaration', component: UserTaxDeclarationComponent },
      { path: 'interviewProcess', component: InterviewProcessMainComponent }
    ]
  },
  { path: 'main', component: MainComponent },
  { path: 'login', component: LoginComponent },
  { path: 'forgotPassword', component: ForgotPasswordComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'changePassword', component: ChangePasswordComponent },
  { path: 'resetPassword/:token', component: ResetPasswordComponent },
  { path: 'category-settings', component: ExpenseCategorySettingsComponent },

  { path: '**', redirectTo: 'main' },

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
