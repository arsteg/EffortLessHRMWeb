import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SeparationComponent } from './separation.component';
import { SeparationRoutingModule } from './separation-routing.module';



@NgModule({
  declarations: [
    SeparationComponent
  ],
  imports: [
    CommonModule,
    SeparationRoutingModule
  ]
})
export class SeparationModule { }
