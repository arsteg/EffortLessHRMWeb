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
import { RosterRecordsComponent } from './roster-records/roster-records.component';
import { UploadRosterRecordComponent } from './roster-records/upload-roster-record/upload-roster-record.component';
import { OvertimeRecordsComponent } from './overtime-records/overtime-records.component';
import { DateRangeComponent } from './date-range/date-range.component';
import { RegularizationsRecordsComponent } from './regularizations-records/regularizations-records.component';
import { PendingComponent } from './regularizations-records/pending/pending.component';
import { ApprovedComponent } from './regularizations-records/approved/approved.component';
import { CancelComponent } from './regularizations-records/cancel/cancel.component';
import { RejectedComponent } from './regularizations-records/rejected/rejected.component';
import { UpdateRecordComponent } from './regularizations-records/update-record/update-record.component';
import { ViewRecordComponent } from './regularizations-records/view-record/view-record.component';
import { ShowRecordComponent } from './regularizations-records/show-record/show-record.component';
import { AddRecordComponent } from './regularizations-records/add-record/add-record.component';

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
    EmployeeAttendanceHistoryComponent,
    RosterRecordsComponent,
    UploadRosterRecordComponent,
    OvertimeRecordsComponent,
    DateRangeComponent,
    RegularizationsRecordsComponent,
    PendingComponent,
    ApprovedComponent,
    CancelComponent,
    RejectedComponent,
    UpdateRecordComponent,
    ViewRecordComponent,
    ShowRecordComponent,
    AddRecordComponent
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
