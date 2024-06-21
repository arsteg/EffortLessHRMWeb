import { Component, OnInit, OnDestroy } from '@angular/core';
import { SharedModule } from 'src/app/shared/shared.Module';
import { eventNotification, notificationUser } from 'src/app/models/eventNotification/eventNotitication';
import { User } from 'src/app/models/user';
import { FormBuilder } from '@angular/forms';
import { EventNotificationService } from 'src/app/_services/eventNotification.Service';
import { ToastrService } from 'ngx-toastr';
import { UserService } from 'src/app/_services/users.service';
import { Subscription } from 'rxjs';
import { ManageTeamService } from 'src/app/_services/manage-team.service';
import { TimeLogService } from 'src/app/_services/timeLogService';
import { SocketService } from 'src/app/_services/socket.Service';

@Component({
  selector: 'app-event-notification-viewer',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './event-notification-viewer.component.html',
  styleUrls: ['./event-notification-viewer.component.css']
})
export class EventNotificationViewerComponent implements OnInit, OnDestroy {
  private subscription: Subscription = new Subscription();
  teamOfUsers: notificationUser[] = [];
  eventNotifications: eventNotification[] = [];
  selectedUser: notificationUser | null = null;
  selectedManager: notificationUser | null = null;
  selectedEventNotification: eventNotification | null = null;

  constructor(
    private fb: FormBuilder,
    private eventNotificationService: EventNotificationService,
    private userService: UserService,
    private manageTeamService: ManageTeamService,
    private timeLogService: TimeLogService,
    private toastr: ToastrService,
    private socketService: SocketService
  ) {}

  ngOnInit(): void {
    this.populateTeamOfUsers();
    this.populateEventNotifications();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  populateTeamOfUsers(): void {
    this.manageTeamService.getAllUsers().subscribe({
      next: result => {
        this.teamOfUsers = result.data.data;
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        this.selectedManager = this.teamOfUsers.find(user => user._id === currentUser.id) || null;
      },
      error: error => {
        this.toastr.error('Failed to load team of users');
      }
    });
  }

  populateEventNotifications(): void {
    this.eventNotificationService.getAllEventNotifications().subscribe({
      next: result => {
        this.eventNotifications = result.data;
      },
      error: error => {
        this.toastr.error('Failed to load event notifications');
      }
    });
  }

  onModelChange(isChecked: boolean, notification: eventNotification): void {
    this.selectedEventNotification = notification;
    if (isChecked) {
      this.eventNotificationService.getNotificationUsers(notification._id).subscribe({
        next: result => {
          const userNotifications = result.data;
          this.teamOfUsers.forEach(user => user.isSelected = false);
          userNotifications.forEach(userNotification => {
            const user = this.teamOfUsers.find(u => u._id === userNotification.user);
            if (user) {
              user.isSelected = true;
            }
          });
        },
        error: () => {
          console.log('getNotificationUsers failed');
        }
      });
    }
  }

  onAllCheckChange(event): void {
    const isChecked = event;
    this.teamOfUsers.forEach(user => {
      user.isSelected = isChecked;
      this.updateUserNotifications(this.selectedEventNotification?._id, user._id, isChecked ? 'assign' : 'unassign');
    });
  }

  selectManager(event: any, user: notificationUser): void {
    const isChecked = event.target.checked;
    this.updateUserNotifications(this.selectedEventNotification?._id, user._id, isChecked ? 'assign' : 'unassign');
  }

  updateUserNotifications(notificationId: string | undefined, userId: string, action: string): void {
    if (!notificationId) {
      this.toastr.error('Notification ID is missing');
      return;
    }

    const updateUserNotification = { user: userId, notification: notificationId, action };

    this.eventNotificationService.updateUserNotifications(updateUserNotification).subscribe({
      next: () => {
        // Handle success (if any additional actions are needed)
      },
      error: () => {
        this.toastr.error('Failed to update user notifications');
      }
    });
  }
}
