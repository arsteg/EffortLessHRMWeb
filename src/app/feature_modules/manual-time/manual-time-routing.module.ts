import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RequestManualTimeComponent } from './request-manual-time/request-manual-time.component';
import { AddManualTimeComponent } from './addManualTime/add-manual-time.component';

const routes: Routes = [
  {path: '', component: RequestManualTimeComponent},
  {path: 'add', component: AddManualTimeComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ManualTimeRoutingModule { }
