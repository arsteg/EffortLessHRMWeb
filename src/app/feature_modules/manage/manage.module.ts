import { CUSTOM_ELEMENTS_SCHEMA, NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimeLogService } from 'src/app/_services/timeLogService';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { ManageComponent } from './manage/manage.component';
import { CommonComponentsModule } from 'src/app/common/commonComponents.module';
import { MatExpansionModule } from '@angular/material/expansion';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ManageRoutingModule } from './manage-routing.module';
import { QuillModule } from "ngx-quill";
import { UserListComponent } from './users/user-list/user-list.component';
import { TeammembersComponent } from './teammembers/teammembers.component';
import { RolesComponent } from '../roles/roles/roles.component';
import { PermissionModelComponent } from './permissonModel/permission-model/permission-model.component';
import { EmailTemplateComponent } from './email-template/email-template.component';
import { EmailTemplateTypeComponent } from './email-template-type/email-template-type.component';
import { ProjectListComponent } from './Project/project-list/project-list.component';
@NgModule({
  declarations: [
    ManageComponent,
    UserListComponent,
    TeammembersComponent,
    RolesComponent,
    PermissionModelComponent,
    EmailTemplateComponent,
    EmailTemplateTypeComponent,
    ProjectListComponent
  ],
  imports: [
    CommonModule,
    CommonComponentsModule,
    MatExpansionModule,
    NgbModule,
    ManageRoutingModule,
    QuillModule.forRoot()
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA,
    NO_ERRORS_SCHEMA
  ],
  providers: [TimeLogService],
})
export class ManageModule { }
