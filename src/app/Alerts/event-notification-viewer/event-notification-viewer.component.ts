import { Component, OnInit } from '@angular/core';
import { SharedModule } from 'src/app/shared/shared.Module';
import { eventNotification, UserNotification } from 'src/app/models/eventNotification/eventNotitication';
import { User } from 'src/app/models/user';
import { FormBuilder } from '@angular/forms';
import { EventNotificationService } from 'src/app/_services/eventNotification.Service';
import { ToastrService } from 'ngx-toastr';
import { UserService } from 'src/app/_services/users.service';
import { Subscription, lastValueFrom } from 'rxjs';
import { ManageTeamService } from 'src/app/_services/manage-team.service';
import { TimeLogService } from 'src/app/_services/timeLogService';
import { Subordinate } from 'src/app/models/subordinate.Model';

@Component({
  selector: 'app-event-notification-viewer',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './event-notification-viewer.component.html',
  styleUrl: './event-notification-viewer.component.css'
})
export class EventNotificationViewerComponent implements OnInit{
   //#region Private Members
   resetToken: null;
   teamOfUsers: User[] = [];
   allUsers: User[] = [];
   selectedUsers: any;
   selectedUser: any;
   selectedManager: any;
   message: [] = [];
   subscription: Subscription;
   selectedValue: any;

  constructor(private fb: FormBuilder, private eventNotificationService: EventNotificationService,
    private userService:UserService, private manageTeamService:ManageTeamService, private timeLogService:TimeLogService,
    private toast: ToastrService) { }

  //#endregion
  ngOnInit(): void {
    this.populateTeamOfUsers();
    //this.subscription = this.timeLogService.currentMessage.subscribe(message => this.selectedValue = message)
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  //#region Private methods
  populateTeamOfUsers() {
    this.manageTeamService.getAllUsers().subscribe({
      next: result => {
        this.teamOfUsers = result.data.data;
        this.allUsers = result.data.data;
        let currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.teamOfUsers.forEach((user: any, index: number) => {
          if (user.id == currentUser.id) {
            this.selectedManager = user;
            this.Selectmanager(user);
          }
        });
      },
      error: error => { }
    })
  }

  Selectmanager(user: any) {
    this.selectedManager = user;
    this.timeLogService.getTeamMembers(user.id).subscribe({
      next: response => {
        this.timeLogService.getusers(response.data).subscribe({
          next: result => {
            this.selectedUsers = result.data;
            this.teamOfUsers.forEach((user: any, index: number) => {
              user['isChecked'] = this.selectedUsers.some((selectedUser: any) => selectedUser.id == user.id);

            });
          },
          error: error => {
            console.log('There was an error!', error);
          }
        });
      },
      error: error => {
        console.log('There was an error!', error);
      }
    });
  }

  onModelChange(isChecked, user: User) {
    if (isChecked) {
      let subordinate: any = new Subordinate(this.selectedManager, user.id);
      this.manageTeamService.addSubordinate(subordinate).subscribe(result => {
        this.toast.success(user.firstName + (' ')+ user.lastName, 'Successfully Assigned!')

      },
        err => {
          this.toast.error(' Can not be Selected', user.firstName + (' ')+ user.lastName)
        }
      );
    } else {
        this.manageTeamService.deleteSubordinate(this.selectedManager, user.id).subscribe(result => {
        this.toast.success(user.firstName + (' ')+ user.lastName, 'Successfully Deleted!')
      },
        err => {
          this.toast.error('Can not be Deleted', user.firstName + (' ')+ user.lastName,)
        }
      );
    }
  }
  removeField(index, value) {
    this.selectedManager.splice(index, 1);
    this.selectedManager.map((x) => {
      if (x.Name === value) {
        x.isChecked = false;
      }
    });
  }










}
