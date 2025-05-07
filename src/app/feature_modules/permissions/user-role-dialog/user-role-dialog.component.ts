import { Component, inject, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthenticationService } from 'src/app/_services/authentication.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-user-role-dialog',
  templateUrl: './user-role-dialog.component.html',
})
export class UserRoleDialogComponent {
  userRoleForm: FormGroup;
  isEdit: boolean = false;
  availableUsers: any[] = [];

  constructor(
    public dialogRef: MatDialogRef<UserRoleDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { userRole?: any; users: any[]; roles: any[], existingUserRoles?: any[] },
    private fb: FormBuilder,
    private authService: AuthenticationService,
    private toastr: ToastrService
  ) {
    this.userRoleForm = this.fb.group({
      userId: ['', Validators.required],
      roleId: ['', Validators.required],
    });
    
    const assignedUserIds = (data.existingUserRoles || []).map(ur => typeof ur.userId === 'object' ? ur.userId._id : ur.userId);

    if (data.userRole) {
      this.isEdit = true;
      this.userRoleForm.patchValue({
        userId: typeof data.userRole.userId === 'object' ? data.userRole.userId._id : data.userRole.userId,
        roleId: typeof data.userRole.roleId === 'object' ? data.userRole.roleId._id : data.userRole.roleId
      });

      const currentUserId = typeof data.userRole.userId === 'object'
        ? data.userRole.userId._id
        : data.userRole.userId; 

      this.availableUsers = data.users.filter(user =>
        !assignedUserIds.includes(user._id) || user._id === currentUserId
      );
  }
  else {
    this.availableUsers = data.users.filter(user => !assignedUserIds.includes(user._id));
  }
}

  onSubmit() {
    if (this.userRoleForm.valid) {
      const userRoleData = this.userRoleForm.value;
      if (this.isEdit) {
        this.authService.updateUserRole(this.data.userRole._id, userRoleData).subscribe({
          next: () => {
            this.dialogRef.close(true);
          },
          error: (error) => { 
            const errorMessage = error || 'Failed to update user role';
            this.toastr.error(errorMessage);
          }
        });
      } else {
        this.authService.createUserRole(userRoleData).subscribe({
          next: () => {
            this.dialogRef.close(true);
          },
          error: (error) => { 
            const errorMessage = error || 'Failed to create role permission';
            this.toastr.error(errorMessage);
          }
        });
      }
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}