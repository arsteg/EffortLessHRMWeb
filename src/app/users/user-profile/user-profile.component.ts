import { Component, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { signup } from 'src/app/models/user';
import { Base } from '../../controls/base';
import { UserService } from '../../_services/users.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { RoleService } from 'src/app/_services/role.service';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css'],
  providers: [UserService]
})

export class UserProfileComponent {

  @Input() currentProfile: any;
  userProfileForm: FormGroup;
  roles: any;
  roleName: any;

  constructor(private fb: FormBuilder,
    private userService: UserService,
    private toast: ToastrService,
    private roleService: RoleService
  ) {
    this.userProfileForm = this.fb.group({
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
    })
  }

  ngOnInit() {
    this.getRoles();
    // this.getAllRoles();
    this.getUserById();
  }

  // getAllRoles() {
  //   this.roleService.getAllRole().subscribe(response => {
  //     this.roleName = response.data;
  //   })
  // }

  getRoles() {
    this.roleService.getAllRole().subscribe((res: any) => {
      this.roles = res.data;
    })
  }
  getUserById() {
    let payload = {
      userId: this.currentProfile?.id
    }
    console.log(payload);
    this.userService.getUserById(payload).subscribe((res: any) => {
      const result = res.data[0];
      this.userProfileForm.patchValue(result);
      this.userProfileForm.patchValue({
        role: result.role.id
      })
    })
  }

  fetchUserProfile() {
    this.getUserById();
  }

  onUpdate() {
    this.userService.updateUser(this.currentProfile?.id, this.userProfileForm.value).subscribe((res: any) => {
      this.toast.success('Your profile has been updated successfully.', 'Update Successful');
    },
      err => {
        this.toast.error('Your profile can not be updated', 'Error!')
      })
  }
}