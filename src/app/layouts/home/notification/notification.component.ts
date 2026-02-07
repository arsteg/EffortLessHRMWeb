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
      // Mark notification as read
      if (notification.status === 'unread' && this.userId) {
        notification.status = 'read';
        this.updateUnreadStatus();
        this.notificationService.updateNotificationStatus(this.userId, notification._id, 'read').subscribe({
          next: () => {
            console.log(`Marked notification ${notification._id} as read`);
          },
          error: (err) => {
            console.error(`Failed to update notification ${notification._id}`, err);
          }
        });
      }

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

      // Adjust route based on user role and current view mode
      route = this.adjustRouteForUserView(route);

      // Get current route to check if we're already on the target route
      const currentRoute = this.router.url;

      // Use setTimeout to ensure menu closes before navigation
      setTimeout(() => {
        if (currentRoute === route) {
          // If we're already on the same route, force reload by navigating away and back
          // Use a safe route that won't trigger login guards
          this.router.navigate(['/home'], { skipLocationChange: true }).then(() => {
            this.router.navigateByUrl(route);
          });
        } else {
          // Direct navigation to the target route
          this.router.navigateByUrl(route);
        }
      }, 100);
    }
  }

  private adjustRouteForUserView(route: string): string {
    // Get user info from localStorage
    const userRole = localStorage.getItem('role') || '';
    const adminView = localStorage.getItem('adminView'); // 'admin' or 'user'

    // Check if user is admin
    const isAdmin = userRole.toLowerCase() === 'admin';

    // Route mapping based on view mode
    const routeMap: { [key: string]: { user: string; admin: string } } = {
      '/home/leave/leave-application': {
        user: '/home/leave/my-application',
        admin: '/home/leave/leave-application'
      },
      '/home/leave/my-application': {
        user: '/home/leave/my-application',
        admin: '/home/leave/leave-application'
      },
      '/home/leave/team-application': {
        user: '/home/leave/my-application',
        admin: '/home/leave/leave-application'
      },
      '/home/leave/leave-grant': {
        user: '/home/leave/my-leave-grant',
        admin: '/home/leave/leave-grant'
      },
      '/home/leave/my-leave-grant': {
        user: '/home/leave/my-leave-grant',
        admin: '/home/leave/leave-grant'
      },
      '/home/leave/team-leave-grant': {
        user: '/home/leave/my-leave-grant',
        admin: '/home/leave/leave-grant'
      },
      '/home/leave/short-leave': {
        user: '/home/leave/my-short-leave',
        admin: '/home/leave/short-leave'
      },
      '/home/leave/my-short-leave': {
        user: '/home/leave/my-short-leave',
        admin: '/home/leave/short-leave'
      },
      '/home/leave/team-short-leave': {
        user: '/home/leave/my-short-leave',
        admin: '/home/leave/short-leave'
      },
      '/home/expense/my-expense': {
        user: '/home/expense/my-expense',
        admin: '/home/expense/expense-reports'
      },
      '/home/expense/expense-reports': {
        user: '/home/expense/my-expense',
        admin: '/home/expense/expense-reports'
      },
      '/home/expense/team-expense': {
        user: '/home/expense/my-expense',
        admin: '/home/expense/expense-reports'
      },
      '/home/expense/advance-reports': {
        user: '/home/expense/my-expense',
        admin: '/home/expense/expense-reports'
      }
    };
    // Find matching route in map
    const mappedRoute = routeMap[route];
    if (mappedRoute) {
      if (isAdmin) {
        // Admin can be in 'user' or 'admin' view
        if (adminView === 'user') {
          return mappedRoute.user;
        } else {
          return mappedRoute.admin;
        }
      } else {
        // Regular users always use user view
        return mappedRoute.user;
      }
    }

    // Return original route if no mapping found
    return route;
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