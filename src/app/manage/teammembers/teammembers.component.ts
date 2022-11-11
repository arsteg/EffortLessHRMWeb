import { DatePipe, KeyValue } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subordinate } from 'src/app/models/subordinate.Model';
import { User } from 'src/app/models/user';
import { ManageTeamService} from 'src/app/_services/manage-team.service';
import { TimeLogService } from 'src/app/_services/timeLogService';

export class Hero{
id:number;
name:string;
}

@Component({
  selector: 'app-teammembers',
  templateUrl: './teammembers.component.html',
  styleUrls: ['./teammembers.component.css']
})
export class TeammembersComponent implements OnInit {
//#region Private Members
resetToken: null;
teamOfUsers:User[]=[];
allUsers:User[]=[];
selectedUsers:User[]=[];
selectedUser?: User;
selectedManager:string;

onSelect(user: User): void {
  this.selectedUser = user;
}

//#endregion

//#region Constructor
constructor(private manageTeamService:ManageTeamService, private timeLogService:TimeLogService,
  private route: ActivatedRoute,
  private router: Router,
  private datePipe: DatePipe) {
  this.route.params.subscribe(params => {
    this.resetToken = params['token'];
    });
}
//#endregion
  ngOnInit(): void {
    this.populateTeamOfUsers();
  }
  //#region Private methods
  populateTeamOfUsers(){
    this.manageTeamService.getAllUsers().subscribe({
    next:result=>{
      this.teamOfUsers = result.data.data;
      this.allUsers = result.data.data;
    },
    error:error=>{}
    })
  }

  Selectmanager(event:any){
    this.timeLogService.getTeamMembers(event.target.value).subscribe({
      next: response => {
        this.timeLogService.getusers(response.data).subscribe({
          next: result => {
            this.selectedUsers = result.data;
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

  onAddMember(user:User){
    let currentDate = new Date();
    let subordinate= new Subordinate(this.selectedManager,user.id,currentDate,this.selectedManager);
    this.manageTeamService.addSubordinate(subordinate).subscribe({
    next: result=>{
    },
    error: error=>{}
   });
  }

  onRemoveMember(user:User){
    let currentDate = new Date();
    let subordinate= new Subordinate(this.selectedManager,user.id,currentDate,this.selectedManager);
    this.manageTeamService.deleteSubordinate(this.selectedManager,user.id,).subscribe({
    next: result=>{
    },
    error: error=>{}
   });
  }
  
}

