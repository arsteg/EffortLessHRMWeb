import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/app/auth.guard';
import { AlertsComponent } from './alerts.component';
import { NotificationTypeComponent } from './notification-type/notification-type.component';
import { EventNotificationComponent } from './event-notification/event-notification.component';
import { EventNotificationViewerComponent } from './event-notification-viewer/event-notification-viewer.component';

const routes: Routes = [
  {
    path: '', component: AlertsComponent, 
    //canActivate: [AuthGuard],
    children: [
      {
        path: '',
        redirectTo: (localStorage.getItem('adminView') === 'user') ? 'notification' : 'notification',
        pathMatch: 'full'
      },
      { path: 'notification-types', component: NotificationTypeComponent, canActivate: [AuthGuard], data: { permission: 'Alerts Settings' } },
      { path: 'notification', component: EventNotificationComponent, canActivate: [AuthGuard], data: { permission: 'Alerts' } },
      { path: 'viewer', component: EventNotificationViewerComponent, canActivate: [AuthGuard], data: { permission: 'Alerts Settings' } },
      // { path: '', redirectTo: 'notification', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AlertsRoutingModule { }
