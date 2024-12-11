import { CUSTOM_ELEMENTS_SCHEMA, NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrganizationComponent } from './organization/organization.component';
import { CommonComponentsModule } from 'src/app/common/commonComponents.module';
import { DocumentManagementModule } from 'src/app/feature_modules/organization/documentManager/documentManager.module';
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
import { OrganizationRoutingModule } from './organization-routing.module';
import { AssetsModule } from 'src/app/feature_modules/organization/AssetsManagement/assetManagement.module';

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
  imports: [
    CommonModule,
    CommonComponentsModule,
    AssetsModule,
    DocumentManagementModule,
    FormsModule,
    ReactiveFormsModule,
    ToastrModule.forRoot({
      timeOut: 3000,
      positionClass: 'toast-top-right',
      preventDuplicates: true,
    }),
    AssetsModule,
    DocumentManagementModule,
    OrganizationRoutingModule
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA,
    NO_ERRORS_SCHEMA
  ]
})
export class OragnizationModule { }
