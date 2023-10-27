import { NgModule,CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommonComponentsModule } from '../common/commonComponents.module';
import { SharedModule } from '../shared/shared.Module';
import { AttendanceManagementComponent } from './attendance-management/attendance-management.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { AttendanceComponent } from './attendance/attendance.component';
import { GeneralSettingsComponent } from './attendance/settings/generalSettings/generalSettings.component';
import { AttendanceSettingsComponent } from './attendance/settings/attendanceSettings.component';

@NgModule({
  declarations: [AttendanceManagementComponent, AttendanceComponent,GeneralSettingsComponent,AttendanceSettingsComponent ],
  imports: [ MatRadioModule,
    MatCheckboxModule, CommonModule, CommonComponentsModule, SharedModule ],
  exports: [AttendanceManagementComponent, AttendanceComponent,GeneralSettingsComponent,AttendanceSettingsComponent],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA,
    NO_ERRORS_SCHEMA
  ]
})
export class AttendanceModule { }
