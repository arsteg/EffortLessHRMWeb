import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/models/user';
import { ManageTeamService } from 'src/app/_services/manage-team.service';
import { UserService } from 'src/app/users/users.service';

@Component({
  selector: 'app-attendance',
  templateUrl: './attendance.component.html',
  styleUrls: ['./attendance.component.css'],
  providers: [UserService]
})
export class AttendanceComponent implements OnInit {
  teamOfUsers: User[] = [];
  // allUsers: User[] = [];

  searchText = '';
  p: number = 1;
  public users: Array<User> = [];
  constructor(private UserService: UserService, private manageTeamService: ManageTeamService) {
    // this.UserService.getUserList()
    //   .subscribe(data => {
    //     this.users = data.data.data;
    //   })
    
  }
  ngOnInit() {
    // this.populateTeamOfUsers();
  }

  // populateTeamOfUsers() {
  //   this.manageTeamService.getAllUsers().subscribe({
  //     next: result => {
  //       this.teamOfUsers = result.data.data;
  //       this.allUsers = result.data.data;
  //       console.log("team", this.teamOfUsers)
  //     },
  //     error: error => { }
  //   })
  // }
}
