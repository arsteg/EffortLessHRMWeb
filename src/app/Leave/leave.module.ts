import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from "../shared/shared.Module";
import { RouterModule } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule, MatRippleModule } from '@angular/material/core';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { FormsModule } from '@angular/forms';
import { LeaveApplicationComponent } from './leave-application/leave-application.component';
import { LeaveSettingComponent } from './leave-setting/leave-setting.component';
import { LeaveAssignmentComponent } from './leave-setting/leave-assignment/leave-assignment.component';
import { LeaveCategoryComponent } from './leave-setting/leave-category/leave-category.component';
import { LeaveTemplateComponent } from './leave-setting/leave-template/leave-template.component';
import { LeaveManagementComponent } from './leave-management/leave-management.component';
import { LeaveComponent } from './leave/leave.component';
import { GeneralSettingsComponent } from './leave-setting/general-settings/general-settings.component';
import { CommonComponentsModule } from '../common/commonComponents.module';

@NgModule({
  declarations: [LeaveApplicationComponent,
    LeaveSettingComponent,
    LeaveAssignmentComponent,
    LeaveCategoryComponent,
    LeaveTemplateComponent,
    LeaveManagementComponent,
    LeaveComponent,
    GeneralSettingsComponent],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatButtonModule,
    MatInputModule,
    MatRippleModule,
    MatNativeDateModule,
    MatRippleModule,
    NgxChartsModule,
    FormsModule,
    CommonComponentsModule
  ],
  exports: [LeaveApplicationComponent,
    LeaveSettingComponent,
    LeaveAssignmentComponent,
    LeaveCategoryComponent]
})
export class LeaveModule { }
