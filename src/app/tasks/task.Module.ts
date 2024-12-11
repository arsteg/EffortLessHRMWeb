import { CUSTOM_ELEMENTS_SCHEMA, NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { TasksComponent } from "./tasks.component";
import { SharedModule } from "../shared/shared.Module";
import { TagComponent } from "./task.tag/tag.component";
import { TaskCommentComponent } from "./task-comment/task-comment.component";
import { TaskCommentListComponent } from "./task-comment-list/task-comment-list.component";
import { ConfirmationDialogComponent } from "./confirmation-dialog/confirmation-dialog.component";
import { EditTaskComponent } from "./edit-task/edit-task.component";
import { SubtaskComponent } from "./subtask/subtask.component";
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
@NgModule({
  declarations: [TasksComponent, TagComponent, TaskCommentComponent, TaskCommentListComponent, ConfirmationDialogComponent, EditTaskComponent, SubtaskComponent],
  exports: [TasksComponent, TagComponent, TaskCommentComponent, TaskCommentListComponent, SubtaskComponent],
  imports: [
    SharedModule,
    NgbModule, 
    BsDropdownModule
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA,
    NO_ERRORS_SCHEMA
  ],
})
export class taskModule {

}
