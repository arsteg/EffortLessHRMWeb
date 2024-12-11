import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PermissionsRoutingModule } from './permissions-routing.module';
import { CommonComponentsModule } from 'src/app/common/commonComponents.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    // CommonComponentsModule,
    FormsModule,
    ReactiveFormsModule,
    PermissionsRoutingModule
  ]
})
export class PermissionsModule { }
