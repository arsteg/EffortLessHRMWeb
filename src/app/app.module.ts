import {
  CUSTOM_ELEMENTS_SCHEMA,
  NgModule,
  NO_ERRORS_SCHEMA,
} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './login/register/register.component';
import { ForgotPasswordComponent } from './login/forgot-password/forgot-password.component';
import { SidebarDirective } from './layout/sidebar.directive';
import {
  HTTP_INTERCEPTORS,
  HttpClient,
  HttpClientModule,
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { ResetPasswordComponent } from './login/reset-password/reset-password.component';
import { ToastrModule } from 'ngx-toastr';
import {
  BrowserAnimationsModule,
  NoopAnimationsModule,
} from '@angular/platform-browser/animations';
import { LayoutModule } from '@angular/cdk/layout';
import { ChangePasswordComponent } from './login/change-password/change-password.component';
import { NgHttpLoaderModule } from 'ng-http-loader';
import { HomeComponent } from './layouts/home/home.component';
import { ProfileComponent } from './profile/profile.component';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { MainComponent } from './layouts/main/main.component';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { ModalModule } from 'ngx-bootstrap/modal';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonService } from 'src/app/_services/common.Service';
import { UserService } from './_services/users.service';
import { PermissionsComponent } from './feature_modules/permissions/permissions/permissions.component';
import { RolePermissionComponent } from './feature_modules/role-permission/role-permission/role-permission.component';
import { AuthGuard } from './auth.guard';
import { taskModule } from './tasks/task.Module';
import { SharedModule } from './shared/shared.Module';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { DatePipe } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { QuillModule } from 'ngx-quill';
import { CommonComponentsModule } from './common/commonComponents.module';
import { FormsModule } from '@angular/forms';
import { SocketIoConfig, SocketIoModule } from 'ngx-socket-io';
import { NotificationComponent } from './layouts/home/notification/notification.component';
import { environment } from '../environments/environment';
import { UserProfileComponent } from './feature_modules/manage/users/user-profile/user-profile.component';
import { SubscriptionComponent } from './layouts/subscription/subscription.component';
import { ErrorInterceptor } from './_helpers/error.interceptor';
import { ChatbotComponent } from './chat/chatbot/chatbot.component';
import { EffortlessTranslateModule } from './translate/translate.module';
import { HelpDeskComponent } from './feature_modules/helpdesk/help-desk/help-desk.component';
import { HelpdeskDashboardComponent } from './feature_modules/helpdesk/helpdesk-dashboard/helpdesk-dashboard.component';
import { UpdateHelpdeskTaskComponent } from './feature_modules/helpdesk/update-helpdesk-task/update-helpdesk-task.component';
import { SidebarComponent } from './layouts/home/sidebar/sidebar.component';
import { HeaderComponent } from './layouts/home/header/header.component';
import { LandingPageComponent } from './layouts/landing-page/landing-page.component';
import { NavbarComponent } from './layouts/landing-page/navbar/navbar.component';
import { HeroComponent } from './layouts/landing-page/hero/hero.component';
import { FeaturesComponent } from './layouts/landing-page/features/features.component';
import { AboutUsComponent } from './layouts/landing-page/about-us/about-us.component';
import { TrustComponent } from './layouts/landing-page/trust/trust.component';
import { HrmFeaturesComponent } from './layouts/landing-page/hrm-features/hrm-features.component';
import { WorkspaceComponent } from './layouts/landing-page/workspace/workspace.component';
import { FooterComponent } from './layouts/landing-page/footer/footer.component';

const config: SocketIoConfig = { url: environment.webSocketUrl, options: {} };

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    ForgotPasswordComponent,
    SidebarDirective,
    ResetPasswordComponent,
    ChangePasswordComponent,
    HomeComponent,
    SubscriptionComponent,
    ProfileComponent,
    MainComponent,
    LandingPageComponent,
    NavbarComponent,
    HeroComponent,
    FeaturesComponent,
    AboutUsComponent,
    TrustComponent,
    HrmFeaturesComponent,
    WorkspaceComponent,
    FooterComponent,
    PermissionsComponent,
    RolePermissionComponent,
    NotificationComponent,
    UserProfileComponent, // imported from manage, to be used in home profile
    ChatbotComponent,
    HelpDeskComponent,
    HelpdeskDashboardComponent,
    UpdateHelpdeskTaskComponent,
    SidebarComponent,
    HeaderComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    ToastrModule.forRoot(),
    NgHttpLoaderModule.forRoot(),
    BsDropdownModule.forRoot(),
    LayoutModule,
    TooltipModule,
    ModalModule,
    DragDropModule,
    SharedModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatPaginatorModule,
    MatSlideToggleModule,
    MatDialogModule,
    CommonComponentsModule,
    QuillModule.forRoot(),
    FormsModule,
    EffortlessTranslateModule,
    SocketIoModule.forRoot(config),
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
  providers: [
    CommonService,
    UserService,
    AuthGuard,
    DatePipe,
    HttpClient,
    provideHttpClient(withInterceptorsFromDi()),
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
