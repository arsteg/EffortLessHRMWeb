import { CUSTOM_ELEMENTS_SCHEMA, NgModule, NO_ERRORS_SCHEMA } from "@angular/core";

import { SharedModule } from "../shared/shared.Module";
import { ScreenshotsComponent } from "./screenshots/screenshots.component";
import { MatTooltipModule } from "@angular/material/tooltip";
import { CommonModule } from "@angular/common";
import { CommonComponentsModule } from "../common/commonComponents.module";
import { FormsModule } from "@angular/forms";

@NgModule({
  declarations: [ScreenshotsComponent],
  exports: [],
  imports: [SharedModule,
    MatTooltipModule,
    CommonModule,
    CommonComponentsModule,
    FormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
})
export class ScreenshotsModule {

}
