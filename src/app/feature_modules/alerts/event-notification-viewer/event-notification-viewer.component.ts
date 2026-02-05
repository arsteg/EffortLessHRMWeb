import { Component, OnInit, OnDestroy, EventEmitter, Output } from '@angular/core';
//import { SharedModule } from 'src/app/shared/shared.Module';
import { eventNotification, notificationUser } from 'src/app/models/eventNotification/eventNotitication';
import { FormBuilder } from '@angular/forms';
import { EventNotificationService } from 'src/app/_services/eventNotification.Service';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { ManageTeamService } from 'src/app/_services/manage-team.service';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';


@Component({
  selector: 'app-event-notification-viewer',
  // standalone: true,
  // imports: [SharedModule],
  templateUrl: './event-notification-viewer.component.html',
  styleUrls: ['./event-notification-viewer.component.css']
})
export class EventNotificationViewerComponent implements OnInit, OnDestroy {
  @Output() addNotification = new EventEmitter<void>();
  private subscription: Subscription = new Subscription();
  teamOfUsers: notificationUser[] = [];
  eventNotifications: eventNotification[] = [];
  selectedUser: notificationUser | null = null;
  selectedManager: notificationUser | null = null;
  selectedEventNotification: eventNotification | null = null;
  allChecked: boolean = false;

  constructor(
    private fb: FormBuilder,
    private eventNotificationService: EventNotificationService,
    private manageTeamService: ManageTeamService,
    private toastr: ToastrService,
    private router: Router, 
    private route: ActivatedRoute,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    // Check for notificationId query parameter for auto-selection
    this.route.queryParams.subscribe(params => {
      const notificationId = params['notificationId'];
      if (notificationId) {
        // For auto-selection, load users first, then notifications with auto-select
        this.populateTeamOfUsersWithCallback(() => {
          this.populateEventNotificationsWithAutoSelect(notificationId);
        });
      } else {
        // Load normally
        this.populateTeamOfUsers();
        this.populateEventNotifications();
      }
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  populateEventNotificationsWithAutoSelect(notificationId: string): void {
    this.eventNotificationService.getAllEventNotifications().subscribe({
      next: result => {
        this.eventNotifications = result.data.filter(item => item.status === 'scheduled');
        // Auto-select the notification after loading
        this.autoSelectNotification(notificationId);
      },
      error: (err) => {
        this.toastr.error(err || this.translate.instant('alerts.eventviewer.messages.failedToLoadNotifications'));
      }
    });
  }

  autoSelectNotification(notificationId: string): void {
    // Find the notification with matching ID
    const notification = this.eventNotifications.find(n => n._id === notificationId);

    if (notification) {
      // Set the selected notification (this will update the radio button via ngModel)
      this.selectedManager = notification as any;
      this.selectedEventNotification = notification;

      // Trigger the model change to load assigned users
      this.onModelChange(true, notification);

      // Optional: Scroll to the selected notification after a short delay
      setTimeout(() => {
        const radioButtons = document.querySelectorAll('mat-radio-button');
        const targetButton = Array.from(radioButtons).find(btn =>
          btn.textContent?.trim().toLowerCase() === notification.name.toLowerCase()
        );
        if (targetButton) {
          targetButton.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }, 200);
    }
  }

  populateTeamOfUsers(): void {
    this.manageTeamService.getAllUsers().subscribe({
      next: result => {
        this.teamOfUsers = result.data.data;
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        this.selectedManager = this.teamOfUsers.find(user => user._id === currentUser.id) || null;
      },
      error: (err) => {
        this.toastr.error(err || this.translate.instant('alerts.eventviewer.messages.failedToLoadUsers'));
      }
    });
  }

  populateTeamOfUsersWithCallback(callback: () => void): void {
    this.manageTeamService.getAllUsers().subscribe({
      next: result => {
        this.teamOfUsers = result.data.data;
        // Don't set selectedManager here - let the callback handle selection
        if (callback) {
          callback();
        }
      },
      error: (err) => {
        this.toastr.error(err || this.translate.instant('alerts.eventviewer.messages.failedToLoadUsers'));
      }
    });
  }

  populateEventNotifications(): void {
    this.eventNotificationService.getAllEventNotifications().subscribe({
      next: result => {
        this.eventNotifications = result.data.filter(item => item.status === 'scheduled');
      },
      error: (err) => {
        this.toastr.error(err || this.translate.instant('alerts.eventviewer.messages.failedToLoadNotifications'));
      }
    });
  }

  onModelChange(isChecked: any, notification: eventNotification): void {
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
          this.updateAllCheckboxState();
        },
        error: (err) => {
          this.toastr.error(err || this.translate.instant('alerts.eventviewer.messages.failedToLoadUserNotifications'));
        }
      });
    }
  }

  onAllCheckChange(event: any): void {
    const isChecked = event.source._checked;
    this.teamOfUsers.forEach(user => {
      user.isSelected = isChecked;
      const action = isChecked==true ? 'assign' : 'unassign';
      this.updateUserNotifications(this.selectedEventNotification?._id, user._id,action );
    });
    //this.allChecked = isChecked;
  }

  selectManager(event: any, user: notificationUser): void {
    const isChecked = event.source._checked;
    user.isSelected = isChecked;
    const action = isChecked==true ? 'assign' : 'unassign';
    this.updateUserNotifications(this.selectedEventNotification?._id, user._id, action);
    this.updateAllCheckboxState();
  }

  updateUserNotifications(notificationId: string | undefined, userId: string, action: string): void {
    if (!notificationId) {
      this.toastr.error(this.translate.instant('alerts.eventviewer.messages.notificationIdMissing'));
      return;
    }

    const updateUserNotification = { user: userId, notification: notificationId, action };

    this.eventNotificationService.updateUserNotifications(updateUserNotification).subscribe({
      next: () => {
        // Handle success (if any additional actions are needed)
       this.toastr.success(this.translate.instant('alerts.eventviewer.messages.userNotificationUpdated'));
      },
      error: () => {
        this.toastr.error(this.translate.instant('alerts.eventviewer.messages.failedToUpdateUserNotifications'));
      }
    });
  }

  private updateAllCheckboxState(): void {
    this.allChecked = this.teamOfUsers.every(user => user.isSelected);
  }

  triggerNotificationTab(): void {
    this.addNotification.emit();
  }

  redirectToNotification(): void {
    this.router.navigate(['../notification'], { relativeTo: this.route })
      .catch(err => {
        console.error('Navigation to notification failed:', err);
      });
  }
}
