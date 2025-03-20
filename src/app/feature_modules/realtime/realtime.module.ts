import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RealtimeRoutingModule } from './realtime.routing.module';
import { CommonComponentsModule } from 'src/app/common/commonComponents.module';
import { RealtimeComponent } from './realtime.component';
import { LiveScreenComponent } from './live-screen/live-screen.component';
import { DragDropModule } from '@angular/cdk/drag-drop';

@NgModule({
  declarations: [RealtimeComponent, LiveScreenComponent],
  imports: [
    CommonModule,
    RealtimeRoutingModule,
    CommonComponentsModule,
    DragDropModule
  ]
})
export class RealtimeModule { }
