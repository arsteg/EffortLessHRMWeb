import { Component, OnInit } from '@angular/core';
import { signup, User } from 'src/app/models/user';
import { ManageTeamService } from 'src/app/_services/manage-team.service';
import { UserService } from '../users.service';
import { Validators, FormGroup, FormBuilder } from '@angular/forms';
import { AuthenticationService } from 'src/app/_services/authentication.service';
import { RoleService } from 'src/app/_services/role.service';
import { TransitionCheckState } from '@angular/material/checkbox';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css'],
  providers: [UserService]
})

export class UserListComponent implements OnInit {
  teamOfUsers: User[] = [];
  allUsers: User[] = [];

  inviteUser: signup[] = [];

  searchText = '';
  p: number = 1;
  public users: Array<User> = [];
  date = new Date('MMM d, y, h:mm:ss a');
  selectedUser: any;
  addForm: FormGroup;
  updateForm: FormGroup
  roleName: any = [];


  constructor(
    private UserService: UserService,
    private fb: FormBuilder,
    private auth: AuthenticationService,
    private roleService: RoleService,
    private toastrrr: ToastrService) {
    this.addForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      role: ['', Validators.required],
      email: ['', Validators.required],
      password: ['', Validators.required],
      passwordConfirm: ['', Validators.required],
    });
    this.updateForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', Validators.required],
    });
  }

  ngOnInit() {
    this.populateTeamOfUsers();
    this.getAllRoles();
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

  getAllRoles() {
    this.roleService.getAllRole().subscribe(
      response => {
        this.roleName = response.data;
      })
  }
  getRoleName(id)
   {
    let rolename = this.roleName.find((role) => {   return role.id == id;  });
    if(rolename && rolename.Name){
      return rolename.Name
    }
    else 
    {return 'Employee' }
   
  }

  addUser(addForm) {
    this.UserService.addUser(addForm).subscribe(result => {
      this.populateTeamOfUsers();
      this.toastrrr.success('New User Added', 'Successfully Added!')
    },
      err => {
        this.toastrrr.error('Can not be Added', 'ERROR!')
      })
  }

  deleteUser() {
    this.UserService.deleteUser(this.selectedUser._id)
      .subscribe(response => {
        this.populateTeamOfUsers();
        this.toastrrr.success('Existing User Deleted', 'Successfully Deleted!')
      },
        err => {
          this.toastrrr.error('Can not be Deleted', 'ERROR!')
        })
  }

  updateUser(updateForm) {
    this.UserService.updateUser(this.selectedUser._id, updateForm).subscribe(resonse => {
      this.populateTeamOfUsers();
      this.toastrrr.success('Existing User Updated', 'Successfully Updated!')
    },
      err => {
        this.toastrrr.error('Can not be Updated', 'ERROR!')
      })
  }

  getColor(char: string): string {
    switch (char) {
        case 'A':
            return 'A';
        case 'B':
            return 'B';
        case 'C':
            return 'C';
        case 'D':
          return 'D';
          case 'E':
            return 'E';
            case 'R':
            return 'R';
        default:
            return 'defaults';
    }
}

}

