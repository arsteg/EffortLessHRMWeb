import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { EventNotificationService } from 'src/app/_services/eventNotification.Service';
import { eventNotificationType } from 'src/app/models/eventNotification/eventNotitication';
import { SharedModule } from 'src/app/shared/shared.Module';

@Component({
  selector: 'app-notification-type',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './notification-type.component.html',
  styleUrl: './notification-type.component.css'
})

export class NotificationTypeComponent implements OnInit {
  notificationTypeList: eventNotificationType[] = [];
  filteredList: eventNotificationType[] = [];
  notificationTypeForm: FormGroup;
  isEdit = false;
  selectedNotificationType: eventNotificationType;
  p = 1;
  searchText: string = '';
  constructor(private fb: FormBuilder, private eventNotificationService: EventNotificationService, private toast: ToastrService) { }

  ngOnInit(): void {
    this.initForm();
    this.getNotificationTypsList();
  }

  initForm() {
    this.notificationTypeForm = this.fb.group({
      name: ['', Validators.required]
    });
  }

  getNotificationTypsList() {
    this.notificationTypeList = [
    ];
    this.eventNotificationService.getAlleventNotificationTypes().subscribe((response: any) => {
      this.notificationTypeList = response && response.data;
      this.filteredList = this.notificationTypeList;
    })
  }

  async addNotificationType() {
    try {
      await this.eventNotificationService.addEventNotificationType(this.notificationTypeForm.value).toPromise();
      this.toast.success('Notification type added successfully!');
      this.getNotificationTypsList();
    } catch (err) {
      this.toast.error('Error adding notification type', 'Error!');
    }
  }

  editNotificationType(status: eventNotificationType) {
    this.isEdit = true;
    this.selectedNotificationType = status;
    this.notificationTypeForm.patchValue({
      name: status.name
    });
  }

  async updateNotificationType() {
    try {
      const updatedNotificationType = this.notificationTypeList.find(notificatioType => notificatioType._id === this.selectedNotificationType._id);
      updatedNotificationType.name = this.notificationTypeForm.value.name;
      const response = await this.eventNotificationService.updateEventNotificationType(updatedNotificationType,this.selectedNotificationType._id).toPromise();
      this.toast.success('Notification type updated successfully!');
      this.getNotificationTypsList();
      this.isEdit = false;
    } catch (err) {
      this.toast.error('Error updating notification type', 'Error!');
    }
  }
  confirmAction(): boolean {
    return window.confirm('Are you sure you want to perform this action?');
  }

  deleteNotificationType(status: eventNotificationType) {
    try {
      const result = this.confirmAction();
      if (result) {
        this.eventNotificationService.deleteEventNotificationType(status._id).subscribe((response: any) => {
          this.toast.success('Notification type has been deleted successfully!')
          this.getNotificationTypsList();
        })
      }
    }
    catch (err) {
      this.toast.error('Error deleting notification type', 'Error!');
    }
  }

  filteredApplicatioStatusList(searchControl) {
    const searchQuery = searchControl.value?.toLowerCase();
    this.filteredList = this.notificationTypeList.filter(item => item .name?.toLowerCase().includes(searchQuery));
  }
  onEditFocus(event: FocusEvent) {
    const input = event.target as HTMLInputElement;
    input.select();
  }
}
