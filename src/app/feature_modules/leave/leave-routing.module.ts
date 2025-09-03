import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LeaveComponent } from './leave.component';
import { AuthGuard } from 'src/app/auth.guard';
import { LeaveSettingComponent } from './leave-setting/leave-setting.component';
import { GeneralSettingsComponent } from './leave-setting/general-settings/general-settings.component';
import { LeaveCategoryComponent } from './leave-setting/leave-category/leave-category.component';
import { LeaveTemplateComponent } from './leave-setting/leave-template/leave-template.component';
import { LeaveAssignmentComponent } from './leave-setting/leave-assignment/leave-assignment.component';
import { LeaveManagementComponent } from './leave-grant/leave-grant.component';
import { LeaveBalanceComponent } from './leave-balance/leave-balance.component';
import { ShortLeaveComponent } from './short-leave/short-leave.component';
import { LeaveApplicationComponent } from './leave-application/leave-application.component';
import { GeneralComponent } from './general-information/general/general.component';

const routes: Routes = [
  {
    path: '', component: LeaveComponent,
    children: [
      {
        path: '',
        redirectTo: (localStorage.getItem('adminView') === 'user') ? 'my-application' : 'settings',
        pathMatch: 'full'
      },
      { path: 'my-application', component: LeaveApplicationComponent, canActivate: [AuthGuard], data: { permission: 'Leave' } },
      { path: 'my-leave-balance', component: LeaveBalanceComponent, canActivate: [AuthGuard], data: { permission: 'Leave' } },
      { path: 'my-team-balance', component: LeaveBalanceComponent, canActivate: [AuthGuard], data: { permission: 'Leave' } },
      { path: 'my-leave-grant', component: LeaveManagementComponent, canActivate: [AuthGuard], data: { permission: 'Leave' } },
      { path: 'my-short-leave', component: ShortLeaveComponent, canActivate: [AuthGuard], data: { permission: 'Leave' } },
      { path: 'team-application', component: LeaveApplicationComponent, canActivate: [AuthGuard], data: { permission: 'Leave' } },
      { path: 'team-short-leave', component: ShortLeaveComponent, canActivate: [AuthGuard], data: { permission: 'Leave' } },
      { path: 'team-leave-grant', component: LeaveManagementComponent, canActivate: [AuthGuard], data: { permission: 'Leave' } },
      { path: 'general-information', component: GeneralComponent, canActivate: [AuthGuard], data: { permission: 'Leave' } },
      {
        path: 'settings', component: LeaveSettingComponent, canActivate: [AuthGuard],
        data: { permission: 'Leave Settings' },
        children: [
          { path: '', redirectTo: 'leave-category', pathMatch: 'full' },
          // it may require in future
          // { path: 'general-setting', component: GeneralSettingsComponent },
          { path: 'leave-category', component: LeaveCategoryComponent },
          { path: 'leave-template', component: LeaveTemplateComponent },
          { path: 'leave-assignment', component: LeaveAssignmentComponent },
        ],
      },
      { path: 'leave-grant', component: LeaveManagementComponent, canActivate: [AuthGuard], data: { permission: 'Leave' } },
      { path: 'leave-balance', component: LeaveBalanceComponent, canActivate: [AuthGuard], data: { permission: 'Leave' } },
      { path: 'leave-application', component: LeaveApplicationComponent, canActivate: [AuthGuard], data: { permission: 'Leave' } },
      { path: 'short-leave', component: ShortLeaveComponent, canActivate: [AuthGuard], data: { permission: 'Leave' } }

    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LeaveRoutingModule { }
