import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TimeLogService } from 'src/app/_services/timeLogService';
import { teamMember } from 'src/app/models/teamMember';

@Component({
  selector: 'subordinateSelection',
  templateUrl: './subordinateSelection.component.html',
  styleUrls: ['./subordinateSelection.component.css']
})
export class SubordinateSelectionComponent implements OnInit {
  @Output() selectedUsersChange: EventEmitter<string> = new EventEmitter<string>();
  @Output() selectedUserNameChange: EventEmitter<string> = new EventEmitter<string>();
  members: any;
  member: any;
  user: any;
  constructor(private timeLogService: TimeLogService) { }

  ngOnInit(): void {
    this.populateMembers();
    if (this.members && this.members.length > 0) {
      this.user = this.members[0]; // Set the default user to the first member
      this.selectedUsersChange.emit(this.user.id);
      
    }
  }

  emitSelectedUsers(member): void {
    const user = JSON.parse(member)
    this.selectedUsersChange.emit(user.id);
    this.selectedUserNameChange.emit(user?.name)


  }
  filterData() {
    //this.getAttendance();
  }

  populateMembers() {
    this.members = [];
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.members.push({ id: currentUser.id, name: "Me", email: currentUser.email });
    this.member = currentUser;
    this.timeLogService.getTeamMembers(this.member.id).subscribe({
      next: response => {
        this.timeLogService.getusers(response.data).subscribe({
          next: result => {
            result.data.forEach(user => {
              if (user.id != currentUser.id) {
                this.members.push({ id: user.id, name: `${user.firstName} ${user.lastName}`, email: user.email });
              }
            })
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

}
