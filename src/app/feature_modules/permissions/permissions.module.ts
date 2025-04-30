import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PermissionsRoutingModule } from './permissions-routing.module';
import { CommonComponentsModule } from 'src/app/common/commonComponents.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { UserRoleDialogComponent } from './user-role-dialog/user-role-dialog.component';
import { PermissionDialogComponent } from './permission-dialog/permission-dialog.component';
import { RoleDialogComponent } from './role-dialog/role-dialog.component';
import { RolePermissionDialogComponent } from './role-permission-dialog/role-permission-dialog.component';
import { MatDialogContent, MatDialogModule } from '@angular/material/dialog';
import { MatError, MatFormField } from '@angular/material/form-field';
import { MatLabel } from '@angular/material/form-field';
import { MatOption } from '@angular/material/core';





@NgModule({
  declarations: [    
    UserRoleDialogComponent,
    PermissionDialogComponent,
    RoleDialogComponent,
    RolePermissionDialogComponent
  ],
  imports: [
    CommonModule,
    CommonComponentsModule,
    FormsModule,
    ReactiveFormsModule,
    PermissionsRoutingModule,
    TranslateModule,
    MatDialogModule,
    MatFormField,
    MatLabel,
    MatOption,
    MatError,
    MatDialogContent
  ],
 
})
export class PermissionsModule { }
