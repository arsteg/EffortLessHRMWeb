import { Component, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OrganizationComponent } from './organization/organization.component';
import { AuthGuard } from 'src/app/auth.guard';
import { SetupComponent } from './setup/setup.component';
import { ZoneComponent } from './setup/zone/zone.component';
import { LocationComponent } from './setup/location/location.component';
import { DepartmentComponent } from './setup/department/department.component';
import { SubDepartmentComponent } from './setup/sub-department/sub-department.component';
import { DesignationComponent } from './setup/designation/designation.component';
import { BandComponent } from './setup/band/band.component';
import { SignatoryDetailsComponent } from './setup/signatory-details/signatory-details.component';
import { HolidaysComponent } from './setup/holidays/holidays.component';
import { DocumentManagerComponent } from 'src/app/feature_modules/organization/documentManager/documentManager.component';
import { ProfileComponent } from './setup/profile/profile.component';
import { AssetManagerComponent } from 'src/app/feature_modules/organization/AssetsManagement/assetAssetManager/asset.component';

const routes: Routes = [
  {
    path: '', component: OrganizationComponent, canActivate: [AuthGuard],
    children: [
      {
        path: '',
        redirectTo: (localStorage.getItem('adminView') === 'user') ? 'company-policies' : 'organization-setup',
        pathMatch: 'full'
      },
      { path: 'company-policies', component: AssetManagerComponent },
      { path: 'organization-tree', component: AssetManagerComponent },
      { path: 'employee-tree', component: AssetManagerComponent },
      { path: 'assets', component: AssetManagerComponent },

      {
        path: 'organization-setup', component: SetupComponent, canActivate: [AuthGuard],
        children: [
          { path: '', redirectTo: 'organization-profile', pathMatch: 'full' },
          { path: 'organization-profile', component: ProfileComponent },
          { path: 'zone', component: ZoneComponent },
          { path: 'location', component: LocationComponent },
          { path: 'department', component: DepartmentComponent },
          { path: 'sub-department', component: SubDepartmentComponent },
          { path: 'designation', component: DesignationComponent },
          { path: 'band', component: BandComponent },
          { path: 'signatory-details', component: SignatoryDetailsComponent },
          { path: 'holiday', component: HolidaysComponent },
        ]
      },
      { path: 'employee-field', component: AssetManagerComponent },
      { path: 'employee-tree', component: AssetManagerComponent },
      { path: 'documents', component: DocumentManagerComponent },
      { path: 'assets', component: AssetManagerComponent },
    ]
  },
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OrganizationRoutingModule { }
