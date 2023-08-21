import { NgModule } from "@angular/core";
import { SharedModule } from "../shared/shared.Module";
import { UserPreferencesComponent } from "./userPreferences/userPreferences.Component";


@NgModule({
    declarations:[UserPreferencesComponent],
    exports:[UserPreferencesComponent],
    imports:[SharedModule]
  })
export class SettingsModule{

}
