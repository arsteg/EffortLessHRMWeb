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

const routes: Routes = [
 // {path:'',component:LayoutComponentComponent, canActivate: [AuthGuard]},


  {path:'',component:LoginComponent},
  {path:'login',component:LoginComponent},
  {path:'',  redirectTo:'login', pathMatch:'full'},
  {path:'', component:HomeComponent,
     children:[
  {path:'dashboard',component:DashboardComponent},
  {path:'logout',component:LoginComponent},
  {path:'register',component:RegisterComponent},
  {path:'resetPassword/:token',component:ResetPasswordComponent},
  {path:'forgotPassword',component:ForgotPasswordComponent},
  {path:'userProfile',component:UserProfileComponent},
  {path:'screenshots',component:ScreenshotsComponent},
  {path:'teamMembers',component:TeammembersComponent},
  {path:'roles',component:RolesComponent},
  {path:'permissionModel',component:PermissionModelComponent},
]}
]

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forRoot(routes,{relativeLinkResolution:'legacy', useHash: true}),
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
