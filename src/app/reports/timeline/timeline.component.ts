import { Component, OnInit } from '@angular/core';
import { ManageTeamService } from 'src/app/_services/manage-team.service';
import { User } from 'src/app/models/user'; 

@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.css']
})
export class TimelineComponent implements OnInit {
  teamOfUsers: User[] = [];
  allUsers: User[] = [];

  constructor(private manageTeamService: ManageTeamService) { }

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
