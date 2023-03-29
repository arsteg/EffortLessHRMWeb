import { Component, OnInit } from '@angular/core';
import { CommonService } from '../common/common.service';
import { ManageTeamService } from '../_services/manage-team.service';
import { TimeLogService } from '../_services/timeLogService';
import { FormControl } from '@angular/forms';
import { AuthenticationService } from '../_services/authentication.service';
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  selectedManager: any;
  selectedUsers: any;
  selectedUser: any;
  teamOfUsers: any[];
  firstLetter: string;
  color: string;
  currentUser = JSON.parse(localStorage.getItem('currentUser'));
  date = new FormControl(new Date());
  serializedDate = new FormControl(new Date().toISOString());
  currentProfile: any;
  role=  localStorage.getItem('roleName');

  constructor(
    private timelog: TimeLogService,
    private manageTeamService: ManageTeamService,
    public commonService: CommonService,
    private auth: AuthenticationService
  ) {

  }

  ngOnInit(): void {
    this.populateTeamOfUsers();
    this.firstLetter = this.commonService.firstletter;
   
    let currentUser = JSON.parse(localStorage.getItem('currentUser'))
    this.auth.GetMe(currentUser.id).subscribe((response: any) => {
      this.currentProfile = response && response.data.users;
      return this.currentProfile;
    });
console.log(this.role)
  }

  populateTeamOfUsers() {
    this.manageTeamService.getAllUsers().subscribe({
      next: result => {
        this.teamOfUsers = result.data.data;
        let currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.teamOfUsers.forEach((user: any, index: number) => {
          if (user.id == currentUser.id) {
            this.selectedManager = user;
            this.teamLead(user);
          }
        });
      },
      error: error => { }
    })
  }

  teamLead(user: any) {
    this.selectedManager = user;
    this.timelog.getTeamMembers(user.id).subscribe({
      next: response => {
        this.timelog.getusers(response.data).subscribe({
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

}
