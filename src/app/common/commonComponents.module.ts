import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA, NgModule } from "@angular/core";
import { SharedModule } from "../shared/shared.Module";
import { RouterModule } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule, MatRippleModule } from '@angular/material/core';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { FormsModule } from '@angular/forms';
import { SubordinateSelectionComponent } from "./subordinateSelection/subordinateSelection.component";
import { CRUDComponent } from './crud/crud.component';
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { MatIconModule } from "@angular/material/icon";
import { MatTooltip, MatTooltipModule } from "@angular/material/tooltip";
import { MatSelectModule } from "@angular/material/select";
import { MatDialogModule } from "@angular/material/dialog";

@NgModule({
    declarations:[SubordinateSelectionComponent, CRUDComponent],
    exports:[SubordinateSelectionComponent, CRUDComponent],
    imports:[
      SharedModule,
      RouterModule,
      MatFormFieldModule,
      MatDatepickerModule,
      MatButtonModule,
      MatInputModule,
      MatRippleModule,
      MatNativeDateModule,
      MatRippleModule,
      NgxChartsModule,
      FormsModule,
      BrowserAnimationsModule,
      MatIconModule,
      MatTooltipModule,
      MatSelectModule,
      MatDialogModule
    ],
    schemas: [
      CUSTOM_ELEMENTS_SCHEMA,
      NO_ERRORS_SCHEMA
    ]
  })
export class CommonComponentsModule{
}

