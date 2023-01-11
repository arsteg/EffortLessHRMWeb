import { DatePipe, KeyValue } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Subordinate } from 'src/app/models/subordinate.Model';
import { User } from 'src/app/models/user';
import { ManageTeamService } from 'src/app/_services/manage-team.service';
import { TimeLogService } from 'src/app/_services/timeLogService';
import { ToastrService } from 'ngx-toastr';

export class Hero {
  id: number;
  name: string;
}

@Component({
  selector: 'app-teammembers',
  templateUrl: './teammembers.component.html',
  styleUrls: ['./teammembers.component.css']
})
export class TeammembersComponent implements OnInit, OnDestroy {
  //#region Private Members
  resetToken: null;
  teamOfUsers: User[] = [];
  allUsers: User[] = [];
  selectedUsers: any;
  selectedUser: any;
  selectedManager: any;
  subscription: Subscription;
  message: [] = [];
  selectedValue: any;

  onSelect(user: User): void {
    this.selectedUser = user;
  }

  //#endregion

  //#region Constructor

  constructor(private manageTeamService: ManageTeamService,
    private timeLogService: TimeLogService,
    private route: ActivatedRoute,
    private router: Router,
    private datePipe: DatePipe,
    private toastt: ToastrService) 
    {
    this.route.params.subscribe(params => {
      this.resetToken = params['token'];
    });
  }
  //#endregion
  ngOnInit(): void {
    this.populateTeamOfUsers();
    this.subscription = this.timeLogService.currentMessage.subscribe(message => this.selectedValue = message)
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
        this.teamOfUsers.forEach((user:any, index:number)=>{
        if(user.id==currentUser.id){
            this.selectedManager = user;
            this.Selectmanager(user);
        }});
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
            this.teamOfUsers.forEach((user:any, index:number)=>{
              user['isChecked'] = this.selectedUsers.some((selectedUser:any)=>selectedUser.id == user.id);
            });
            //  debugger;
            // let arr = [];
            // this.selectedValue =JSON.parse(user.target.value);
            // arr.push(this.selectedValue)
            // console.log(arr);
            // this.timeLogService.changeMessage(arr);
      
          
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



  onAddMember(user: User) {
    let currentDate = new Date();
    let subordinate = new Subordinate(this.selectedManager, user.id, currentDate, this.selectedManager);
    this.manageTeamService.addSubordinate(subordinate).subscribe(result => {
        this.toastt.success('Selected', 'Successfully Added!')

      },
      err => {
      this.toastt.error(' Can not be Selected', 'Error!')
      }
    );
  }

  onRemoveMember(user: User) {
    let currentDate = new Date();
    let subordinate = new Subordinate(this.selectedManager, user.id, currentDate, this.selectedManager);
    this.manageTeamService.deleteSubordinate(this.selectedManager, user.id,).subscribe({
      next: result => {
      },
      error: error => { }
    });
  }

}

