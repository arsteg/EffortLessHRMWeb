import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ManualTimeRoutingModule } from './manual-time-routing.module';
import { AddManualTimeComponent } from './addManualTime/add-manual-time.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RequestManualTimeComponent } from './request-manual-time/request-manual-time.component';
import { SortDirective } from 'src/app/directive/sort.directive';
import { SearchPipe } from 'src/app/shared/search.pipe';
import { CommonComponentsModule } from 'src/app/common/commonComponents.module';


@NgModule({
  declarations: [
    AddManualTimeComponent,
    RequestManualTimeComponent,

  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ManualTimeRoutingModule,
    CommonComponentsModule
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA,
    NO_ERRORS_SCHEMA
  ],
  providers: [SearchPipe, SortDirective]
})
export class ManualTimeModule { }
