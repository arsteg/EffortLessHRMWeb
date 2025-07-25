import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { EventNotificationService } from 'src/app/_services/eventNotification.Service';
import { eventNotificationType } from 'src/app/models/eventNotification/eventNotitication';
import { ActionVisibility, TableColumn } from 'src/app/models/table-column';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-notification-type',
  templateUrl: './notification-type.component.html',
  styleUrls: ['./notification-type.component.css']
})

export class NotificationTypeComponent implements OnInit {
  notificationTypeList: eventNotificationType[] = [];
  filteredList: eventNotificationType[] = [];
  notificationTypeForm: FormGroup;
  isEdit = false;
  selectedNotificationType: eventNotificationType;
  p = 1;
  searchText: string = '';
  columns: TableColumn[] = [
    { 
      key: 'name', 
      name: this.translate.instant('alerts.notification-type.notificationLabel')
    },
    {
      key: 'action',
      name: this.translate.instant('alerts.notification-type.actions'),
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
    private translate: TranslateService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.getNotificationTypsList();
  }

  initForm() {
    this.notificationTypeForm = this.fb.group({
      name: ['', [Validators.required, this.noWhitespaceValidator]]
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
      this.toast.success(this.translate.instant('alerts.notification-type.addSuccess'));
      this.getNotificationTypsList();
      this.notificationTypeForm.reset();
    } catch (err) {
      this.toast.error(
        err?.error?.message || 
        err?.message || err ||
        this.translate.instant('alerts.notification-type.addError'), this.translate.instant('alerts.notification-type.error'));
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
      this.toast.success(this.translate.instant('alerts.notification-type.updateSuccess'));
      this.getNotificationTypsList();
      this.notificationTypeForm.reset();
      this.isEdit = false;
    } catch (err) {
      this.toast.error(
        err?.error?.message || 
        err?.message || err ||
        this.translate.instant('alerts.notification-type.updateError'), this.translate.instant('alerts.notification-type.error'));
    }
  }
  confirmAction(): boolean {
    return window.confirm(this.translate.instant('alerts.notification-type.confirmDelete'));
  }

  openDialog(row: eventNotificationType): void {
        const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
          width: '400px',
          data: row,
        });
    
        dialogRef.afterClosed().subscribe((result) => {
          if (result === 'delete') {
            this.deleteNotificationType(row);
          }
          (err) => {
            this.toast.error('Can not be Deleted', 'Error!');
          };
        });
      }

  deleteNotificationType(status: eventNotificationType) {
    try {
      // const result = this.confirmAction();
      // if (result) {
        this.eventNotificationService.deleteEventNotificationType(status._id).subscribe((response: any) => {
          this.toast.success(this.translate.instant('alerts.notification-type.deleteSuccess'))
          this.getNotificationTypsList();
        })
      //}
    }
    catch (err) {
      this.toast.error(this.translate.instant('alerts.notification-type.deleteError'), this.translate.instant('alerts.notification-type.error'));
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

  onActionClick(event: { action: { label: string }, row: eventNotificationType }) {
    switch (event.action.label) {
      case 'Edit':
        this.editNotificationType(event.row);
        break;
      case 'Delete':
        this.openDialog(event.row);
        //this.deleteNotificationType(event.row);
        break;
    }
  }
  
  resetForm(){
    this.notificationTypeForm.reset();
  }

  noWhitespaceValidator(control: FormControl) {
    const isWhitespace = (control.value || '').trim().length === 0;
    const isValid = !isWhitespace;
    return isValid ? null : { whitespace: true };
  }
}
