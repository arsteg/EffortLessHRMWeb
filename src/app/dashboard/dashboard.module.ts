import { UserDashboardComponent } from './user-dashboard/user-dashboard.component';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA, NgModule } from "@angular/core";
import { SharedModule } from "../shared/shared.Module";
import { DashboardComponent } from './dashboard.component';
import { RouterModule } from '@angular/router';
import { MatFormFieldModule as MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule  } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule, MatRippleModule } from '@angular/material/core';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { FormsModule } from '@angular/forms';

@NgModule({
    declarations:[UserDashboardComponent,DashboardComponent],
    exports:[UserDashboardComponent,DashboardComponent],
    imports:[SharedModule,
      RouterModule,
      MatFormFieldModule,
      MatDatepickerModule,
      MatButtonModule,
      MatInputModule,
      MatRippleModule,
      MatNativeDateModule,
      MatRippleModule,
      NgxChartsModule,
      FormsModule
    ],
    schemas: [
      CUSTOM_ELEMENTS_SCHEMA,
      NO_ERRORS_SCHEMA
    ]
  })
export class DashboardModule{
}

