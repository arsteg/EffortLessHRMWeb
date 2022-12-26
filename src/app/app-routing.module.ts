import { Component, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './login/register/register.component';
import { ForgotPasswordComponent } from './login/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './login/reset-password/reset-password.component';
import { ProjectListComponent } from './Project/project-list/project-list.component';
import { AuthGuard } from './_helpers/auth.guard';
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

const routes: Routes = [
  // {path:'',component:LayoutComponentComponent, canActivate: [AuthGuard]},


  { path: '', component: MainComponent },
  { path: '', redirectTo: 'main', pathMatch: 'full' },
  { path: 'main', component: MainComponent },
  { path: 'login', component: LoginComponent },
  { path: 'forgotPassword', component: ForgotPasswordComponent },
  { path: 'register', component: RegisterComponent }, 
  {
    path: '', component: HomeComponent,
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'logout', component: LoginComponent },
      // { path: 'login', component: LoginComponent },
      { path: 'resetPassword/:token', component: ResetPasswordComponent },
      { path: 'userProfile', component: UserProfileComponent },
      { path: 'screenshots', component: ScreenshotsComponent },
      { path: 'teamMembers', component: TeammembersComponent },
      { path: 'roles', component: RolesComponent },
      { path: 'permissionModel', component: PermissionModelComponent },
      { path: 'Profile', component: ProfileComponent },
      { path: 'timeline', component: TimelineComponent },
      { path: 'project', component: ProjectListComponent},
      { path: 'people' , component: UserListComponent},
      { path: 'attendance', component: AttendanceComponent },
      { path: 'realtime', component: RealtimeComponent }
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
