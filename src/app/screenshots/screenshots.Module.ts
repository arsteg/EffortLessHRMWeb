import { NgModule } from "@angular/core";

import { SharedModule } from "../shared/shared.Module";
import { ScreenshotsComponent } from "./screenshots/screenshots.component";

@NgModule({
    // declarations:[ScreenshotsComponent],
    // exports:[ScreenshotsComponent],
    imports:[SharedModule]
  })
export class ScreenshotsModule{

}
