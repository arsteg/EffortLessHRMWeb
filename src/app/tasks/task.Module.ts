import { NgModule } from "@angular/core";
import { TasksComponent } from "./tasks.component";
import { SharedModule } from "../shared/shared.Module";
import { ReactiveFormsModule } from "@angular/forms";
import { TagComponent } from "./task.tag/tag.component";
import { TaskCommentComponent } from "./task-comment/task-comment.component";
import { TaskCommentListComponent } from "./task-comment-list/task-comment-list.component";


@NgModule({
    declarations:[TasksComponent,TagComponent,TaskCommentComponent,TaskCommentListComponent],
    exports:[TasksComponent,TagComponent,TaskCommentComponent,TaskCommentListComponent],
    imports:[SharedModule,ReactiveFormsModule]
  })
export class taskModule{

}
