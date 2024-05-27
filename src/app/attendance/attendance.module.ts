import { NgModule, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommonComponentsModule } from '../common/commonComponents.module';
import { SharedModule } from '../shared/shared.Module';
import { AttendanceManagementComponent } from './attendance-management/attendance-management.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { AttendanceComponent } from './attendance/attendance.component';
import { GeneralSettingsComponent } from './attendance/generalSettings/generalSettings.component';
import { AttendanceRegularizationComponent } from './attendance/attendance-template/attendance-regularization/attendance-regularization.component';
import { AttendanceTemplateComponent } from './attendance/attendance-template/attendance-template.component';
import { GeneralTemplateSettingsComponent } from './attendance/attendance-template/general-template-settings/general-template-settings.component';
import { RouterOutlet } from '@angular/router';
import { GoogleMapsModule } from '@angular/google-maps';
import { AttendanceTemplateAssignmentComponent } from './attendance/attendance-template-assignment/attendance-template-assignment.component';
import { OvertimeComponent } from './attendance/overtime/overtime.component';
import { OnDutyTemplatesComponent } from './attendance/on-duty-templates/on-duty-templates.component';
import { OnDutyTemplateAssignmentComponent } from './attendance/on-duty-template-assignment/on-duty-template-assignment.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ShiftComponent } from './attendance/shift/shift.component';
import { ShiftAssignmentsComponent } from './attendance/shift-assignments/shift-assignments.component';
import { ColorChromeModule } from 'ngx-color/chrome';
import { AttendanceRecordsComponent } from './attendance-records/attendance-records.component';
import { AttendanceManagementSettingsComponent } from './attendance-settings/attendance-management-settings.component';
import { UploadRecordsComponent } from './attendance-records/upload-records/upload-records.component';
import { EmployeeAttendanceHistoryComponent } from './attendance-records/employee-attendance-history/employee-attendance-history.component';

@NgModule({
  declarations: [
    AttendanceComponent,
    GeneralSettingsComponent,
    AttendanceRegularizationComponent,
    AttendanceTemplateComponent,
    GeneralTemplateSettingsComponent,
    AttendanceTemplateAssignmentComponent,
    OvertimeComponent,
    OnDutyTemplatesComponent,
    OnDutyTemplateAssignmentComponent,
    ShiftComponent,
    ShiftAssignmentsComponent,
    AttendanceRecordsComponent,
    AttendanceManagementComponent,
    AttendanceManagementSettingsComponent,
    UploadRecordsComponent,
    EmployeeAttendanceHistoryComponent
  ],
  imports: [
    MatRadioModule,
    MatCheckboxModule,
    CommonModule,
    CommonComponentsModule,
    SharedModule,
    RouterOutlet,
    GoogleMapsModule,
    FormsModule,
    ReactiveFormsModule,
    ColorChromeModule,
  ],
  exports: [
    AttendanceManagementComponent,
    AttendanceComponent,
    GeneralSettingsComponent
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA,
    NO_ERRORS_SCHEMA
  ]
})
export class AttendanceModule { }
