import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from "../shared/shared.Module";
import { RouterModule } from '@angular/router';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatNativeDateModule, MatRippleModule } from '@angular/material/core';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { FormsModule } from '@angular/forms';
import { LeaveApplicationComponent } from './leave-application/leave-application.component';
import { LeaveSettingComponent } from './leave-setting/leave-setting.component';
import { LeaveAssignmentComponent } from './leave-assignment/leave-assignment.component';
import { LeaveCategoryComponent } from './leave-category/leave-category.component';
import { LeaveTemplateComponent } from './leave-template/leave-template.component';
import { LeaveManagementComponent } from './leave-management/leave-management.component';
import { LeaveComponent } from './leave/leave.component';



@NgModule({
  declarations: [LeaveApplicationComponent,
    LeaveSettingComponent,
    LeaveAssignmentComponent,
    LeaveCategoryComponent,
    LeaveTemplateComponent,
    LeaveManagementComponent,
    LeaveComponent],
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
  ],
  exports: [LeaveApplicationComponent,
    LeaveSettingComponent,
    LeaveAssignmentComponent,
    LeaveCategoryComponent]
})
export class LeaveModule { }
