import { CUSTOM_ELEMENTS_SCHEMA, NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { TasksComponent } from "./tasks.component";
import { SharedModule } from "../shared/shared.Module";
import { ReactiveFormsModule } from "@angular/forms";
import { TagComponent } from "./task.tag/tag.component";
import { TaskCommentComponent } from "./task-comment/task-comment.component";
import { TaskCommentListComponent } from "./task-comment-list/task-comment-list.component";
import { RouterModule } from "@angular/router";
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import {MatDialogModule} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { ConfirmationDialogComponent } from "./confirmation-dialog/confirmation-dialog.component";
import { EditTaskComponent } from "./edit-task/edit-task.component";

@NgModule({
    declarations:[TasksComponent,TagComponent,TaskCommentComponent,TaskCommentListComponent, ConfirmationDialogComponent, EditTaskComponent],
    exports:[TasksComponent,TagComponent,TaskCommentComponent,TaskCommentListComponent ],
    imports:[SharedModule,ReactiveFormsModule, RouterModule, TooltipModule, MatDialogModule, MatButtonModule, CommonModule],
    schemas: [
      CUSTOM_ELEMENTS_SCHEMA,
      NO_ERRORS_SCHEMA
    ],
  })
export class taskModule{

}
