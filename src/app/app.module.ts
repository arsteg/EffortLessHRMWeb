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

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    LayoutComponentComponent,
    RegisterComponent,
    ForgotPasswordComponent,
    DashboardComponent,
    SidebarDirective
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
