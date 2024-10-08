import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserListComponent } from '../user-list/user-list.component';
import { EmployeeSettingsComponent } from './employee-settings.component';
import { AuthGuard } from 'src/app/auth.guard';
import { EmployeeProfileComponent } from './employee-profile/employee-profile.component';
import { EmploymentDetailsComponent } from './employment-details/employment-details.component';
import { SalaryDetailsComponent } from './salary-details/salary-details.component';
import { StatutoryDetailsComponent } from './statutory-details/statutory-details.component';
import { LoansAdvancesComponent } from 'src/app/Payroll/settings/loans-advances/loans-advances.component';
import { TaxComponent } from './tax/tax.component';
import { ManageComponent } from 'src/app/manage/manage/manage.component';
import { HomeComponent } from 'src/app/home/home.component';
import { UserLoansAdvancesComponent } from './loans-advances/loans-advances.component';


const routes: Routes = [
  {
    path: '', component: HomeComponent, canActivate: [AuthGuard],
    children: [
      {
        path: 'manage', component: ManageComponent, canActivate: [AuthGuard],
        children: [
          {
            path: 'employee-settings', component: EmployeeSettingsComponent, canActivate: [AuthGuard],
            children: [
              { path: '', redirectTo: 'employee-profile', pathMatch: 'full' },
              { path: 'employee-profile', component: EmployeeProfileComponent },
              { path: 'employment-details', component: EmploymentDetailsComponent },
              { path: 'salary-details', component: SalaryDetailsComponent },
              { path: 'statutory-details', component: StatutoryDetailsComponent },
              { path: 'loans-advances', component: UserLoansAdvancesComponent },
              { path: 'tax', component: TaxComponent },
            ]
          }
        ]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EmployeeSettingsRoutingModule { }
