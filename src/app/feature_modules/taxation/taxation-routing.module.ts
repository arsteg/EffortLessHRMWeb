import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TaxationComponent } from './taxation.component';
import { UserTaxDeclarationComponent } from './user-tax-declaration/user-tax-declaration.component';
import { AuthGuard } from 'src/app/auth.guard';
import { TaxSectionComponent } from './tax-section/tax-section.component';
import { TaxComponentBySectionComponent } from './tax-component-by-section/tax-component-by-section.component';
import { TaxDeclarationByCompanyComponent } from './tax-declaration-by-company/tax-declaration-by-company.component';

const routes: Routes = [
  {
    path: '', component: TaxationComponent,
    children: [
      {
        path: '',
        redirectTo: (localStorage.getItem('adminView') === 'user') ? 'tax-declaration' : 'sections',
        pathMatch: 'full'
      },
      { path: 'sections', component: TaxSectionComponent, canActivate: [AuthGuard], data: { permission: 'Taxation Settings' } },
      { path: 'components', component: TaxComponentBySectionComponent, canActivate: [AuthGuard], data: { permission: 'Taxation Settings' } },
      { path: 'all-tax-declarations', component: TaxDeclarationByCompanyComponent, canActivate: [AuthGuard], data: { permission: 'Taxation Settings' } },
      { path: 'tax-declaration', component: UserTaxDeclarationComponent, canActivate: [AuthGuard], data: { permission: 'Taxation' } },
    ]
  },
 
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TaxationRoutingModule { }
