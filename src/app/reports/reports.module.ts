import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserHistoryModule } from '../browserHistory/browserHistory.module';
import { BrowserHistoryComponent } from '../browserHistory/browserHistory.component';



@NgModule({
  declarations: [],
  imports: [
    CommonModule, BrowserHistoryModule
  ],
  exports: [BrowserHistoryComponent]
})
export class ReportsModule { }
