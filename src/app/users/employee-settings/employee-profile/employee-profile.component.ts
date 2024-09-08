import { formatDate } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { RoleService } from 'src/app/_services/role.service';
import { TimeLogService } from 'src/app/_services/timeLogService';
import { UserService } from 'src/app/_services/users.service';

@Component({
  selector: 'app-employee-profile',
  templateUrl: './employee-profile.component.html',
  styleUrl: './employee-profile.component.css'
})
export class EmployeeProfileComponent {
  userForm: FormGroup;
  @Input() selectedUser: any;
  roles: any;
  @Input() isEdit: boolean = false;

  constructor(private fb: FormBuilder,
    private userService: UserService,
    private toast: ToastrService,
    private timelogService: TimeLogService,
    private roleService: RoleService,
  ) {
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
    if (this.isEdit) {
      this.timelogService.getusers(this.selectedUser.id).subscribe((res: any) => {
        const formattedDOB = res.data[0].DOB ? formatDate(res.data[0].DOB, 'yyyy-MM-dd', 'en') : null;
        const formattedMarriageAniversary = res.data[0].MarraigeAniversary ? formatDate(res.data[0].MarraigeAniversary, 'yyyy-MM-dd', 'en') : null;
        this.userForm.patchValue({
          ...res.data[0],
          role: res.data[0].role.id,
          DOB: formattedDOB,
          MarraigeAniversary: formattedMarriageAniversary
        });
      })
    }
    this.getRoles();
  }

  onSubmit() {
    console.log(this.userForm.value);
    if (this.isEdit) {
      if (this.userForm.valid) {
        this.userService.updateUser(this.selectedUser.id, this.userForm.value).subscribe((res: any) => {
          this.toast.success('User Updated Successfully');
        },
          err => {
            this.toast.error('User Update Failed');
          })
      }
    }
    else {
      this.userService.addUser(this.userForm.value).subscribe((res: any) => {
        this.toast.success('User Created Successfully');
      })
    }
  }

  getRoles() {
    this.roleService.getAllRole().subscribe((res: any) => {
      this.roles = res.data;
    })
  }
}
