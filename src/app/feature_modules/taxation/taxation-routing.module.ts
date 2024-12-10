import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TaxationComponent } from './taxation.component';
import { UserTaxDeclarationComponent } from './user-tax-declaration/user-tax-declaration.component';

const routes: Routes = [
  {path: '', component:TaxationComponent},
  {path: 'tax-declaration', component: UserTaxDeclarationComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TaxationRoutingModule { }
