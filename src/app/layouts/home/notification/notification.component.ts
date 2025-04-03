import { Component, OnDestroy, OnInit } from '@angular/core';
import { NotificationService } from 'src/app/_services/notification.service';
import { WebSocketService, WebSocketMessage, WebSocketNotificationType } from 'src/app/_services/web-socket.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css']
})
export class NotificationComponent implements OnInit, OnDestroy {
  userId: string;
  dropdownOpen: boolean = false;
  eventNotifications: any[] = []; // Explicitly typed as an array
  loading = false;
  notificationType: any;
  private webSocketSubscription: Subscription | undefined;

  constructor(
    private notificationService: NotificationService,
    private webSocketService: WebSocketService
  ) { }

  ngOnInit() {
    const storedUser = JSON.parse(localStorage.getItem('currentUser'));
    this.userId = storedUser ? storedUser.id : null;    
    this.subscribeToWebSocketNotifications();
    this.getEventNotificationsByUserId() // Fetch notifications for the logged-in user
  }

  ngOnDestroy() {
    if (this.webSocketSubscription) {
      this.webSocketSubscription.unsubscribe();
    }
  }

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  // getNotificationsofToday() {
  //   this.notificationService.getNotificationsofToday().subscribe((response: any) => {
  //     this.todaysNotifications = response.data;
  //     this.todaysNotifications.forEach(notification => {
  //       this.getNotificationType(notification);
  //     });
  //   });
  // }

  getEventNotificationsByUserId() {
    this.notificationService.getEventNotificationsByUser(this.userId).subscribe((response: any) => {
      this.eventNotifications = response.data;
      this.eventNotifications.forEach(notification => {
        //this.getNotificationType(notification);
      });
    });
  }

  // getAllNotifications() {
  //   this.loading = true;
  //   this.notificationService.getAllNotificationsofLoggedInUser().subscribe((response: any) => {
  //     this.loading = false;
  //     this.todaysNotifications = response.data;
  //     this.todaysNotifications.forEach(notification => {
  //       this.getNotificationType(notification);
  //     });
  //   });
  // }

  getNotificationType(notification: any) {
    this.notificationService.getNotificationsTypeById(notification.eventNotificationType).subscribe((response: any) => {
      notification.notificationType = response.data;
    });
  }

  deleteNotification(notificationId: string) {
    this.notificationService.deleteEventNotification(this.userId, notificationId).subscribe((response: any) => {
      this.eventNotifications = this.eventNotifications.filter(item => item._id !== notificationId);
    });
  }

  getIcon(type: string): string {
    switch (type) {
      case 'Birthday':
        return 'fa fa-birthday-cake';
      case 'Appraisal':
        return 'fa fa-plus-circle';
      case 'Holiday':
        return 'fa fa-taxi';
      case 'National Holiday':
        return 'fa fa-flag-o';
      case 'Task':
        return 'fa fa-list';
      default:
        return '';
    }
  }

  private subscribeToWebSocketNotifications() {    // Assuming the WebSocket connection is already established elsewhere with a userId
    
    if (this.userId) {
      this.webSocketService.connect(this.userId); // Connect to WebSocket with userId
    } else {
      console.warn('User ID not found. Cannot connect to WebSocket.');
    }
    if (this.webSocketService.isConnected()) {
      this.webSocketSubscription = this.webSocketService.getMessagesByType(WebSocketNotificationType.NOTIFICATION)
        .subscribe((message: WebSocketMessage) => {
          console.log('Received WebSocket notification:', message);
          this.handleWebSocketNotification(message);
        });
    } else {
      console.warn('WebSocket is not connected. Cannot subscribe to notifications.');
      // Optionally, connect here if you have the userId available
      // const userId = 'some-user-id'; // Replace with actual userId source
      // this.webSocketService.connect(userId);
      // Then subscribe after connection
    }
  }

  private handleWebSocketNotification(message: WebSocketMessage) {
    // Assuming the content is JSON stringified event notification data
    if (message.contentType === 'json') {
      const notification = JSON.parse(message.content);
      // Fetch notification type if not included in the message
      this.getNotificationType(notification);
      // Add to the list (assuming it's a new notification)
      this.eventNotifications.unshift(notification); // Add to the top of the list
    } else {
      console.warn('Unsupported WebSocket content type:', message.contentType);
    }
  }
}