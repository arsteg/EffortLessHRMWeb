import { Component, OnInit } from '@angular/core';
import { signup, User } from 'src/app/models/user';
import { ManageTeamService } from 'src/app/_services/manage-team.service';
import { UserService } from '../../_services/users.service';
import { Validators, FormGroup, FormBuilder } from '@angular/forms';
import { AuthenticationService } from 'src/app/_services/authentication.service';
import { RoleService } from 'src/app/_services/role.service';
import { TransitionCheckState } from '@angular/material/checkbox';
import { ToastrService } from 'ngx-toastr';
import { CommonService } from 'src/app/common/common.service';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css'],
})

export class UserListComponent implements OnInit {
  usersList: any[];
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
  public sortOrder: string = ''; // 'asc' or 'desc'

  constructor(
    private UserService: UserService,
    private fb: FormBuilder,
    private auth: AuthenticationService,
    private roleService: RoleService,
    private toastrrr: ToastrService,
    public commonservice: CommonService) {
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
      jobTitle: [''],
      pincode: ['',  Validators.pattern('^[0-9]{6}$')],
      state: ['',Validators.pattern('[A-Za-z]+')],
      city: ['', Validators.pattern('[A-Za-z]+')],
      phone: ['', Validators.pattern('[0-9]{10}')],
      address: [''],
      role: ['']
    });
  }

  ngOnInit() {
    this.getAllRoles();
    this.commonservice.populateUsers().subscribe(result => {
      this.usersList = result && result.data && result.data.data;
    });
    this.firstLetter = this.commonservice.firstletter;
  }
  drop(event: CdkDragDrop<any[]>) {
    moveItemInArray(this.usersList, event.previousIndex, event.currentIndex);
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
      this.ngOnInit();
      this.toastrrr.success('New User Added', 'Successfully Added!')
    },
      err => {
        this.toastrrr.error('Can not be Added', 'ERROR!')
      })
  }

  deleteUser() {
    this.UserService.deleteUser(this.selectedUser._id)
      .subscribe(response => {
        this.ngOnInit();
        this.toastrrr.success('Existing User Deleted', 'Successfully Deleted!')
      },
        err => {
          this.toastrrr.error('Can not be Deleted', 'ERROR!')
        })
  }

  updateUser(updateForm) {
    this.UserService.updateUser(this.selectedUser._id, updateForm).subscribe(resonse => {
      this.ngOnInit();
      this.toastrrr.success('Existing User Updated', 'Successfully Updated!')
    },
      err => {
        this.toastrrr.error('Can not be Updated', 'ERROR!')
      })
  }

}

