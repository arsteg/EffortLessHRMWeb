import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertsComponent } from './alerts.component';
import { NotificationTypeComponent } from "./notification-type/notification-type.component";
import { EventNotificationComponent } from './event-notification/event-notification.component';


@NgModule({
    declarations: [AlertsComponent],
    imports: [
        CommonModule,
        NotificationTypeComponent,
        EventNotificationComponent
    ]
})
export class AlertsModule { }
