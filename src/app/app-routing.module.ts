import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './login/register/register.component';
import { ForgotPasswordComponent } from './login/forgot-password/forgot-password.component';
import { AuthGuard } from './auth.guard';
import { ChangePasswordComponent } from './login/change-password/change-password.component';
import { HomeComponent } from './layouts/home/home.component';
import { MainComponent } from './layouts/main/main.component';
import { TasksComponent } from './tasks/tasks.component';
import { ResetPasswordComponent } from './login/reset-password/reset-password.component';
import { TagComponent } from './tasks/task.tag/tag.component';
import { EditTaskComponent } from './tasks/edit-task/edit-task.component';
import { TaskCommentComponent } from './tasks/task-comment/task-comment.component';
import { SubtaskComponent } from './tasks/subtask/subtask.component';
import { SubscriptionComponent } from './layouts/subscription/subscription.component';
import { LogComponent } from './feature_modules/logs/log.component/log.component.component';
import { FeedbackSubmissionComponent } from './feature_modules/feedback/feedback-submission/feedback-submission.component';
import { FeedbackSettingsComponent } from './feature_modules/feedback/feedback.settings.component';
import { NotificationDetailsComponent } from './layouts/home/notification/notification-details/notification-details.component';
import { TranslationResolver } from './_helpers/translation.resolver';

const routes: Routes = [
  { path: '', redirectTo: 'landing', pathMatch: 'full' },
  { path: 'landing', component: MainComponent },
  {
    path: 'home', component: HomeComponent, canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadChildren: () => import('./feature_modules/dashboard/dashboard.module').then(m => m.DashboardModule),
        resolve: { translation: TranslationResolver },
        data: { moduleKey: 'dashboard' }
      },
      {
        path: 'screenshots',
        loadChildren: () => import('./feature_modules/screenshots/screenshots.module').then(m => m.ScreenshotsModule)
      },
      {
        path: 'realtime',
        loadChildren: () => import('./feature_modules/realtime/realtime.module').then(m => m.RealtimeModule)
      },
      {
        path: 'organization',
        loadChildren: () => import('./feature_modules/organization/organization.module').then(m => m.OragnizationModule)
      },
      {
        path: 'manage',
        loadChildren: () => import('./feature_modules/manage/manage.module').then(m => m.ManageModule)
      },
      {
        path: 'calendar',
        loadChildren: () => import('./feature_modules/calendar/calendar.module').then(m => m.CalendarModule)
      },
      {
        path: 'attendance',
        loadChildren: () => import('./feature_modules/attendance/attendance.module').then(m => m.AttendanceModule),
        resolve: { translation: TranslationResolver },
        data: { moduleKey: 'attendance' }
      },
      {
        path: 'timesheets',
        loadChildren: () => import('./feature_modules/timesheets/timesheets.module').then(m => m.TimesheetsModule)
      },
      {
        path: 'leave',
        loadChildren: () => import('./feature_modules/leave/leave.module').then(m => m.LeaveModule)
      },
      {
        path: 'expense',
        loadChildren: () => import('./feature_modules/expenses/expenses.module').then(m => m.ExpensesModule),
        resolve: { translation: TranslationResolver },
        data: { moduleKey: 'expenses' }
      },
      {
        path: 'alerts',
        loadChildren: () => import('./feature_modules/alerts/alerts.module').then(m => m.AlertsModule)
      },
      {
        path: 'payroll',
        loadChildren: () => import('./feature_modules/payroll/payroll.module').then(m => m.PayrollModule),
        resolve: { translation: TranslationResolver },
        data: { moduleKey: 'payroll' }
      },
      {
        path: 'taxation',
        loadChildren: () => import('./feature_modules/taxation/taxation.module').then(m => m.TaxationModule)
      },
      {
        path: 'reports',
        loadChildren: () => import('./feature_modules/reports/reports.module').then(m => m.ReportsModule)
      },
      {
        path: 'separation',
        loadChildren: () => import('./feature_modules/separation/separation.module').then(m => m.SeparationModule),
        resolve: { translation: TranslationResolver },
        data: { moduleKey: 'separation' }
      },
      {
        path: 'settings',
        loadChildren: () => import('./feature_modules/settings/settings.module').then(m => m.SettingsModule)
      },
      {
        path: 'permissions',
        loadChildren: () => import('./feature_modules/permissions/permissions.module').then(m => m.PermissionsModule)
      },
      {
        path: 'roles',
        loadChildren: () => import('./feature_modules/roles/roles.module').then(m => m.RolesModule)
      },
      {
        path: 'role-permission',
        loadChildren: () => import('./feature_modules/role-permission/role-permission.module').then(m => m.RolePermissionModule)
      },
      {
        path: 'manual-time',
        loadChildren: () => import('./feature_modules/manual-time/manual-time.module').then(m => m.ManualTimeModule)
      },
      {
        path: 'approvals',
        loadChildren: () => import('./feature_modules/approvals/approvals.module').then(m => m.ApprovalsModule)
      },
      {
        path: 'interview-process',
        loadChildren: () => import('./feature_modules/interview-process/interview-process.module').then(m => m.InterviewProcessModule)
      },
      {
        path: 'subscription',
        loadChildren: () => import('./feature_modules/subscription/subscription.module').then(m => m.SubscriptionModule)
      },
      { path: 'tasks', component: TasksComponent }, // TODO: Shared Component
      { path: 'SubTask', component: SubtaskComponent }, // TODO: Shared Component
      { path: 'edit-task', component: EditTaskComponent }, // TODO: Shared Component
      { path: 'tags', component: TagComponent }, // TODO: Shared Component
      { path: 'comments', component: TaskCommentComponent }, //TODO: Shared component
      { path: 'feedback', component: FeedbackSettingsComponent },
      { path: 'notifications', component: NotificationDetailsComponent },
      {
        path: 'profile', 
        loadChildren: () => import('./feature_modules/manage/users/employee-settings/employee-settings.module').then(m => m.EmployeeSettingsModule)
       }
    ]
  },
  {
    path: 'subscription',
    component: SubscriptionComponent,
    children: [
      {
        path: '',
        loadChildren: () => import('./feature_modules/subscription/subscription.module').then(m => m.SubscriptionModule)
      }
    ]
  },
  { path: 'login', component: LoginComponent },
  { path: 'forgotPassword', component: ForgotPasswordComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'changePassword', component: ChangePasswordComponent },
  { path: 'resetPassword/:token', component: ResetPasswordComponent },
  { path: 'live-logs', component: LogComponent },
  { path: 'submit-feedback', component: FeedbackSubmissionComponent },
  // Fallback route
  { path: '**', redirectTo: 'landing' },

]

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forRoot(routes, { useHash: true }),
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
