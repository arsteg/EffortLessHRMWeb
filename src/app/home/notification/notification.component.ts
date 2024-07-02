import { Component } from '@angular/core';
import { NotificationService } from 'src/app/_services/notification.service';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrl: './notification.component.css'
})
export class NotificationComponent {
  dropdownOpen: boolean = false;
  todaysNotifications: any;
  loading = false;
  notificationType: any;

  constructor(private notificationService: NotificationService) { }

  ngOnInit() {
    this.getNotificationsofToday();
  }

  toggleDropdown() {
    this.dropdownOpen = this.dropdownOpen == false ? true : false

  }

  getNotificationsofToday() {
    this.notificationService.getNotificationsofToday().subscribe((response: any) => {
      this.todaysNotifications = response.data;
    });
  }

  getAllNotifications() {
    this.loading = true;
    this.notificationService.getAllNotificationsofLoggedInUser().subscribe((response: any) => {
      this.loading = false;
      this.todaysNotifications = [...this.todaysNotifications, ...response.data];
      this.todaysNotifications.forEach(notification => {
        this.getNotificationType(notification);
      });
    });
  }

  getNotificationType(notification: any) {
    this.notificationService.getNotificationsTypeById(notification.eventNotificationType).subscribe((response: any) => {
      notification.notificationType = response.data; // Store the notification type in the notification object
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


}
