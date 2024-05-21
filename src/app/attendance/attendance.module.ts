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
import { LocationComponent } from './attendance/attendance-template/location/location.component';
import { RouterOutlet } from '@angular/router';
import { GoogleMapsModule } from '@angular/google-maps';
import { AttendanceTemplateAssignmentComponent } from './attendance/attendance-template-assignment/attendance-template-assignment.component';
import { OvertimeComponent } from './attendance/overtime/overtime.component';
import { OnDutyTemplatesComponent } from './attendance/on-duty-templates/on-duty-templates.component';
import { OnDutyTemplateAssignmentComponent } from './attendance/on-duty-template-assignment/on-duty-template-assignment.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    AttendanceManagementComponent,
    AttendanceComponent,
    GeneralSettingsComponent,
    AttendanceRegularizationComponent,
    AttendanceTemplateComponent,
    GeneralTemplateSettingsComponent,
    LocationComponent,
    AttendanceTemplateAssignmentComponent,
    OvertimeComponent,
    OnDutyTemplatesComponent,
    OnDutyTemplateAssignmentComponent
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
    // AgmCoreModule.forRoot({
    //   apiKey: 'AIzaSyDcVHb7z2aA1VGUL5mtDZtplf3EMVMX4q8'
    // })
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
