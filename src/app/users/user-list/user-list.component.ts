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
  firstLetter: string;
  color: string;

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

getRandomColor(lastName: string) {
  let colorMap = {
    A: '#556def',
    B: '#faba5c',
    C: '#0000ff',
    D: '#ffff00',
    E: '#00ffff',
    F: '#ff00ff',
    G: '#f1421d',
    H: '#1633eb',
    I: '#f1836c',
    J: '#824b40',
    K: '#256178',
    L: '#0d3e50',
    M: '#3c8dad',
    N: '#67a441',
    O: '#dc57c3',
    P: '#673a05',
    Q: '#ec8305',
    R: '#00a19d',
    S: '#2ee8e8',
    T: '#5c9191',
    U: '#436a2b',
    V: '#dd573b',
    W: '#424253',
    X: '#74788d',
    Y: '#16cf96',
    Z: '#4916cf'
  };
  this.firstLetter= lastName.charAt(0).toUpperCase();
  return colorMap[this.firstLetter] || '#000000';
}
}

