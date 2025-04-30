import { Component, inject, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthenticationService } from 'src/app/_services/authentication.service';
import { TranslateService } from '@ngx-translate/core';
import {ReactiveFormsModule} from '@angular/forms'; 
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-permission-dialog',
  templateUrl: './permission-dialog.component.html',
})
export class PermissionDialogComponent {
  private readonly translate = inject(TranslateService);
  permissionForm: FormGroup;
  isEdit: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<PermissionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { permission?: any; permissions: any[] },
    private fb: FormBuilder,
    private authService: AuthenticationService
  ) {
    this.permissionForm = this.fb.group({
      permissionName: ['', Validators.required],
      permissionDetails: [''],
      resource: ['', Validators.required],
      action: ['', Validators.required],
      uiElement: [''],
      parentPermission: [''],
    });

    if (data.permission) {
      this.isEdit = true;
      this.permissionForm.patchValue(data.permission);
    }
  }

  onSubmit() {
    if (this.permissionForm.valid) {
      const permissionData = this.permissionForm.value;
      if (this.isEdit) {
        this.authService.updatePermission(this.data.permission._id, permissionData).subscribe(() => {
          this.dialogRef.close(true);
        });
      } else {
        this.authService.createPermission(permissionData).subscribe(() => {
          this.dialogRef.close(true);
        });
      }
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}