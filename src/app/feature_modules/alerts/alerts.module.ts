import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertsComponent } from './alerts.component';
import { NotificationTypeComponent } from "./notification-type/notification-type.component";
import { EventNotificationComponent } from './event-notification/event-notification.component';
import { EventNotificationViewerComponent } from './event-notification-viewer/event-notification-viewer.component';
import { AlertsRoutingModule } from './alerts-routing.module';

@NgModule({
    declarations: [AlertsComponent, 
        
    ],
    imports: [
        CommonModule,
        AlertsRoutingModule,
        NotificationTypeComponent,
        EventNotificationComponent,
        EventNotificationViewerComponent
    ]
})
export class AlertsModule { }
