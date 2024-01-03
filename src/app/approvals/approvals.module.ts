import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA, NgModule } from "@angular/core";
import { SharedModule } from "../shared/shared.Module";
import { RouterModule } from '@angular/router';
import { MatFormFieldModule as MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule as MatButtonModule } from '@angular/material/button';
import { MatInputModule as MatInputModule } from '@angular/material/input';
import { MatNativeDateModule, MatRippleModule } from '@angular/material/core';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { FormsModule } from '@angular/forms';
import { productivityAppsApprovalComponent } from './productivityAppsApproval/productivityAppsApproval.component';
import { ApprovalsComponent } from './approvals.component';
import { RequestApprovalComponent } from "../manualTime/requestApproval/requestApproval.component";

@NgModule({
    declarations:[productivityAppsApprovalComponent, ApprovalsComponent, RequestApprovalComponent],
    exports:[productivityAppsApprovalComponent, RequestApprovalComponent],
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
export class ApprovalsModule{
}
