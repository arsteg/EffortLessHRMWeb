import { formatDate } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { RoleService } from 'src/app/_services/role.service';
import { UserService } from 'src/app/_services/users.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-employee-profile',
  templateUrl: './employee-profile.component.html',
  styleUrl: './employee-profile.component.css'
})

export class EmployeeProfileComponent {
  userForm: FormGroup;
  roles: any;
  selectedUser: any;
  isEdit = this.userService.getIsEdit();

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private toast: ToastrService,
    private roleService: RoleService,
    private router: Router
  ) {
    this.userForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.pattern('^[A-Za-z]{2,}$')]],
      lastName: ['', [Validators.pattern('^[A-Za-z]{2,}$')]],
      jobTitle: [''],
      address: [''],
      city: [''],
      state: [''],
      extraDetails: [''],
      role: ['', Validators.required],
      email: ['', Validators.email],
      phone: [, [Validators.pattern('^[0-9]{10}$')]],
      mobile: [, [Validators.pattern('^[0-9]{10}$')]],
      pincode: [, [Validators.pattern('^[0-9]{6}$')]],
      emergancyContactName: [''],
      emergancyContactNumber: [],
      Gender: [''],
      DOB: [''],
      MaritalStatus: ['Unmarried'],
      MarraigeAniversary: [''],
      PassportDetails: [''],
      Pancard: [''],
      AadharNumber: [''],
      Disability: ['no'],
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
    this.logUrlSegmentsForUser();
    this.getRoles();
  }

  logUrlSegmentsForUser() {
    const urlPath = this.router.url;
    const segments = urlPath.split('/').filter(segment => segment);
    if (segments.length >= 3) {
      const employee = segments[segments.length - 3];
      this.userService.getUserByEmpCode(employee).subscribe((res: any) => {
        const formattedDOB = res?.data[0]?.DOB ? formatDate(res?.data[0]?.DOB, 'yyyy-MM-dd', 'en') : null;
        const formattedMarriageAniversary = res.data[0]?.MarraigeAniversary ? formatDate(res.data[0]?.MarraigeAniversary, 'yyyy-MM-dd', 'en') : null;
        this.userForm.patchValue({
          ...res.data[0],
          role: res?.data[0]?.role ? res?.data[0]?.role?.id : '',
          DOB: formattedDOB,
          MarraigeAniversary: formattedMarriageAniversary
        });
        this.selectedUser = res.data;
        if (this.isEdit) {
          this.userForm.get('email').disable();
        }
      })
    }
  }

  onSubmit() {
    if (this.userForm.valid) {
      this.userService.updateUser(this.selectedUser[0].id, this.userForm.value).subscribe(
        (res: any) => this.toast.success('User Updated Successfully'),
        (err) => { this.toast.error('User Update Failed') }
      );
    } else {
      this.toast.error('Please fill all required fields correctly.');
    }
  }

  getRoles() {
    this.roleService.getAllRole().subscribe((res: any) => {
      this.roles = res.data;
    })
  }

  onResetForm() {
    this.ngOnInit();
  }
}