import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA, NgModule } from "@angular/core";
import { SharedModule } from "../shared/shared.Module";
import { UserPreferencesComponent } from "./userPreferences/userPreferences.Component";
import { CommonModule } from "@angular/common";
import { CommonComponentsModule } from "../common/commonComponents.module";
import { MatTabsModule } from "@angular/material/tabs";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatToolbarModule } from "@angular/material/toolbar";
import { GenericSettingsComponent } from "./generic-settings/generic-settings.component";
import { ProfileSettingsComponent } from "./profile-settings/profile-settings.component";
import { AppWebsiteSettingsComponent } from "./app-website-settings/app-website-settings.component";
import { SettingsComponent } from "./settings.component";
import { BrowserModule } from "@angular/platform-browser";
import { RouterModule } from "@angular/router";


@NgModule({
  declarations: [UserPreferencesComponent, GenericSettingsComponent, ProfileSettingsComponent,
    AppWebsiteSettingsComponent, UserPreferencesComponent, SettingsComponent
  ],
  exports: [UserPreferencesComponent],
  imports: [
    SharedModule,
    CommonModule,
    MatToolbarModule,
    MatToolbarModule,
    CommonComponentsModule,
    MatTabsModule,
    FormsModule,
    BrowserModule,
    RouterModule,
    ReactiveFormsModule
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA,
    NO_ERRORS_SCHEMA
  ]
})
export class SettingsModule {

}
