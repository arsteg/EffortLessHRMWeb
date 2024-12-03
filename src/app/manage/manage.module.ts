import { CUSTOM_ELEMENTS_SCHEMA, NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimeLogService } from '../_services/timeLogService';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { ManageComponent } from './manage/manage.component';
import { CommonComponentsModule } from '../common/commonComponents.module';
import { SharedModule } from '../shared/shared.Module';
import { ProjectListComponent } from '../Project/project-list/project-list.component';
import { TeammembersComponent } from './teammembers/teammembers.component';
import { EmailTemplateComponent } from '../email-template/email-template.component';
import { taskModule } from '../tasks/task.Module';
import { MatExpansionModule } from '@angular/material/expansion';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ManageRoutingModule } from './manage-routing.module';
import { EmployeeSettingsModule } from './users/employee-settings/employee-settings.module';
import { QuillModule } from "ngx-quill";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UserListComponent } from './users/user-list/user-list.component';
@NgModule({
  declarations: [
    ManageComponent, 
    ProjectListComponent,
    TeammembersComponent,
    EmailTemplateComponent,
    UserListComponent
  ],
  imports: [
    CommonModule,
    MatRadioModule,
    MatCheckboxModule,
    CommonComponentsModule,
    SharedModule,
    taskModule,
    MatExpansionModule,
    NgbModule,
    ManageRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    EmployeeSettingsModule,
    QuillModule.forRoot()
  ],
  exports: [
    ProjectListComponent,
    TeammembersComponent,
    EmailTemplateComponent,
    UserListComponent
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA,
    NO_ERRORS_SCHEMA
  ],
  providers: [TimeLogService],
})
export class ManageModule { }
