import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA, NgModule } from "@angular/core";
import { SharedModule } from "../shared/shared.Module";
import { RouterModule } from '@angular/router';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule, MatRippleModule } from '@angular/material/core';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { SubordinateSelectionComponent } from "./subordinateSelection/subordinateSelection.component";
import { CRUDComponent } from './crud/crud.component';
import { MatIconModule } from "@angular/material/icon";
import { MatTooltipModule } from "@angular/material/tooltip";

@NgModule({
    declarations:[SubordinateSelectionComponent, CRUDComponent],
    exports:[SubordinateSelectionComponent, CRUDComponent,
      MatDatepickerModule,
      MatButtonModule,
      MatInputModule,
      MatRippleModule,
      MatNativeDateModule,
      MatRippleModule,
      NgxChartsModule,
      MatIconModule,
      MatTooltipModule,
      SharedModule,
    ],
    imports:[
      SharedModule,
      RouterModule,
      MatDatepickerModule,
      MatButtonModule,
      MatInputModule,
      MatRippleModule,
      MatNativeDateModule,
      MatRippleModule,
      NgxChartsModule,
      MatIconModule,
      MatTooltipModule,
    ],
    schemas: [
      CUSTOM_ELEMENTS_SCHEMA,
      NO_ERRORS_SCHEMA
    ]
  })
export class CommonComponentsModule{
}

