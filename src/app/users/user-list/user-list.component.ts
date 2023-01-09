import { Component, OnInit } from '@angular/core';
import { signup, User } from 'src/app/models/user';
import { ManageTeamService } from 'src/app/_services/manage-team.service';
import { UserService } from '../users.service';
import { Validators, FormGroup, FormBuilder } from '@angular/forms';
import { AuthenticationService } from 'src/app/_services/authentication.service';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css'],
  providers: [UserService]
})

export class UserListComponent implements OnInit {
  teamOfUsers: User[] = [];
  allUsers: User[] = [];
  
  inviteUser: signup[]=[];

  searchText = '';
  p: number = 1;
  public users: Array<User> = [];
  date = new Date('MMM d, y, h:mm:ss a');
  selectedUser: any;
  addForm: FormGroup;

  constructor(private UserService: UserService, private fb: FormBuilder, private auth: AuthenticationService) {
   this.addForm = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    // role: ['Role', Validators.required],
    email: ['', Validators.required],
    password: ['', Validators.required],
    passwordConfirm: ['', Validators.required],
   })
  }
  ngOnInit() {
    this.populateTeamOfUsers();
  }

  populateTeamOfUsers() {
    this.UserService.getUserList().subscribe({
      next: result => {
        this.teamOfUsers = result.data.data;
        this.allUsers = result.data.data;
      },
      error: error => { }
    })
  }

  addUser(addForm) {
      //   let roleId = localStorage.getItem('roleId');
      //   this.auth.getRole(roleId).subscribe((response: any) => {
      //     console.log(response)
      //  response = this.UserService.addUser(addForm.roleId).subscribe({
      //   next: result => {
      //     console.log(result);
      //     this.populateTeamOfUsers();
      //   }
      // });
      //   });

    }      
 

  deleteUser(){
    this.UserService.deleteUser(this.selectedUser._id)
    .subscribe(response => {
      this.populateTeamOfUsers();
    });
  }

}

 