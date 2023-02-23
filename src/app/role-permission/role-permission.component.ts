import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { PermissionsService } from '../permissions/permissions.service';
import { PermissionModelService } from '../_services/permission-model.service';
import { RoleService } from '../_services/role.service';

@Component({
  selector: 'app-role-permission',
  templateUrl: './role-permission.component.html',
  styleUrls: ['./role-permission.component.css']
})
export class RolePermissionComponent implements OnInit {
  searchText = '';
  p: number = 1;
  allRolePermission: any[];
  selectedPermission: any;
  create_update_RolePermission: FormGroup;
  roles: any[];
  permission: any[];
  selectedRolePermissionId: string;
  public sortOrder: string = ''; // 'asc' or 'desc'

  constructor(private rolePermission: PermissionModelService,
    private fb: FormBuilder,
    private roleService: RoleService, 
    private permissionService: PermissionsService,
    private toastPermission: ToastrService) {
    this.create_update_RolePermission = this.fb.group({
      roleId: ['', Validators.required],
      permissionId: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.getAllRolePermissions();
    this.getRoles();
    this.getPermissions();
  }
  selectedRolePermission(rolePermission) {
    this.selectedPermission = rolePermission;
    console.log("Selected Role Permit",this.selectedPermission)
  }

  getAllRolePermissions() {
    this.rolePermission.getRolePermissions().subscribe(result => {
      this.allRolePermission = result.data;
    })
  }
  getRoles() {
    this.roleService.getAllRole().subscribe(result => {
      this.roles = result.data;
    })
  }

  getPermissions(){
    this.permissionService.getPermissions().subscribe(result => {
      this.permission = result && result.data && result.data['permissionList'];
      return result;
    })
  }
  addRolePermission(form) {
    this.rolePermission.createRolePermission(form).subscribe(result => {
      this.getAllRolePermissions();
      this.toastPermission.success('Role Permission', 'Successfully Added!')
    },
      err => {
        this.toastPermission.error('Can not be Added', 'ERROR!')
      })
  }

  updateRolePermission(form) {
    this.rolePermission.updateRolePermission(this.selectedPermission.id, form).subscribe(result => {
      this.getAllRolePermissions();
      this.toastPermission.success('Role Permission', 'Successfully Updated!')
    },
      err => {
        this.toastPermission.error('Can not be Added', 'ERROR!')
      })
  }

  deleteRolePermission(){
    this.rolePermission.deleteRolePermission(this.selectedPermission.id).subscribe(result => {
      this.getAllRolePermissions();
      this.toastPermission.success('Role Permission', 'Successfully Deleted!')
    },
      err => {
        this.toastPermission.error('Can not be Added', 'ERROR!')
      })
  }
}
