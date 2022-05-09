import { Component, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login/login.component';
import { LayoutComponentComponent } from './layout/layout-component.component';
import { RegisterComponent } from './login/register/register.component';
import { ForgotPasswordComponent } from './login/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './login/reset-password/reset-password.component';

const routes: Routes = [
  {path:'',component:LayoutComponentComponent, pathMatch:'full'},
  {path:'login',component:LoginComponent},
  {path:'register',component:RegisterComponent},
  {path:'resetPassword/:token',component:ResetPasswordComponent},
  {path:'forgotPassword',component:ForgotPasswordComponent}
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forRoot(routes,{relativeLinkResolution:'legacy'}),
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
