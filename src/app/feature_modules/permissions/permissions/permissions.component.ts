import { Component, inject, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { AuthenticationService } from 'src/app/_services/authentication.service';
import { TranslateService } from '@ngx-translate/core';
import { Role, Permission, UserRole, RolePermission } from 'src/app/models/permissions/permissions';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RoleDialogComponent } from '../role-dialog/role-dialog.component';
import { PermissionDialogComponent } from '../permission-dialog/permission-dialog.component';
import { UserRoleDialogComponent } from '../user-role-dialog/user-role-dialog.component';
import { RolePermissionDialogComponent } from '../role-permission-dialog/role-permission-dialog.component';
import { ExportService } from 'src/app/_services/export.service';
import { UserService } from 'src/app/_services/users.service';


@Component({
  selector: 'app-permissions',
  templateUrl: './permissions.component.html',
  styleUrls: ['./permissions.component.css']
})
export class PermissionsComponent implements OnInit {
  private readonly translate = inject(TranslateService);
  currentTab: number = 0;
  recordsPerPage: number = 10;
  currentPage: number = 1;
  totalRecords: number = 0;

  // Data sources for each tab
  rolesDataSource = new MatTableDataSource<Role>([]);
  permissionsDataSource = new MatTableDataSource<Permission>([]);
  userRolesDataSource = new MatTableDataSource<UserRole>([]);
  rolePermissionsDataSource = new MatTableDataSource<RolePermission>([]);
  groupedRolePermissions: { role: string, permissions: RolePermission[] }[] = [];

  // Displayed columns for each tab
  rolesColumns: string[] = ['name', 'description', 'actions'];
  permissionsColumns: string[] = ['permissionName', 'resource', 'action', 'uiElement', 'actions'];
  userRolesColumns: string[] = ['user', 'role', 'actions'];
  rolePermissionsColumns: string[] = ['role', 'permission', 'actions'];

  users: any[] = [];
  roles: Role[] = [];
  permissions: Permission[] = [];

  constructor(
    private authService: AuthenticationService,
    private dialog: MatDialog,
    private fb: FormBuilder,
    private exportService: ExportService,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.loadUsers();
    this.loadRoles();
    this.loadPermissions();
    this.loadUserRoles();
    this.loadRolePermissions();
    
  }

  switchTab(tabIndex: number) {
    this.currentTab = tabIndex;
    this.currentPage = 1;
    this.loadUsers();
    this.loadData();
  }

  loadData() {
    switch (this.currentTab) {
      case 0:
        this.loadRoles();
        break;
      case 1:
        this.loadPermissions();
        break;
      case 2:
        this.loadUserRoles();
        break;
      case 3:
        this.loadRolePermissions();
        break;
    }
  }

  loadRoles() {
    this.authService.getRoles().subscribe((res: any) => {
      this.rolesDataSource.data = res.data;
      this.roles = res.data;
      this.totalRecords = res.total || res.data.length;
    });
  }

  loadPermissions() {
    this.authService.getPermissions().subscribe((res: any) => {
      this.permissionsDataSource.data = res.data.permissionList;
      this.permissions = res.data.permissionList;
      this.totalRecords = res.total || res.data.length || res.data.permissionList.length;
    });
  }

  loadUserRoles() {
    this.authService.getUserRoles().subscribe((res: any) => {
      this.userRolesDataSource.data = res.data.map((ur: any) => ({
        ...ur,
        user: this.getUserName(ur.userId._id),
        role: this.getRoleName(ur.roleId._id),
      }));
      this.totalRecords = res.total || res.data.length;
    });
  }

  loadRolePermissions() {
    this.authService.getRolePermissions().subscribe((res: any) => {
      const data = res.data.map((rp: any) => ({
        ...rp,
        role: this.getRoleName(rp.roleId._id),
        permission: this.getPermissionName(rp.permissionId._id),
      }));
      const groupedMap = new Map<string, RolePermission[]>();
      data.forEach((item) => {
        const roleName = item.role;
        if (!groupedMap.has(roleName)) {
          groupedMap.set(roleName, []);
        }
        groupedMap.get(roleName)?.push(item);
      });
      this.groupedRolePermissions = Array.from(groupedMap.entries()).map(([role, permissions]) => ({
        role,
        permissions
      }));
      this.totalRecords = res.total || res.data.length;
    });
  }

  applyAccordionFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.toLowerCase();

    this.groupedRolePermissions = this.groupedRolePermissions.map(group => ({
      ...group,
      permissions: group.permissions.filter(p => 
        p.permissionId.permissionName.toLowerCase().includes(filterValue)
      )
    })).filter(group => group.permissions.length > 0);
  }

  loadUsers() {
    // Assuming a method to get users exists or needs to be added
    this.userService.getUserList().subscribe((res: any) => {
      this.users = res.data.data;
    });
  }

  applyFilter(event: Event, dataSource: MatTableDataSource<any>) {
    const filterValue = (event.target as HTMLInputElement).value;
    dataSource.filter = filterValue.trim().toLowerCase();
  }

  onPageChange(event: any, dataSource: MatTableDataSource<any>) {
    this.currentPage = event.pageIndex + 1;
    this.recordsPerPage = event.pageSize;
    this.loadData();
  }

  openAddEditDialog(type: 'role' | 'permission' | 'userRole' | 'rolePermission', item?: any) {
    let dialogRef;
    switch (type) {
      case 'role':
        dialogRef = this.dialog.open(RoleDialogComponent, {
          width: '500px',
          data: { role: item, roles: this.roles },
        });
        break;
      case 'permission':
        dialogRef = this.dialog.open(PermissionDialogComponent, {
          width: '500px',
          data: { permission: item, permissions: this.permissions },
        });
        break;
      case 'userRole':
        dialogRef = this.dialog.open(UserRoleDialogComponent, {
          width: '500px',
          data: { userRole: item, users: this.users, roles: this.roles, existingUserRoles: this.userRolesDataSource.data },
        });
        break;
      case 'rolePermission':
        dialogRef = this.dialog.open(RolePermissionDialogComponent, {
          width: '500px',
          data: { rolePermission: item, roles: this.roles, permissions: this.permissions, existingRolePermissions: this.rolePermissionsDataSource.data },
        });
        break;
    }

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadData();
      }
    });
  }

  deleteItem(type: 'role' | 'permission' | 'userRole' | 'rolePermission', id: string) {
    if (confirm(this.translate.instant('permissions.confirm_delete'))) {
      switch (type) {
        case 'role':
          this.authService.deleteRole(id).subscribe(() => this.loadRoles());
          break;
        case 'permission':
          this.authService.deletePermission(id).subscribe(() => this.loadPermissions());
          break;
        case 'userRole':
          this.authService.deleteUserRole(id).subscribe(() => this.loadUserRoles());
          break;
        case 'rolePermission':
          this.authService.deleteRolePermission(id).subscribe(() => this.loadRolePermissions());
          break;
      }
    }
  }

  getUserName(userId: string): string {
    const user = this.users.find(u => u._id === userId);
    return user ? `${user.firstName} ${user.lastName}` : 'Unknown';
  }

  getRoleName(roleId: string): string {
    const role = this.roles.find(r => r._id === roleId);
    return role ? role.name : 'Unknown';
  }

  getPermissionName(permissionId: string): string {
    const permission = this.permissions.find(p => p._id === permissionId);
    return permission ? permission.permissionName : 'Unknown';
  }

  exportToCsv() {
    const dataToExport = this.permissionsDataSource.data;
    this.exportService.exportToCSV('Permissions', '', dataToExport);
  }
}