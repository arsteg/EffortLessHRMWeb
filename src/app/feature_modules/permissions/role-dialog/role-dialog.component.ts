import { Component, inject, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthenticationService } from 'src/app/_services/authentication.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-role-dialog',
  templateUrl: './role-dialog.component.html',
})
export class RoleDialogComponent {
  private readonly translate = inject(TranslateService);
  roleForm: FormGroup;
  isEdit: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<RoleDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { role?: any; roles: any[] },
    private fb: FormBuilder,
    private authService: AuthenticationService
  ) {
    this.roleForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
    });

    if (data.role) {
      this.isEdit = true;
      this.roleForm.patchValue(data.role);
    }
  }

  onSubmit() {
    if (this.roleForm.valid) {
      const roleData = this.roleForm.value;
      if (this.isEdit) {
        this.authService.updateRole(this.data.role._id, roleData).subscribe(() => {
          this.dialogRef.close(true);
        });
      } else {
        this.authService.createRole(roleData).subscribe(() => {
          this.dialogRef.close(true);
        });
      }
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}