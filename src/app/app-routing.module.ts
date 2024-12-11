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
import { PermissionsComponent } from './permissions/permissions.component';
import { RolePermissionComponent } from './role-permission/role-permission.component';
import { ResetPasswordComponent } from './login/reset-password/reset-password.component';
import { TagComponent } from './tasks/task.tag/tag.component';
import { EditTaskComponent } from './tasks/edit-task/edit-task.component';
import { TaskCommentComponent } from './tasks/task-comment/task-comment.component';
import { GenericSettingsComponent } from './feature_modules/settings/generic-settings/generic-settings.component';
import { ViewLiveScreenComponent } from './viewLiveScreen/view-live-screen/view-live-screen.component';
import { SubtaskComponent } from './tasks/subtask/subtask.component';
import { ScrollingModule } from '@angular/cdk/scrolling';
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
        path: 'dashboard',
        loadChildren: () => import('./feature_modules/dashboard/dashboard.module').then(m => m.DashboardModule),
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
        loadChildren: () => import('./feature_modules/attendance/attendance.module').then(m => m.AttendanceModule)
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
      {
        path: 'taxation', 
        loadChildren: () => import('./feature_modules/taxation/taxation.module').then(m=>m.TaxationModule)
      },
      { 
        path: 'reports',
        loadChildren: () => import('./feature_modules/reports/reports.module').then(m=>m.ReportsModule)
      },
      { 
        path: 'separation',
        loadChildren: () => import('./feature_modules/separation/separation.module').then(m=>m.SeparationModule) 
      },
      { 
        path: 'settings',
        loadChildren: () => import('./feature_modules/settings/settings.module').then(m=>m.SettingsModule) 
      },
      { path: 'manual-time',
        loadChildren: ()=> import('./feature_modules/manual-time/manual-time.module').then(m=>m.ManualTimeModule) 
      },
      {
         path: 'Approvals', 
        loadChildren: () => import('./feature_modules/approvals/approvals.module').then(m=>m.ApprovalsModule)
      },


      { path: 'logout', component: LoginComponent },
      { path: 'roles', component: RolesComponent }, // TODO: module to bepick from manage
      { path: 'permissionModel', component: PermissionModelComponent },  // TODO: module to bepick from manage
      { path: 'Profile', component: ProfileComponent }, // Individual route
      { path: 'tasks', component: TasksComponent },
      { path: 'tags', component: TagComponent },
      { path: 'permissions', component: PermissionsComponent },
      { path: 'rolePermission', component: RolePermissionComponent },
      { path: 'edit-task', component: EditTaskComponent },
      { path: 'comments', component: TaskCommentComponent },
      { path: 'genericSettings', component: GenericSettingsComponent },
      { path: 'viewLiveScreen', component: ViewLiveScreenComponent },
      { path: 'SubTask', component: SubtaskComponent },

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
