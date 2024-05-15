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
// import { AgmCoreModule } from '@agm/core';

@NgModule({
  declarations: [
    AttendanceManagementComponent,
    AttendanceComponent,
    GeneralSettingsComponent,
    AttendanceRegularizationComponent,
    AttendanceTemplateComponent,
    GeneralTemplateSettingsComponent,
    LocationComponent
  ],
  imports: [
    MatRadioModule,
    MatCheckboxModule,
    CommonModule,
    CommonComponentsModule,
    SharedModule,
    // AgmCoreModule.forRoot({
    //   apiKey: 'YOUR GOOGLE API KEY HERE'
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
