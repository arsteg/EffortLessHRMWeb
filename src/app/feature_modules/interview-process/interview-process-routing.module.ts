import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InterviewProcessMainComponent } from './interview-process-main/interview-process-main.component';

const routes: Routes = [
  {path: '', component: InterviewProcessMainComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InterviewProcessRoutingModule { }
