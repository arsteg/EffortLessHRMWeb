import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SubscriptionRoutingModule } from './subscription-routing.module';
import { CommonComponentsModule } from 'src/app/common/commonComponents.module';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    SubscriptionRoutingModule,
    CommonComponentsModule
  ]
})
export class SubscriptionModule { }
