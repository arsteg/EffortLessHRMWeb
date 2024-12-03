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
  roles: any;
  selectedUser = this.userService.getData();
  isEdit = this.userService.getIsEdit();

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private toast: ToastrService,
    private timelogService: TimeLogService,
    private roleService: RoleService,
  ) {
    this.userForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.pattern('^[A-Za-z]{2,}$')]],
      lastName: ['', [Validators.required, Validators.pattern('^[A-Za-z]{2,}$')]],
      jobTitle: [''],
      address: [''],
      city: [''],
      state: [''],
      extraDetails: [''],
      role: ['', Validators.required],
      email: ['', Validators.email],
      phone: ['', [Validators.pattern('^[0-9]{10}$')]],
      mobile: ['', [Validators.pattern('^[0-9]{10}$')]],
      pincode: ['', [Validators.pattern('^[0-9]{6}$')]],
      emergancyContactName: [''],
      emergancyContactNumber: [''],
      Gender: [''],
      DOB: [],
      MaritalStatus: ['Unmarried'],
      MarraigeAniversary: [],
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
    }, { validator: this.passwordMatchValidator });
    this.userForm.get('email').disable();
  }

  ngOnInit() {
    console.log(this.selectedUser?.id);
    this.timelogService.getusers(this.selectedUser?.id).subscribe((res: any) => {
      const formattedDOB = res?.data[0]?.DOB ? formatDate(res?.data[0]?.DOB, 'yyyy-MM-dd', 'en') : null;
      const formattedMarriageAniversary = res.data[0]?.MarraigeAniversary ? formatDate(res.data[0]?.MarraigeAniversary, 'yyyy-MM-dd', 'en') : null;
      this.userForm.patchValue({
        ...res.data[0],
        role: res?.data[0]?.role || res?.data[0]?.role?.id || '',
        DOB: formattedDOB,
        MarraigeAniversary: formattedMarriageAniversary
      });
      console.log(this.userForm.value);
      if (this.isEdit) {
        this.userForm.get('email').disable();
      }
    })
    this.getRoles();
  }

  passwordMatchValidator(group: FormGroup) {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('passwordConfirm')?.value;
    return password === confirmPassword ? null : { notMatching: true };
  }

  getErrorMessage(field: string): string {
    const control = this.userForm.get(field);
    if (control?.hasError('required')) {
      return `${field.charAt(0).toUpperCase() + field.slice(1)} is required.`;
    }
    if (control?.hasError('email')) {
      return 'Please enter a valid email address.';
    }
    if (control?.hasError('pattern')) {
      if (field === 'phone' || field === 'mobile') {
        return 'Please enter a valid 10-digit number.';
      }
      if (field === 'pincode') {
        return 'Please enter a valid 6-digit pincode.';
      }
    }
    return '';
  }


  onSubmit() {
    this.userService.updateUser(this.selectedUser.id, this.userForm.value).subscribe(
      (res: any) => this.toast.success('User Updated Successfully'),
      (err) => { this.toast.error('User Update Failed') }
    );
  }


  getRoles() {
    this.roleService.getAllRole().subscribe((res: any) => {
      this.roles = res.data;
    })
  }
}