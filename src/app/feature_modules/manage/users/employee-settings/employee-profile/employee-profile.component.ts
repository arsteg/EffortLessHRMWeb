import { formatDate } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { RoleService } from 'src/app/_services/role.service';
import { UserService } from 'src/app/_services/users.service';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthenticationService } from 'src/app/_services/authentication.service';
import { CustomValidators } from 'src/app/_helpers/custom-validators';
import { TranslateService } from '@ngx-translate/core';
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
  bsValue = new Date();

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    public authService: AuthenticationService,
    private toast: ToastrService,
    private roleService: RoleService,
    private translate: TranslateService,
    private router: Router,
    private route: ActivatedRoute
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
      phone: [, [Validators.pattern('^[0-9]{10}$')]],
      mobile: [, [Validators.pattern('^[0-9]{10}$')]],
      pincode: [, [Validators.pattern('^[0-9]{6}$')]],
      emergancyContactName: [''],
      emergancyContactNumber: ['', [CustomValidators.digitsOnly, CustomValidators.phoneNumber]],
      Gender: [''],
      DOB: [''],
      MaritalStatus: ['Unmarried'],
      MarraigeAniversary: [''],
      PassportDetails: [''],
      Pancard: ['', [Validators.required, CustomValidators.panCard]],
      AadharNumber: ['', [Validators.required, CustomValidators.digitsOnly, CustomValidators.aadharNumber]],
      Disability: ['no'],
      FatherHusbandName: [''],
      NoOfChildren: [''],
      BankName: ['', [Validators.required, CustomValidators.bankName]],
      BankAccountNumber: ['', [Validators.required, CustomValidators.digitsOnly, CustomValidators.bankAccountNumber]],
      BankIFSCCode: ['', [Validators.required, CustomValidators.ifscCode]],
      BankBranch: ['', [Validators.required, CustomValidators.bankBranch]],
      BankAddress: ['', [Validators.required, CustomValidators.bankAddress]]
    });
  }

  ngOnInit() {
    this.logUrlSegmentsForUser();
    this.getRoles();
  }

  logUrlSegmentsForUser() {
    const empCode = this.route.parent.snapshot.paramMap.get('empCode') || this.authService.currentUserValue?.empCode;
    if (empCode) {
      this.userService.getUserByEmpCode(empCode).subscribe((res: any) => {
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
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      this.toast.error(this.translate.instant('common.missing_required_Field'), this.translate.instant('common.validation_error'));
      return;
    }
    // if (this.userForm.valid) {
      this.userService.updateUser(this.selectedUser[0].id, this.userForm.value).subscribe(
        (res: any) =>  this.toast.success(this.translate.instant('manage.users.employee-settings.employee_profile_updated'), this.translate.instant('common.success'))
        ,
        (err) => {  const errorMessage = err?.error?.message || err?.message || err 
          || this.translate.instant('manage.users.employee-settings.failed_employee_update')
          ;
         
          this.toast.error(errorMessage, 'Error!'); } 
      );
    // } else {
    //   this.userForm.markAllAsTouched();
    // }
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