import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './login/register/register.component';
import { ForgotPasswordComponent } from './login/forgot-password/forgot-password.component';
import { AuthGuard } from './auth.guard';
import { ChangePasswordComponent } from './login/change-password/change-password.component';
import { HomeComponent } from './layouts/home/home.component';
import { RolesComponent } from './feature_modules/manage/roles/roles/roles.component';
import { PermissionModelComponent } from './feature_modules/manage/permissonModel/permission-model/permission-model.component';
import { ProfileComponent } from './profile/profile.component';
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
import { GenericSettingsComponent } from './settings/generic-settings/generic-settings.component';
import { ViewLiveScreenComponent } from './viewLiveScreen/view-live-screen/view-live-screen.component';
import { SubtaskComponent } from './tasks/subtask/subtask.component';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { AlertsComponent } from './feature_modules/alerts/alerts.component';
import { TaxationComponent } from './Taxation/taxation.component';
import { SeparationComponent } from './Separation/separation.component';
import { SettingsComponent } from './settings/settings.component';
import { ReportsComponent } from './reports/reports.component';
import { ApprovalsComponent } from './approvals/approvals.component';
import { UserTaxDeclarationComponent } from './Taxation/user-tax-declaration/user-tax-declaration.component';
import { ExpenseCategorySettingsComponent } from './feature_modules/expenses/settings/expense-category-settings/expense-category-settings.component';
import { InterviewProcessMainComponent } from './pages/interviewProcess/interview-process-main/interview-process-main.component';

const routes: Routes = [
  { path: '', redirectTo: 'landing', pathMatch: 'full' },
  { path: 'landing', component: MainComponent },
  {
    path: 'home', component: HomeComponent, canActivate: [AuthGuard],
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
      {
        path: 'realtime', loadChildren: () =>
          import('./feature_modules/realtime/realtime.module').then(m => m.RealtimeModule)
      },
      {
        path: 'organization', loadChildren: () =>
          import('./feature_modules/organization/organization.module').then(m => m.OragnizationModule)
      },
      {
        path: 'manage', loadChildren: () =>
          import('./feature_modules/manage/manage.module').then(m => m.ManageModule)
      },
      {
        path: 'calendar', loadChildren: () =>
          import('./feature_modules/calendar/calendar.module').then(m => m.CalendarModule)
      },
      {
        path: 'attendance', loadChildren: () =>
          import('./feature_modules/attendance/attendance.module').then(m => m.AttendanceModule)
      },
      {
        path: 'timesheets', loadChildren: () =>
          import('./feature_modules/timesheets/timesheets.module').then(m => m.TimesheetsModule)
      },
      {
        path: 'leave',
        loadChildren: () => import('./feature_modules/leave/leave.module').then(m => m.LeaveModule)
      },
      {
        path: 'expense',
        loadChildren: () => import('./feature_modules/expenses/expenses.module').then(m => m.ExpensesModule)
      },
      { 
        path: 'alerts', 
        loadChildren: () => import('./feature_modules/alerts/alerts.module').then(m => m.AlertsModule)
      },
      {
        path: 'payroll',
        loadChildren: () => import('./feature_modules/payroll/payroll.module').then(m => m.PayrollModule)
      },

      { path: 'logout', component: LoginComponent },
      { path: 'roles', component: RolesComponent }, // TODO: module to bepick from manage
      { path: 'permissionModel', component: PermissionModelComponent },  // TODO: module to bepick from manage
      { path: 'Profile', component: ProfileComponent },
      { path: 'tasks', component: TasksComponent },
      { path: 'tags', component: TagComponent },
      { path: 'requestManualTime', component: RequestManualTimeComponent },
      { path: 'ManualTimeRequestApproval', component: RequestApprovalComponent },
      { path: 'AddManualTime', component: AddManualTimeComponent },
      { path: 'activityDescription', component: ActivityDescriptionComponent },
      { path: 'applicationusages', component: AppAndWebsiteUsageComponent },
      { path: 'permissions', component: PermissionsComponent },
      { path: 'rolePermission', component: RolePermissionComponent },
      { path: 'workspace', component: WorkspaceSettingsComponent },
      { path: 'features', component: FeaturesSettingsComponent },
      { path: 'edit-task', component: EditTaskComponent },
      { path: 'comments', component: TaskCommentComponent },
      { path: 'genericSettings', component: GenericSettingsComponent },
      { path: 'viewLiveScreen', component: ViewLiveScreenComponent },
      { path: 'SubTask', component: SubtaskComponent },

      { path: 'taxation', component: TaxationComponent },
      { path: 'separation', component: SeparationComponent },
      { path: 'settings', component: SettingsComponent },
      { path: 'reports', component: ReportsComponent },
      { path: 'Approvals', component: ApprovalsComponent },
      { path: 'taxDeclaration', component: UserTaxDeclarationComponent },
      { path: 'interviewProcess', component: InterviewProcessMainComponent }
    ]
  },
  { path: 'login', component: LoginComponent },
  { path: 'forgotPassword', component: ForgotPasswordComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'changePassword', component: ChangePasswordComponent },
  { path: 'resetPassword/:token', component: ResetPasswordComponent },
  { path: 'category-settings', component: ExpenseCategorySettingsComponent },

  // Fallback route
  { path: '**', redirectTo: 'landing' },

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
