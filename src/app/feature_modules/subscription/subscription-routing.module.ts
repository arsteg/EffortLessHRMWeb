import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PlansComponent } from './plans/plans.component';
import { SubscriptionsComponent } from './subscriptions/subscriptions.component';

const routes: Routes = [
  {path: '', component: SubscriptionsComponent},
  {path: 'plans', component: PlansComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SubscriptionRoutingModule { }
