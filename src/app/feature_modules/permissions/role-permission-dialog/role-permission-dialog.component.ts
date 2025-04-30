import { Component, inject, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthenticationService } from 'src/app/_services/authentication.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-role-permission-dialog',
  templateUrl: './role-permission-dialog.component.html',
})
export class RolePermissionDialogComponent {
  private readonly translate = inject(TranslateService);
  rolePermissionForm: FormGroup;
  isEdit: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<RolePermissionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { rolePermission?: any; roles: any[]; permissions: any[] },
    private fb: FormBuilder,
    private authService: AuthenticationService
  ) {
    this.rolePermissionForm = this.fb.group({
      roleId: ['', Validators.required],
      permissionId: ['', Validators.required],
    });

    if (data.rolePermission) {
      this.isEdit = true;
      this.rolePermissionForm.patchValue(data.rolePermission);
    }
  }

  onSubmit() {
    if (this.rolePermissionForm.valid) {
      const rolePermissionData = this.rolePermissionForm.value;
      if (this.isEdit) {
        this.authService.updateRolePermission(this.data.rolePermission._id, rolePermissionData).subscribe(() => {
          this.dialogRef.close(true);
        });
      } else {
        this.authService.createRolePermission(rolePermissionData).subscribe(() => {
          this.dialogRef.close(true);
        });
      }
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}