import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { RoleService } from 'src/app/_services/role.service';
import { UserService } from 'src/app/_services/users.service';

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
    private roleService: RoleService,
    private cdr: ChangeDetectorRef
  ) {
    this.userProfileForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: [''],
      jobTitle: [''],
      address: [''],
      city: [''],
      state: [''],
      pincode: ['', [Validators.pattern('^[0-9]{6}$')]],
      phone: ['', [Validators.pattern('^[0-9]{10}$')]],
      extraDetails: [''],
      role: ['', Validators.required],
      mobile: [''],
      emergancyContactName: [''],
      emergancyContactNumber: [''],
      Gender: [''],
      DOB: [],
      MaritalStatus: ['Unmarried'],
      MarraigeAniversary: [],
      PassportDetails: [''],
      Pancard: [''],
      AadharNumber: [''],
      Disability: ['No'],
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
    console.log(this.currentProfile);
    this.getRoles();
    this.getUserById();
  }

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
    console.log(this.userProfileForm.value);
    this.userService.updateUser(this.currentProfile?.id, this.userProfileForm.value).subscribe((res: any) => {
      this.toast.success('Your profile has been updated successfully.', 'Update Successful');
    },
      err => {
        this.toast.error('Your profile can not be updated', 'Error!')
      })
  }
}