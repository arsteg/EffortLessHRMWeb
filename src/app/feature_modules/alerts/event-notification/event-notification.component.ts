import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { EventNotificationService } from 'src/app/_services/eventNotification.Service';
import { eventNotification, eventNotificationType } from 'src/app/models/eventNotification/eventNotitication';
import { Role } from 'src/app/models/role.model';
import { SharedModule } from 'src/app/shared/shared.Module';

@Component({
  selector: 'app-event-notification',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './event-notification.component.html',
  styleUrl: './event-notification.component.css'
})
export class EventNotificationComponent implements OnInit {
  eventNotificationList: eventNotification[] = [];
  filteredList: eventNotification[] = [];
  notificationTypeList: eventNotificationType[] = [];
  eventNotificationForm: FormGroup;
  isEdit = false;
  selectedEventNotification: eventNotification;
  p = 1;
  searchText: string = '';
  view: Role | null = null;
  currentUser = JSON.parse(localStorage.getItem('currentUser'));
  constructor(private fb: FormBuilder, private eventNotificationService: EventNotificationService, private toast: ToastrService) { }

  ngOnInit(): void {
    const storedRole = localStorage.getItem('adminView') as Role;
    this.view = storedRole;
    this.initForm();
    this.getNotificationTypeList();
  }

  initForm() {
    this.eventNotificationForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      eventNotificationType: [null],
      date: ['', Validators.required],
      isRecurring: [false, Validators.required],
      recurringFrequency: [''],
      leadTime: [0, Validators.required]
    });

    this.eventNotificationForm.get('isRecurring')?.valueChanges.subscribe((isRecurring) => {
      const recurringFrequency = this.eventNotificationForm.get('recurringFrequency');
      if (isRecurring) {
        recurringFrequency?.setValidators([Validators.required]);
      } else {
        recurringFrequency?.clearValidators();
      }
      recurringFrequency?.updateValueAndValidity();
    });
  }
  getNotificationTypeList() {
    this.notificationTypeList = [];
    this.eventNotificationService.getAlleventNotificationTypes().subscribe((response: any) => {
      this.notificationTypeList = response && response.data;
      this.getEventNotificationList();
    })
  }
  getNotificationTypeName(id:string){
    const notifucationType = this.notificationTypeList.find(notificationType=>notificationType._id == id);
    return notifucationType?notifucationType?.name:"";
  }
  getEventNotificationList() {
    this.eventNotificationList = [
    ];
    this.eventNotificationService.getAllEventNotifications().subscribe((response: any) => {
      this.eventNotificationList = response && response.data;
      //this.filteredList = this.eventNotificationList;
      this.filteredList = this.eventNotificationList.filter(item => (item.status === 'scheduled' || item.status === 'sent'));
    })
  }

  async addEventNotification() {
    try {
     const formValue = this.eventNotificationForm.value;
      if (!formValue.isRecurring || !formValue.recurringFrequency) {
        delete formValue.recurringFrequency;
      }

      const formData = {
        ...formValue,
        status: 'scheduled',
        createdBy: this.currentUser?.id,
        isCreatedFromUI: true,
        view: this.view
      };
      await this.eventNotificationService.addEventNotification(formData).toPromise();
      this.toast.success('Event notification added successfully!');
      this.resetNotificationForm();
      this.isEdit = false;
      this.getEventNotificationList();
    } catch (err) {
      this.toast.error('Error adding event notification', 'Error!');
    }
  }
  editEventNotification(eventNotification: eventNotification) {
    this.isEdit = true;
    this.selectedEventNotification = eventNotification;
    const formattedDate = new Date(eventNotification.date).toISOString().split('T')[0];
    this.eventNotificationForm.patchValue({
      name: eventNotification.name,
      description: eventNotification.description,
      eventNotificationType: eventNotification.eventNotificationType,
      date: formattedDate,
      isRecurring: eventNotification.isRecurring,
      recurringFrequency: eventNotification.recurringFrequency,
      leadTime: eventNotification.leadTime
    });
  }

  async updateEventNotification() {
    try {
      const updatedEventNotification = this.eventNotificationList.find(eventNotification => eventNotification._id === this.selectedEventNotification._id);
      if (!updatedEventNotification) return;
      updatedEventNotification.description = this.eventNotificationForm.value.description;
      updatedEventNotification.eventNotificationType = this.eventNotificationForm.value.eventNotificationType;
      updatedEventNotification.isRecurring = this.eventNotificationForm.value.isRecurring;
      updatedEventNotification.date = this.eventNotificationForm.value.date;
      updatedEventNotification.recurringFrequency = this.eventNotificationForm.value.recurringFrequency;
      updatedEventNotification.leadTime = this.eventNotificationForm.value.leadTime;
      updatedEventNotification.status = "scheduled";
      updatedEventNotification.updatedBy = this.currentUser?.id;

      const response = await this.eventNotificationService.updateEventNotification(updatedEventNotification,this.selectedEventNotification._id).toPromise();
      this.toast.success('Event notification updated successfully!');
      this.resetNotificationForm();
      this.getEventNotificationList();
      this.isEdit = false;
    } catch (err) {
      this.toast.error('Error updating event notification', 'Error!');
    }
  }
  confirmAction(): boolean {
    return window.confirm('Are you sure you want to perform this action?');
  }

  deleteEventNotification(status: eventNotification) {
    try {
      const result = this.confirmAction();
      if (result) {
        this.eventNotificationService.deleteEventNotification(status._id).subscribe((response: any) => {
          this.toast.success('Event notification has been deleted successfully!')
          this.getEventNotificationList();
        })
      }
    }
    catch (err) {
      this.toast.error('Error deleting event notification', 'Error!');
    }
  }

  filteredEventNotificationList(searchControl) {
    const searchQuery = searchControl.value?.toLowerCase();
    this.filteredList = this.eventNotificationList.filter(item => (item.status === 'scheduled' || item.status === 'sent') && item .name?.toLowerCase().includes(searchQuery));
  }
  onEditFocus(event: FocusEvent) {
    const input = event.target as HTMLInputElement;
    input.select();
  }

  cancelEdit() {
    this.resetNotificationForm();
    this.isEdit = false;
  }

  resetNotificationForm()
  {
    this.eventNotificationForm.reset({
      name: '',
      description: '',
      eventNotificationType: '',
      date: '',
      isRecurring: false,
      recurringFrequency: '',
      leadTime: 0
    });
  }
}
