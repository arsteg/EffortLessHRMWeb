import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { EventNotificationService } from 'src/app/_services/eventNotification.Service';
import { eventNotification, eventNotificationType } from 'src/app/models/eventNotification/eventNotitication';
import { Role } from 'src/app/models/role.model';
import { SharedModule } from 'src/app/shared/shared.Module';
import { ActionVisibility, TableColumn } from 'src/app/models/table-column';
import { TranslateService } from '@ngx-translate/core';
import { CommonComponentsModule } from "src/app/common/commonComponents.module";
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-event-notification',
  standalone: true,
  imports: [SharedModule, CommonComponentsModule],
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
  columns: TableColumn[] = [
    { key: 'name', name: this.translate.instant('alerts.eventNotification.name') },
    { key: 'description', name: this.translate.instant('alerts.eventNotification.description') },
    {
      key: 'eventNotificationType',
      name: this.translate.instant('alerts.eventNotification.type'),
      valueFn: (row: eventNotification) => this.getNotificationTypeName(row.eventNotificationType)
    },
    {
      key: 'date',
      name: this.translate.instant('alerts.eventNotification.date'),
      valueFn: (row: eventNotification) => new Date(row.date).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
    },
    {
      key: 'isRecurring',
      name: this.translate.instant('alerts.eventNotification.recurring'),
      valueFn: (row: eventNotification) => row.isRecurring ? this.translate.instant('alerts.eventNotification.yes') : this.translate.instant('alerts.eventNotification.no')
    },
    { key: 'recurringFrequency', name: this.translate.instant('alerts.eventNotification.frequency') },
    { key: 'leadTime', name: this.translate.instant('alerts.eventNotification.leadTime') },
    {
      key: 'action',
      name: this.translate.instant('alerts.eventNotification.actions'),
      isAction: true,
      options: [
        { label: 'Edit', icon: 'edit', visibility: ActionVisibility.LABEL },
        { label: 'Delete', icon: 'delete', visibility: ActionVisibility.LABEL }
      ]
    }
  ];

  constructor(private fb: FormBuilder, 
    private eventNotificationService: EventNotificationService, 
    private toast: ToastrService,
    private translate: TranslateService ,
    private dialog: MatDialog
  ) { }

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
      this.toast.success(this.translate.instant('alerts.eventNotification.addSuccess'));
      this.resetNotificationForm();
      this.isEdit = false;
      this.getEventNotificationList();
    } catch (err) {
      this.toast.error(this.translate.instant('alerts.eventNotification.addError'), this.translate.instant('alerts.eventNotification.error'));
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
      this.toast.success(this.translate.instant('alerts.eventNotification.updateSuccess'));
      this.resetNotificationForm();
      this.getEventNotificationList();
      this.isEdit = false;
    } catch (err) {
      this.toast.error(this.translate.instant('alerts.eventNotification.updateError'), this.translate.instant('alerts.eventNotification.error'));
    }
  }
  confirmAction(): boolean {
    return window.confirm(this.translate.instant('alerts.eventNotification.confirmDelete'));
  }

  openDialog(row: eventNotification): void {
      const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
        width: '400px',
        data: row,
      });
  
      dialogRef.afterClosed().subscribe((result) => {
        if (result === 'delete') {
          this.deleteEventNotification(row);
        }
        (err) => {
          this.toast.error('Can not be Deleted', 'Error!');
        };
      });
    }

  deleteEventNotification(status: eventNotification) {
    try {
      //const result = this.confirmAction();
      //if (result) {
        this.eventNotificationService.deleteEventNotification(status._id).subscribe((response: any) => {
          this.toast.success(this.translate.instant('alerts.eventNotification.deleteSuccess'));
          this.getEventNotificationList();
        })
      //}
    }
    catch (err) {
      this.toast.error(this.translate.instant('alerts.eventNotification.deleteError'), this.translate.instant('alerts.eventNotification.error'));
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

  onActionClick(event: { action: { label: string }, row: eventNotification }) {
    switch (event.action.label) {
      case 'Edit':
        this.editEventNotification(event.row);
        break;
      case 'Delete':
        //this.deleteEventNotification(event.row);
        this.openDialog(event.row);
        break;
    }
  }
}
