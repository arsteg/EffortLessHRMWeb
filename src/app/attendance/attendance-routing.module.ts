import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from '../home/home.component';
import { AuthGuard } from '../auth.guard';
import { AttendanceManagementComponent } from './attendance-management/attendance-management.component';
import { AttendanceManagementSettingsComponent } from './attendance-settings/attendance-management-settings.component';
import { GeneralSettingsComponent } from './attendance/generalSettings/generalSettings.component';
import { AttendanceTemplateComponent } from './attendance/attendance-template/attendance-template.component';
import { AttendanceTemplateAssignmentComponent } from './attendance/attendance-template-assignment/attendance-template-assignment.component';
import { OnDutyTemplatesComponent } from './attendance/on-duty-templates/on-duty-templates.component';
import { OnDutyTemplateAssignmentComponent } from './attendance/on-duty-template-assignment/on-duty-template-assignment.component';
import { ShiftComponent } from './attendance/shift/shift.component';
import { ShiftAssignmentsComponent } from './attendance/shift-assignments/shift-assignments.component';
import { AttendanceRecordsComponent } from './attendance-records/attendance-records.component';
import { RosterRecordsComponent } from './roster-records/roster-records.component';
import { OvertimeRecordsComponent } from './overtime-records/overtime-records.component';
import { OnDutyRecordsComponent } from './on-duty-records/on-duty-records.component';
import { MyAttendanceRecordsComponent } from './attendance-records/my-attendance-records/my-attendance-records.component';

const routes: Routes = [
  {
    path: '', component: HomeComponent, canActivate: [AuthGuard],
    children: [
      {
        path: 'attendance', component: AttendanceManagementComponent, canActivate: [AuthGuard],
        children: [
          {
            path: '',
            redirectTo: (localStorage.getItem('adminView') === 'user') ? 'my-attendance-records' : 'settings',
            pathMatch: 'full'
          },
          { path: 'my-attendance-records', component: MyAttendanceRecordsComponent },
          { path: 'my-roster-records', component: RosterRecordsComponent },
          { path: 'my-on-duty-request', component: OnDutyRecordsComponent },
          { path: 'my-overtime-records', component: OvertimeRecordsComponent },

          {
            path: 'settings', component: AttendanceManagementSettingsComponent,
            children: [
              { path: '', redirectTo: 'general-settings', pathMatch: 'full' },
              { path: 'general-settings', component: GeneralSettingsComponent },
              { path: 'attendance-templates', component: AttendanceTemplateComponent },
              { path: 'attendance-template-assignment', component: AttendanceTemplateAssignmentComponent },
              { path: 'overtime-records', component: OvertimeRecordsComponent },
              { path: 'on-duty-template', component: OnDutyTemplatesComponent },
              { path: 'on-duty-template-assignment', component: OnDutyTemplateAssignmentComponent },
              { path: 'shift', component: ShiftComponent },
              { path: 'shift-assignment', component: ShiftAssignmentsComponent },
            ]
          },
          { path: 'attendance-records', component: AttendanceRecordsComponent },
          { path: 'roster-records', component: RosterRecordsComponent },
          { path: 'overtime-records', component: OvertimeRecordsComponent },
          { path: 'on-duty-request', component: OnDutyRecordsComponent },
          { path: 'attendance-audit', component: OnDutyRecordsComponent },
          { path: 'attendance-process', component: OnDutyRecordsComponent },
          { path: 'reconcilation', component: OnDutyRecordsComponent },
        ]
      },

    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AttendanceRoutingModule { }
