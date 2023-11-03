import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA, NgModule } from "@angular/core";
import { SharedModule } from "../shared/shared.Module";
import { UserPreferencesComponent } from "./userPreferences/userPreferences.Component";


@NgModule({
    declarations:[UserPreferencesComponent],
    exports:[UserPreferencesComponent],
    imports:[SharedModule],
    schemas: [
      CUSTOM_ELEMENTS_SCHEMA,
      NO_ERRORS_SCHEMA
    ]
  })
export class SettingsModule{

}
