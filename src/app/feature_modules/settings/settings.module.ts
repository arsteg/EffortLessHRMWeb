import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA, NgModule } from "@angular/core";
import { UserPreferencesComponent } from "./userPreferences/userPreferences.Component";
import { CommonModule } from "@angular/common";
import { CommonComponentsModule } from "src/app/common/commonComponents.module";
import { MatTabsModule } from "@angular/material/tabs";
import { MatToolbarModule } from "@angular/material/toolbar";
import { GenericSettingsComponent } from "./generic-settings/generic-settings.component";
import { ProfileSettingsComponent } from "./profile-settings/profile-settings.component";
import { AppWebsiteSettingsComponent } from "./app-website-settings/app-website-settings.component";
import { SettingsComponent } from "./settings.component";
import { RouterModule } from "@angular/router";
import { SettingsRoutingModule } from "./settings-routing.module";


@NgModule({
  declarations: [UserPreferencesComponent, GenericSettingsComponent, ProfileSettingsComponent,
    AppWebsiteSettingsComponent, UserPreferencesComponent, SettingsComponent
  ],
  exports: [UserPreferencesComponent],
  imports: [
    CommonModule,
    MatToolbarModule,
    MatToolbarModule,
    CommonComponentsModule,
    MatTabsModule,
    RouterModule,
    SettingsRoutingModule
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA,
    NO_ERRORS_SCHEMA
  ]
})
export class SettingsModule {

}
