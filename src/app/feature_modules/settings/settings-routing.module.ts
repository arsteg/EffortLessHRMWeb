import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SettingsComponent } from './settings.component';
import { UserPreferencesComponent } from './userPreferences/userPreferences.Component';

const routes: Routes = [
    {path: '', component: SettingsComponent},
    {path: 'user-preferences', component: UserPreferencesComponent}
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class SettingsRoutingModule { }
