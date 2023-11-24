import { CUSTOM_ELEMENTS_SCHEMA, NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimeLogService } from '../_services/timeLogService';
// import { TeammembersComponent } from './teammembers/teammembers.component';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
import { MatLegacyRadioModule as MatRadioModule } from '@angular/material/legacy-radio';
import { ManageComponent } from './manage/manage.component';
import { UserListComponent } from '../users/user-list/user-list.component';
import { CommonComponentsModule } from '../common/commonComponents.module';
import { SharedModule } from '../shared/shared.Module';
import { ProjectListComponent } from '../Project/project-list/project-list.component';
import { TasksComponent } from '../tasks/tasks.component';
import { RequestManualTimeComponent } from '../manualTime/request-manual-time/request-manual-time.component';
import { TeammembersComponent } from './teammembers/teammembers.component';
import { EmailTemplateComponent } from '../email-template/email-template.component';
import { taskModule } from '../tasks/task.Module';


@NgModule({
  declarations: [
    ManageComponent, UserListComponent, ProjectListComponent, RequestManualTimeComponent,
    TeammembersComponent, EmailTemplateComponent
  ],
  imports: [
    CommonModule,
    MatRadioModule,
    MatCheckboxModule, CommonComponentsModule, SharedModule, taskModule, CommonComponentsModule
  ],
  exports: [UserListComponent, ProjectListComponent,  RequestManualTimeComponent,
    TeammembersComponent, EmailTemplateComponent],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA,
    NO_ERRORS_SCHEMA
  ],
  providers: [TimeLogService],
})
export class ManageModule { }
