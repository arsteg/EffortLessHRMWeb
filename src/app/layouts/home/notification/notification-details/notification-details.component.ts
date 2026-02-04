import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { NotificationService } from 'src/app/_services/notification.service';
import { WebSocketService, WebSocketMessage, WebSocketNotificationType } from 'src/app/_services/web-socket.service';
import { Subscription } from 'rxjs';
import { SharedModule } from 'src/app/shared/shared.Module';

@Component({
  selector: 'app-notification-details',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './notification-details.component.html',
  styleUrl: './notification-details.component.css'
})
export class NotificationDetailsComponent {
  userId: string | null = null;
  eventNotifications: Notification[] = [];
  loading = false;
  private webSocketSubscription: Subscription | undefined;
  hasUnreadNotifications: boolean = false;

  constructor(
    private notificationService: NotificationService,
    private webSocketService: WebSocketService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit() {
    const storedUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    this.userId = storedUser?.id || null;
    if (this.userId) {
      this.subscribeToWebSocketNotifications();
      this.getEventNotificationsByUserId(true); // Fetch all notifications
    } else {
      console.warn('User ID not found in localStorage.');
    }
  }

  ngOnDestroy() {
    if (this.webSocketSubscription) {
      this.webSocketSubscription.unsubscribe();
    }
  }

  getEventNotificationsByUserId(seeAll: boolean = true) {
    if (!this.userId) return;
    this.loading = true;
    this.notificationService.getEventNotificationsByUser(this.userId).subscribe({
      next: (response: any) => {
        console.log('API Response:', response);
        let allNotifications = response.data || response;
        allNotifications = allNotifications.filter((n: Notification) => n.status !== 'scheduled');
        allNotifications.sort((a: Notification, b: Notification) => new Date(b.date).getTime() - new Date(a.date).getTime());
        this.eventNotifications = [...allNotifications]; // Show all
        this.updateUnreadStatus();
        this.loading = false;
      },
      error: (error) => {
        console.error('Failed to fetch notifications:', error);
        this.loading = false;
      },
    });
  }

  deleteNotification(notificationId: string) {
    if (!this.userId) return;
    this.notificationService.deleteEventNotification(this.userId, notificationId).subscribe({
      next: () => {
        this.eventNotifications = this.eventNotifications.filter(item => item._id !== notificationId);
        this.updateUnreadStatus();
      },
      error: (error) => console.error('Failed to delete notification:', error),
    });
  }

  markAllAsRead() {
    this.eventNotifications.forEach(n => n.status = 'read');
    this.updateUnreadStatus();
    console.log('Marked all as read');

    this.eventNotifications.forEach(n => {
    n.status = 'read';
    this.notificationService.updateNotificationStatus(this.userId, n._id, 'read').subscribe({
        next: () => {
          console.log(`Marked notification ${n._id} as read`);
        },
        error: (err) => {
          console.error(`Failed to update notification ${n._id}`, err);
        }
      });
    });
  }

  private subscribeToWebSocketNotifications() {
    if (!this.userId) {
      console.warn('User ID not found. Cannot connect to WebSocket.');
      return;
    }
    try {
      this.webSocketService.connect(this.userId);
      if (this.webSocketService.isConnected()) {
        this.webSocketSubscription = this.webSocketService.getMessagesByType(WebSocketNotificationType.NOTIFICATION)
          .subscribe({
            next: (message: WebSocketMessage) => {
              console.log('Received WebSocket notification:', message);
              this.handleWebSocketNotification(message);
            },
            error: (error) => console.error('WebSocket subscription error:', error),
          });
      } else {
        console.warn('WebSocket is not connected. Attempting to reconnect...');
      }
    } catch (error) {
      console.error('WebSocket connection error:', error);
    }
  }

  private handleWebSocketNotification(message: WebSocketMessage) {
    console.log('Raw message:', message);
    if (message?.contentType === 'json') {
      let notification: Notification;
      if (typeof message.content === 'object' && message.content !== null) {
        notification = message.content as Notification;
      } else {
        console.warn('Unsupported content format:', message.content);
        return;
      }

      if (!notification._id || !notification.date || !notification.description || !notification.name || !notification.profileImage) {
        console.warn('Invalid notification data:', notification);
        return;
      }
      notification.status = 'unread';
      this.eventNotifications = [notification, ...this.eventNotifications]
        .filter((n: Notification) => n.status !== 'scheduled')
        .sort((a: Notification, b: Notification) => new Date(b.date).getTime() - new Date(a.date).getTime());
      this.updateUnreadStatus();
      this.cdr.detectChanges();
      console.log('Updated notifications:', this.eventNotifications);
    } else {
      console.warn('Unsupported WebSocket content type:', message.contentType);
    }
  }

  private updateUnreadStatus() {
    this.hasUnreadNotifications = this.eventNotifications.some(n => n.status === 'unread');
  }

  navigateToUrl(notification: Notification) {
    if (notification.navigationUrl) {
      // Extract the route from the full URL
      // Format: https://domain.com/#/home/edit-task?taskId=123
      // We need: /home/edit-task?taskId=123
      let route = notification.navigationUrl;

      // Check if URL contains hash (#)
      if (route.includes('#')) {
        route = route.split('#')[1];
      }

      // Remove leading slash if double slash exists
      if (route.startsWith('//')) {
        route = route.substring(1);
      }

      // Force navigation by first navigating to a dummy route, then to the target
      // This ensures the route reloads even when already on a child route
      this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
        this.router.navigateByUrl(route);
      });
    }
  }
}

interface Notification {
  _id: string;
  name: string;
  description: string;
  date: Date;
  eventNotificationType: string;
  notificationType?: { name: string };
  profileImage: string;
  status?: string; // 'unread' or 'read'
  navigationUrl?: string; // URL to navigate when clicking the notification
}