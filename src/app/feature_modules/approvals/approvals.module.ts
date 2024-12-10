import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA, NgModule } from "@angular/core";
import { SharedModule } from "src/app/shared/shared.Module";
import { RouterModule } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule, MatRippleModule } from '@angular/material/core';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { FormsModule } from '@angular/forms';
import { productivityAppsApprovalComponent } from './productivityAppsApproval/productivityAppsApproval.component';
import { ApprovalsComponent } from './approvals.component';
import { RequestApprovalComponent } from "../manual-time/requestApproval/requestApproval.component";
import { ApprovalsRoutingModule } from './approvals-routing.module';
import { CommonComponentsModule } from "src/app/common/commonComponents.module";

@NgModule({
    declarations:[productivityAppsApprovalComponent, ApprovalsComponent, RequestApprovalComponent],
    imports:[
      CommonComponentsModule,
      ApprovalsRoutingModule
    ],
    schemas: [
      CUSTOM_ELEMENTS_SCHEMA,
      NO_ERRORS_SCHEMA
    ]
  })
export class ApprovalsModule{
}
