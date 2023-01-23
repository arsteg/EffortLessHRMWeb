import { CUSTOM_ELEMENTS_SCHEMA, NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './login/register/register.component';
import { ForgotPasswordComponent } from './login/forgot-password/forgot-password.component';
import { SidebarDirective } from './layout/sidebar.directive';
import { HttpClientModule } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ResetPasswordComponent } from './login/reset-password/reset-password.component';
import { ToastrModule } from 'ngx-toastr';
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';
import { LayoutModule } from '@angular/cdk/layout';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { ProjectListComponent } from './Project/project-list/project-list.component';
import { AddProjectComponent } from './Project/add-project/add-project.component';
import { AgGridModule } from 'ag-grid-angular';
import { ChangePasswordComponent } from './login/change-password/change-password.component';
import { UserListComponent } from './users/user-list/user-list.component';
import { UserFormCOntrolComponent } from './users/user-profile/user-form-control/user-form-control.component';
import { UserProfileComponent } from './users/user-profile/user-profile.component';
import { FormControlsComponent } from './common/form-controls/form-controls.component';
import { ScreenshotsComponent } from './screenshots/screenshots/screenshots.component';
import { DatePipe } from '@angular/common';
import { NgHttpLoaderModule } from 'ng-http-loader';
import { TeammembersComponent } from './manage/teammembers/teammembers.component';
import { HomeComponent } from './home/home.component';
import { RolesComponent } from './manage/roles/roles/roles.component';
import { PermissionModelComponent } from './manage/permissonModel/permission-model/permission-model.component';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatRadioModule} from '@angular/material/radio';
import { ProfileComponent } from './profile/profile.component';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ReportsComponent } from './reports/reports.component';
import { TimelineComponent } from './reports/timeline/timeline.component';
import {MatTableModule} from '@angular/material/table';
import {MatFormFieldModule} from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { SortDirective } from './directive/sort.directive';
import { SearchPipe } from './search.pipe';
import { NgxPaginationModule } from 'ngx-pagination';
import { AttendanceComponent } from './reports/attendance/attendance.component';
import { RealtimeComponent } from './realtime/realtime.component';
import { MainComponent } from './main/main.component';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { TasksComponent } from './tasks/tasks.component';
import { ModalModule } from 'ngx-bootstrap/modal';
import {MatSelectModule} from '@angular/material/select';
@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    ForgotPasswordComponent,
    SidebarDirective,
    ResetPasswordComponent,
    ProjectListComponent,
    AddProjectComponent,
          ChangePasswordComponent,
          UserListComponent,
          UserProfileComponent,
          UserFormCOntrolComponent,
          FormControlsComponent,
          ScreenshotsComponent,
          TeammembersComponent,
          HomeComponent,
          RolesComponent,
          PermissionModelComponent,
          ProfileComponent,
          ReportsComponent,
          TimelineComponent,
          SortDirective,
          SearchPipe,
          AttendanceComponent,
          RealtimeComponent,
          MainComponent,
          TasksComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    ToastrModule.forRoot(),
    NgHttpLoaderModule.forRoot(),
    AgGridModule.withComponents([]),
    BsDropdownModule.forRoot(),
    BrowserAnimationsModule,
    NoopAnimationsModule,
    LayoutModule,
    MatToolbarModule,
    MatButtonModule,
    MatSidenavModule, MatIconModule, MatListModule,
    MatCheckboxModule, MatRadioModule, TooltipModule,
    MatTableModule, MatFormFieldModule, MatInputModule,
    NgxPaginationModule,
    ModalModule,
    MatSelectModule
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA,
    NO_ERRORS_SCHEMA
  ],
  providers: [DatePipe],
  bootstrap: [AppComponent]
})

export class AppModule { }
