import { NgModule } from "@angular/core";
import { TasksComponent } from "./tasks.component";
import { SharedModule } from "../shared/shared.Module";
import { ReactiveFormsModule } from "@angular/forms";
import { TagComponent } from "./task.tag/tag.component";

@NgModule({
    declarations:[TasksComponent,TagComponent],
    exports:[TasksComponent,TagComponent],
    imports:[SharedModule,ReactiveFormsModule]
  })
export class taskModule{

}
