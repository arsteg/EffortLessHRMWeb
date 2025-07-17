import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertsComponent } from './alerts.component';
import { NotificationTypeComponent } from "./notification-type/notification-type.component";
import { EventNotificationComponent } from './event-notification/event-notification.component';
import { EventNotificationViewerComponent } from './event-notification-viewer/event-notification-viewer.component';
import { AlertsRoutingModule } from './alerts-routing.module';
import { MatTabsModule } from '@angular/material/tabs';
import { TranslateModule } from '@ngx-translate/core';
import { MatError, MatFormField } from '@angular/material/form-field';
import { MatLabel } from '@angular/material/form-field';
import { MatOption } from '@angular/material/core';
import { SharedModule } from 'src/app/shared/shared.Module';
import { CommonComponentsModule } from "src/app/common/commonComponents.module";

@NgModule({
    declarations: [AlertsComponent, 
        NotificationTypeComponent,
        EventNotificationViewerComponent
    ],
    imports: [
        CommonModule,
        AlertsRoutingModule,
        EventNotificationComponent,
        MatTabsModule,
        TranslateModule,
        MatFormField,
        MatLabel,
        MatOption,
        MatError,
        SharedModule,
        CommonComponentsModule
    ],
})
export class AlertsModule { }
