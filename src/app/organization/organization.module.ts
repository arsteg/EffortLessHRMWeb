import { CUSTOM_ELEMENTS_SCHEMA, NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrganizationComponent } from './organization/organization.component';
import { SharedModule } from '../shared/shared.Module';
import { CommonComponentsModule } from '../common/commonComponents.module';
import { AssetsModule } from '../AssetsManagement/assetManagement.module';
import { AssetManagerComponent } from '../AssetsManagement/assetAssetManager/asset.component';
import { DocumentManagementModule } from '../documentManager/documentManager.module';
import { DocumentManagerComponent } from '../documentManager/documentManager.component';
import { SetupComponent } from './setup/setup.component';
import { EmployeeFieldsComponent } from './employee-fields/employee-fields.component';
import { EmployeeTreeComponent } from './employee-tree/employee-tree.component';
import { ProfileComponent } from './setup/profile/profile.component';
import { ZoneComponent } from './setup/zone/zone.component';
import { LocationComponent } from './setup/location/location.component';
import { DepartmentComponent } from './setup/department/department.component';
import { SubDepartmentComponent } from './setup/sub-department/sub-department.component';
import { DesignationComponent } from './setup/designation/designation.component';
import { BandComponent } from './setup/band/band.component';
import { SignatoryDetailsComponent } from './setup/signatory-details/signatory-details.component';
import { HolidaysComponent } from './setup/holidays/holidays.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToastrModule } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
  declarations: [
    OrganizationComponent,
    SetupComponent,
    EmployeeFieldsComponent,
    EmployeeTreeComponent,
    ProfileComponent,
    ZoneComponent,
    LocationComponent,
    DepartmentComponent,
    SubDepartmentComponent,
    DesignationComponent,
    BandComponent,
    SignatoryDetailsComponent,
    HolidaysComponent
  ],
  exports: [AssetManagerComponent,
    DocumentManagerComponent],
  imports: [
    CommonModule,
    SharedModule,
    CommonComponentsModule,
    AssetsModule,
    DocumentManagementModule,
    FormsModule,
    ReactiveFormsModule,
    ToastrModule.forRoot({
      timeOut: 3000, // Duration of the notification
      positionClass: 'toast-top-right', // Position of the notification
      preventDuplicates: true,
    }),
    BrowserAnimationsModule
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA,
    NO_ERRORS_SCHEMA
  ]
})
export class OragnizationModule { }
