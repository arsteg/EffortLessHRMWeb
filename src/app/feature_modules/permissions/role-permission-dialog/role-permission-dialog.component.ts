import { Component, inject, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthenticationService } from 'src/app/_services/authentication.service';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-role-permission-dialog',
  templateUrl: './role-permission-dialog.component.html',
})
export class RolePermissionDialogComponent {
  private readonly translate = inject(TranslateService);
  rolePermissionForm: FormGroup;
  isEdit: boolean = false;
  availableRoles: any[] = [];

  constructor(
    public dialogRef: MatDialogRef<RolePermissionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { rolePermission?: any; roles: any[]; permissions: any[], existingRolePermissions?: any[] },
    private fb: FormBuilder,
    private authService: AuthenticationService,
    private toastr: ToastrService
  ) {
    this.rolePermissionForm = this.fb.group({
      roleId: ['', Validators.required],
      permissionId: ['', Validators.required],
    });

    const assignedRoleIds = (data.existingRolePermissions || []).map(rp =>
      typeof rp.roleId === 'object' ? rp.roleId._id : rp.roleId
    );

    if (data.rolePermission) {
      this.isEdit = true;
      this.rolePermissionForm.patchValue({
        roleId: typeof data.rolePermission.roleId === 'object' ? data.rolePermission.roleId._id : data.rolePermission.roleId,
        permissionId: typeof data.rolePermission.permissionId === 'object' ? data.rolePermission.permissionId._id : data.rolePermission.permissionId
      });

      const currentRoleId = typeof data.rolePermission.roleId === 'object'
        ? data.rolePermission.roleId._id
        : data.rolePermission.roleId;

      // Allow current permission + unassigned permissions
      this.availableRoles = data.roles.filter(role =>
        !assignedRoleIds.includes(role._id) || role._id === currentRoleId
      );
    }
    else {
      this.availableRoles = data.roles.filter(role =>
        !assignedRoleIds.includes(role._id)
      );
    }
  }

  onSubmit() {
    if (this.rolePermissionForm.valid) {
      const rolePermissionData = this.rolePermissionForm.value;
      if (this.isEdit) {
        this.authService.updateRolePermission(this.data.rolePermission._id, rolePermissionData).subscribe({
          next: () => {
            this.dialogRef.close(true);
          },
          error: (error) => { 
            const errorMessage = error || 'Failed to update role permission';
            this.toastr.error(errorMessage);
          }
        });
      } else {
          this.authService.createRolePermission(rolePermissionData).subscribe({
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