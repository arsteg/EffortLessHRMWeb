import { Component, OnDestroy, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MatMenuTrigger } from '@angular/material/menu';
import { NotificationService } from 'src/app/_services/notification.service';
import { WebSocketService, WebSocketMessage, WebSocketNotificationType } from 'src/app/_services/web-socket.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css']
})
export class NotificationComponent implements OnInit, OnDestroy {
  @ViewChild(MatMenuTrigger) menuTrigger: MatMenuTrigger;
  userId: string | null = null;
  dropdownOpen: boolean = false;
  eventNotifications: Notification[] = [];
  loading = false;
  private webSocketSubscription: Subscription | undefined;
  hasUnreadNotifications: boolean = false; // Track unread notifications

  constructor(
    private notificationService: NotificationService,
    private webSocketService: WebSocketService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) { }

  ngOnInit() {
    const storedUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    this.userId = storedUser?.id || null;
    if (this.userId) {
      this.subscribeToWebSocketNotifications();
      this.getEventNotificationsByUserId();
    } else {
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
        let allNotifications = response.data || response;
        // Filter out 'scheduled' notifications
        allNotifications = allNotifications.filter((n: Notification) => n.status !== 'scheduled');
        allNotifications.sort((a: Notification, b: Notification) => new Date(b.date).getTime() - new Date(a.date).getTime());
        this.eventNotifications = seeAll ? [...allNotifications] : allNotifications.slice(0, 3);
        this.updateUnreadStatus();
        this.loading = false;
      },
      error: (error) => {
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
      return;
    }
    try {
      this.webSocketService.connect(this.userId);
      if (this.webSocketService.isConnected()) {
        this.webSocketSubscription = this.webSocketService.getMessagesByType(WebSocketNotificationType.NOTIFICATION)
          .subscribe({
            next: (message: WebSocketMessage) => {
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
    if (message?.contentType === 'json') {
      let notification: Notification;
      if (typeof message.content === 'object' && message.content !== null) {
        notification = message.content as Notification; // Use as-is if already an object
      } else {
        return;
      }

      if (!notification.date || !notification.description) {
        return;
      }
      notification.status = 'unread';
      this.eventNotifications = [notification, ...this.eventNotifications]
        .filter((n: Notification) => n.status !== 'scheduled')
        .sort((a: Notification, b: Notification) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 3);
      this.updateUnreadStatus();
      this.cdr.detectChanges();
    } else {
      console.warn('Unsupported WebSocket content type:', message.contentType);
    }
  }

  private updateUnreadStatus() {
    this.hasUnreadNotifications = this.eventNotifications.some(n => n.status === 'unread');
  }

  navigateToUrl(event: Event, notification: Notification) {
    event.stopPropagation();
    if (notification.navigationUrl) {
      // Close the menu first
      if (this.menuTrigger) {
        this.menuTrigger.closeMenu();
      }

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

      // Use setTimeout to ensure menu closes before navigation
      setTimeout(() => {
        // Force navigation by first navigating to a dummy route, then to the target
        this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
          this.router.navigateByUrl(route);
        });
      }, 100);
    }
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
  navigationUrl?: string; // URL to navigate when clicking the notification
}