import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { InterviewProcessRoutingModule } from './interview-process-routing.module';
import { CommonComponentsModule } from 'src/app/common/commonComponents.module';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    CommonComponentsModule,
    InterviewProcessRoutingModule
  ]
})
export class InterviewProcessModule { }
