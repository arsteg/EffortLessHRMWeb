import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EmployeeSettingsComponent } from './employee-settings.component';
import { AuthGuard } from 'src/app/auth.guard';
import { EmployeeProfileComponent } from './employee-profile/employee-profile.component';
import { EmploymentDetailsComponent } from './employment-details/employment-details.component';
import { SalaryDetailsComponent } from './salary-details/salary-details.component';
import { StatutoryDetailsComponent } from './statutory-details/statutory-details.component';
import { UserLoansAdvancesComponent } from './loans-advances/loans-advances.component';

const routes: Routes = [
  {
    path: '',
    component: EmployeeSettingsComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'employee-profile', pathMatch: 'full' },
      { path: 'employee-profile', component: EmployeeProfileComponent },
      { path: 'employment-details', component: EmploymentDetailsComponent },
      { path: 'salary-details', component: SalaryDetailsComponent },
      { path: 'statutory-details', component: StatutoryDetailsComponent },
      { path: 'loans-advances', component: UserLoansAdvancesComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EmployeeSettingsRoutingModule { }
