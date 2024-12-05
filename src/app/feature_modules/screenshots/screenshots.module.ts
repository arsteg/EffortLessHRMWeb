import { CUSTOM_ELEMENTS_SCHEMA, NgModule, NO_ERRORS_SCHEMA } from "@angular/core";

import { SharedModule } from "src/app/shared/shared.Module";
import { ScreenshotsComponent } from "./screenshots/screenshots.component";
import { MatTooltipModule } from "@angular/material/tooltip";
import { CommonModule } from "@angular/common";
import { CommonComponentsModule } from "src/app/common/commonComponents.module";
import { FormsModule } from "@angular/forms";
import { ReactiveFormsModule } from "@angular/forms";
import { ScreenshotsdRoutingModule } from "./screenshots.routing.module";

@NgModule({
  declarations: [ScreenshotsComponent],
  exports: [],
  imports: [
    ScreenshotsdRoutingModule,
    SharedModule,
    MatTooltipModule,
    CommonModule,
    CommonComponentsModule,
    FormsModule,
    ReactiveFormsModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
})
export class ScreenshotsModule {

}
