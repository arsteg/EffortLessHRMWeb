import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LeaveComponent } from './leave/leave.component';
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
    path: '', component: LeaveComponent, canActivate: [AuthGuard],
    children: [
      {
        path: '',
        redirectTo: (localStorage.getItem('adminView') === 'user') ? 'my-application' : 'settings',
        pathMatch: 'full'
      },
      { path: 'my-application', component: LeaveApplicationComponent },
      { path: 'my-leave-balance', component: LeaveBalanceComponent },
      { path: 'my-team-balance', component: LeaveBalanceComponent },
      { path: 'my-leave-grant', component: LeaveManagementComponent },
      { path: 'my-short-leave', component: ShortLeaveComponent },
      { path: 'team-application', component: LeaveApplicationComponent },
      { path: 'team-short-leave', component: ShortLeaveComponent },
      { path: 'team-leave-grant', component: LeaveManagementComponent },
      { path: 'general-information', component: GeneralComponent },
      {
        path: 'settings', component: LeaveSettingComponent, canActivate: [AuthGuard],
        children: [
          { path: '', redirectTo: 'general-setting', pathMatch: 'full' },
          { path: 'general-setting', component: GeneralSettingsComponent },
          { path: 'leave-category', component: LeaveCategoryComponent },
          { path: 'leave-template', component: LeaveTemplateComponent },
          { path: 'leave-assignment', component: LeaveAssignmentComponent },
        ],
      },
      { path: 'leave-grant', component: LeaveManagementComponent },
      { path: 'leave-balance', component: LeaveBalanceComponent },
      { path: 'leave-application', component: LeaveApplicationComponent },
      { path: 'short-leave', component: ShortLeaveComponent }

    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LeaveRoutingModule { }
