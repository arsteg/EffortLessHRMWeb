import { Component, inject, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthenticationService } from 'src/app/_services/authentication.service';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input'; 
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';

import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar } from '@angular/material/snack-bar';  

@Component({
  selector: 'app-user-role-dialog',
  templateUrl: './user-role-dialog.component.html',
})
export class UserRoleDialogComponent {
  private readonly translate = inject(TranslateService);
  userRoleForm: FormGroup;
  isEdit: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<UserRoleDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { userRole?: any; users: any[]; roles: any[] },
    private fb: FormBuilder,
    private authService: AuthenticationService
  ) {
    this.userRoleForm = this.fb.group({
      userId: ['', Validators.required],
      roleId: ['', Validators.required],
    });

    if (data.userRole) {
      this.isEdit = true;
      this.userRoleForm.patchValue(data.userRole);
    }
  }

  onSubmit() {
    if (this.userRoleForm.valid) {
      const userRoleData = this.userRoleForm.value;
      if (this.isEdit) {
        this.authService.updateUserRole(this.data.userRole._id, userRoleData).subscribe(() => {
          this.dialogRef.close(true);
        });
      } else {
        this.authService.createUserRole(userRoleData).subscribe(() => {
          this.dialogRef.close(true);
        });
      }
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}