import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { LayoutComponentComponent } from './layout/layout-component.component';
import { RegisterComponent } from './login/register/register.component';
import { ForgotPasswordComponent } from './login/forgot-password/forgot-password.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { SidebarDirective } from './layout/sidebar.directive';
import { HttpClientModule } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { AlertComponent } from '../app/_components/alert.component';
import { ResetPasswordComponent } from './login/reset-password/reset-password.component';
@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    LayoutComponentComponent,
    RegisterComponent,
    ForgotPasswordComponent,
    DashboardComponent,
    SidebarDirective,
    AlertComponent,
    ResetPasswordComponent

  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule

  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
