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
  maxDate: Date;
  expandedPanels = {
    basic: true,
    personal: false,
    address: false,
    contact: false,
    emergency: false,
    bank: false,
    extra: false
  };
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
      extraDetails: ['', [Validators.maxLength(500)]],
      role: ['',[Validators.required]],
      email: ['', Validators.email],
      phone: [, [Validators.pattern('^[1-9][0-9]{9}$')]],
      mobile: [, [Validators.pattern('^[1-9][0-9]{9}$')]],
      pincode: [, [Validators.pattern('^[1-9][0-9]{5}$')]],
      emergancyContactName: ['', CustomValidators.labelValidatorWithEmptyAccept],
      emergancyContactNumber: ['', [CustomValidators.digitsOnly, CustomValidators.phoneNumber]],
      Gender: [''],
      DOB: ['', [CustomValidators.minimumAge(18)]],
      MaritalStatus: ['Unmarried'],
      MarraigeAniversary: [''],
      PassportDetails: ['', [CustomValidators.passportNumber]],
      Pancard: ['', [Validators.required, CustomValidators.panCard]],
      AadharNumber: ['', [Validators.required, CustomValidators.digitsOnly, CustomValidators.aadharNumber]],
      Disability: ['no'],
      FatherHusbandName: [''],
      NoOfChildren:  ['', [Validators.pattern('^(0|[1-9])$')]],
      BankName: ['', [Validators.required, CustomValidators.bankName]],
      BankAccountNumber: ['', [Validators.required, CustomValidators.digitsOnly, CustomValidators.bankAccountNumber]],
      BankIFSCCode: ['', [Validators.required, CustomValidators.ifscCode]],
      BankBranch: ['', [Validators.required, CustomValidators.bankBranch]],
      BankAddress: ['', [Validators.required, CustomValidators.bankAddress]]
    });
  }

  ngOnInit() {
    this.logUrlSegmentsForUser();
    const today = new Date();
    this.maxDate = new Date(today.setDate(today.getDate()));
   this.makeRoleDsabledIfinProfile();
    this.getRoles();
  }
makeRoleDsabledIfinProfile()
{
  if (this.router.url.includes('profile') && !this.router.url.includes('manage')) {
    this.userForm.get('role')?.disable();
  } else {
    this.userForm.get('role')?.enable();
  }
  
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
    this.userForm.get('role')?.enable();
    if (this.userForm.invalid) {
        this.userForm.markAllAsTouched();
        this.setExpandedPanelsForInvalidFields();
        this.focusFirstInvalidField();
        this.makeRoleDsabledIfinProfile();
        this.toast.error(this.translate.instant('common.missing_required_Field'), this.translate.instant('common.validation_error'));
        return;
    }
      this.userService.updateUser(this.selectedUser[0].id, this.userForm.value).subscribe(
        (res: any) =>  
          {
            this.toast.success(this.translate.instant('manage.users.employee-settings.employee_profile_updated'), this.translate.instant('common.success'))
            this.makeRoleDsabledIfinProfile();
          },
        (err) => { 
           const errorMessage = err?.error?.message || err?.message || err 
          || this.translate.instant('manage.users.employee-settings.failed_employee_update')
          ;
          this.makeRoleDsabledIfinProfile();
          this.toast.error(errorMessage, 'Error!'); } 
      );
  }

  setExpandedPanelsForInvalidFields() {
    // Reset all panels
    Object.keys(this.expandedPanels).forEach(key => this.expandedPanels[key] = false);
    const controls = this.userForm.controls;
    // Map controls to panels
    const panelMap = {
      basic: ['firstName', 'lastName', 'jobTitle', 'role', 'Gender'],
      personal: ['DOB', 'MaritalStatus', 'MarraigeAniversary', 'Pancard', 'AadharNumber', 'Disability', 'FatherHusbandName', 'NoOfChildren', 'PassportDetails'],
      address: ['address', 'city', 'state', 'pincode'],
      contact: ['phone', 'mobile', 'email'],
      emergency: ['emergancyContactName', 'emergancyContactNumber'],
      bank: ['BankName', 'BankAccountNumber', 'BankIFSCCode', 'BankBranch', 'BankAddress'],
      extra: ['extraDetails']
    };
    // Find all invalid panels
    const invalidPanels: string[] = [];
    for (const panel in panelMap) {
      if (panelMap[panel].some(ctrl => controls[ctrl] && controls[ctrl].invalid)) {
        invalidPanels.push(panel);
      }
    }

    // Always expand the first invalid panel
    const firstInvalidPanel = invalidPanels.length > 0 ? invalidPanels[0] : null;
    //const firstInvalidPanel = Object.keys(this.expandedPanels).find(key => this.expandedPanels[key]);
    if (firstInvalidPanel) {
      this.expandedPanels[firstInvalidPanel] = true;
    }
  }

  focusFirstInvalidField() {
    setTimeout(() => {
      const firstInvalid = document.querySelector('.ng-invalid');
      if (firstInvalid && typeof (firstInvalid as HTMLElement).focus === 'function') {
        (firstInvalid as HTMLElement).focus();
      }
    }, 100);
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