import { Component, OnInit } from '@angular/core';
import { ManageTeamService } from 'src/app/_services/manage-team.service';
import { User } from 'src/app/models/user'; 
import { UserService } from 'src/app/users/users.service';
import * as moment from 'moment';
@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.css'],
  providers:  [UserService]
})
export class TimelineComponent implements OnInit {
  teamOfUsers: User[] = [];
  allUsers: User[] = [];
  p: number = 1;
  public users: Array<User>=[];
  constructor(private UserService: UserService,private manageTeamService: ManageTeamService) { 
    this.UserService.getUserList()
    .subscribe(data => {        
     this.users=data.data.data;
    })
  }

  ngOnInit(): void {
    this.populateTeamOfUsers();
  }

  populateTeamOfUsers() {
    this.manageTeamService.getAllUsers().subscribe({
      next: result => {
        this.teamOfUsers = result.data.data;
        this.allUsers = result.data.data;
        console.log("team", this.teamOfUsers)
      },
      error: error => { }
    })
  }

}
