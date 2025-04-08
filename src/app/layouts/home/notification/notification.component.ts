import { Component, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { NotificationService } from 'src/app/_services/notification.service';
import { WebSocketService, WebSocketMessage, WebSocketNotificationType } from 'src/app/_services/web-socket.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css']
})
export class NotificationComponent implements OnInit, OnDestroy {
  userId: string | null = null;
  dropdownOpen: boolean = false;
  eventNotifications: Notification[] = [];
  loading = false;
  private webSocketSubscription: Subscription | undefined;
  hasUnreadNotifications: boolean = false; // Track unread notifications

  constructor(
    private notificationService: NotificationService,
    private webSocketService: WebSocketService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    const storedUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    this.userId = storedUser?.id || null;
    if (this.userId) {
      this.subscribeToWebSocketNotifications();
      this.getEventNotificationsByUserId();
    } else {
      console.warn('User ID not found in localStorage.');
    }
  }

  ngOnDestroy() {
    if (this.webSocketSubscription) {
      this.webSocketSubscription.unsubscribe();
    }
  }

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  getEventNotificationsByUserId(seeAll: boolean = false) {
    if (!this.userId) return;
    this.loading = true;
    this.notificationService.getEventNotificationsByUser(this.userId).subscribe({
      next: (response: any) => {
        console.log('Raw API Response:', response);
        let allNotifications = response.data || response;
        console.log('All Notifications:', allNotifications);
        allNotifications.sort((a: Notification, b: Notification) => new Date(b.date).getTime() - new Date(a.date).getTime());
        this.eventNotifications = seeAll ? [...allNotifications] : allNotifications.slice(0, 3);
        this.updateUnreadStatus();
        this.loading = false;
      },
      error: (error) => {
        console.error('Failed to fetch notifications:', error);
        this.loading = false;
      },
    });
  }

  deleteNotification(event: Event, notificationId: string) {
    event.stopPropagation();
    this.notificationService.deleteEventNotification(this.userId, notificationId).subscribe((response: any) => {
      this.eventNotifications = this.eventNotifications.filter(item => item._id !== notificationId);
    });
  }

  markAllAsRead() {
    this.eventNotifications.forEach(n => n.status = 'read');
    this.updateUnreadStatus();
    console.log('Marked all as read');
    // Call API to update backend if needed
  }

  getIcon(type: string): string {
    const iconMap: { [key: string]: string } = {
      'Birthday': 'fa fa-birthday-cake',
      'Appraisal': 'fa fa-plus-circle',
      'Holiday': 'fa fa-taxi',
      'National Holiday': 'fa fa-flag-o',
      'Task': 'fa fa-list',
    };
    return iconMap[type] || '';
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
        notification = message.content as Notification; // Use as-is if already an object
      } else {
        console.warn('Unsupported content format:', message.content);
        return;
      }

      if (!notification.date || !notification.description) {
        console.warn('Invalid notification data:', notification);
        return;
      }
      notification.status = 'unread';
      this.eventNotifications = [notification, ...this.eventNotifications]
        .sort((a: Notification, b: Notification) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 3);
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
}

interface Notification {
  _id: string;
  description: string;
  date: Date;
  eventNotificationType: string;
  notificationType?: { name: string };
  profileImage?: string;
  status?: string; // 'unread' or 'read'
  name?: string; // Added for displaying name in the notification
}