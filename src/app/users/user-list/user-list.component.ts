import { Component, OnInit } from '@angular/core';
import { signup, User } from 'src/app/models/user';
import { ManageTeamService } from 'src/app/_services/manage-team.service';
import { UserService } from '../../_services/users.service';
import { Validators, FormGroup, FormBuilder } from '@angular/forms';
import { AuthenticationService } from 'src/app/_services/authentication.service';
import { RoleService } from 'src/app/_services/role.service';
import { TransitionCheckState } from '@angular/material/checkbox';
import { ToastrService } from 'ngx-toastr';
import { CommonService } from 'src/app/_services/common.Service';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { ActivatedRoute, Router } from '@angular/router';

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
  public sortOrder: string = '';
  showEmployeeDetails = false;
  selectedEmployee: any;
  isEdit: boolean = false;
  userForm: FormGroup;
  roles: any;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private UserService: UserService,
    private fb: FormBuilder,
    private auth: AuthenticationService,
    private roleService: RoleService,
    private toastrrr: ToastrService,
    public commonservice: CommonService) {
    this.addForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.pattern('[a-zA-Z ]*')]],
      lastName: ['', [Validators.required, Validators.pattern('[a-zA-Z ]*')]],
      role: ['', Validators.required],
      email: ['', Validators.required],
      password: ['', Validators.required],
      passwordConfirm: ['', Validators.required],
    },
      { validator: this.passwordMatchValidator }
    );
    this.userForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: [''],
      password: [''],
      passwordConfirm: [''],
      jobTitle: [''],
      address: [''],
      city: [''],
      state: [''],
      pincode: [''],
      phone: [''],
      extraDetails: [''],
      role: ['', Validators.required],
      mobile: [''],
      emergancyContactName: [''],
      emergancyContactNumber: [''],
      Gender: [''],
      DOB: [],
      MaritalStatus: [''],
      MarraigeAniversary: [],
      PassportDetails: [''],
      Pancard: [''],
      AadharNumber: [''],
      Disability: [''],
      FatherHusbandName: [''],
      NoOfChildren: [''],
      BankName: [''],
      BankAccountNumber: [''],
      BankIFSCCode: [''],
      BankBranch: [''],
      BankAddress: ['']
    });
  }

  ngOnInit() {
    this.getRoles();
    this.getAllRoles();
    this.commonservice.populateUsers().subscribe(result => {
      this.usersList = result && result.data && result.data.data;
    });
    this.firstLetter = this.commonservice.firstletter;
  }

  passwordMatchValidator(formGroup: FormGroup) {
    const passwordControl = formGroup.get('password');
    const confirmPasswordControl = formGroup.get('passwordConfirm');

    if (passwordControl.value === confirmPasswordControl.value) {
      confirmPasswordControl.setErrors(null);
    } else {
      confirmPasswordControl.setErrors({ mismatch: true });
    }
  }

  drop(event: CdkDragDrop<any[]>) {
    moveItemInArray(this.usersList, event.previousIndex, event.currentIndex);
  }

  getAllRoles() {
    this.roleService.getAllRole().subscribe(response => {
      this.roleName = response.data;
    })
  }

  getRoleName(id) {
    let rolename = this.roleName.find((role) => { return role.id == id; });
    if (rolename && rolename.Name) {
      return rolename.Name
    } else { return 'Employee' }
  }

  getRoles() {
    this.roleService.getAllRole().subscribe((res: any) => {
      this.roles = res.data;
    })
  }

  addUser() {
    // if (this.addForm.valid) {
    this.UserService.addUser(this.userForm.value).subscribe(result => {
      const users = result['data'].User;
      this.usersList.push(users);
      this.toastrrr.success('New User Added', 'Successfully Added!');
    }, err => {
      this.toastrrr.error('User with this Email already Exists', 'Duplicate Email!')
    });
    this.userForm.reset();
    // }
    // else {
    //   this.markFormGroupTouched(this.addForm);
    // }
  }

  // markFormGroupTouched(formGroup: FormGroup) {
  //   Object.values(formGroup.controls).forEach(control => {
  //     control.markAsTouched();

  //     if (control instanceof FormGroup) {
  //       this.markFormGroupTouched(control);
  //     }
  //   });
  // }

  deleteUser() {
    this.UserService.deleteUser(this.selectedUser._id)
      .subscribe(response => {
        this.ngOnInit();
        this.toastrrr.success('Existing User Deleted', 'Successfully Deleted!')
      }, err => {
        this.toastrrr.error('Can not be Deleted', 'ERROR!')
      })
  }

  clearForm() {
    this.addForm.reset();
  }

  toggleView(data: any) {
    this.isEdit = true;
    this.UserService.setData(data, this.isEdit);
    this.router.navigate(['/manage/employee-settings']);
    this.showEmployeeDetails = !this.showEmployeeDetails;
  }

  goBackToUserView() {
    this.showEmployeeDetails = false;
  }
}