import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RolePermissionRoutingModule } from './role-permission-routing.module';
import { SharedModule } from 'src/app/shared/shared.Module';


@NgModule({
  declarations: [
  ],
  imports: [
    CommonModule,
    SharedModule,
    RolePermissionRoutingModule
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA,
    NO_ERRORS_SCHEMA
  ]
})
export class RolePermissionModule { }
