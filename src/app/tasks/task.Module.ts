import { NgModule } from "@angular/core";
import { TasksComponent } from "./tasks.component";
import { SharedModule } from "../shared/shared.Module";

@NgModule({
    declarations:[TasksComponent],
    exports:[TasksComponent],
    imports:[SharedModule]
  })
export class taskModule{

}
